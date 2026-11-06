/**
 * Asks Analytics Engine how many /api/ requests ended in a 5xx over the last day,
 * grouped by path, status and outcome. Exits 1 when there was at least one, so
 * .github/workflows/errors.yml can open an issue with the table.
 * Run: CLOUDFLARE_ACCOUNT_ID=… CLOUDFLARE_ANALYTICS_TOKEN=… node scripts/error-report.ts
 * The token needs Account → Account Analytics → Read, nothing else.
 */
export const QUERY = `SELECT index1 AS path, blob2 AS status, blob3 AS outcome,
  SUM(_sample_interval) AS requests
FROM eugenius_works_api
WHERE double2 = 1 AND timestamp > NOW() - INTERVAL '1' DAY
GROUP BY path, status, outcome
ORDER BY requests DESC
FORMAT JSON`;

export interface ErrorRow {
  path: string;
  status: string;
  outcome: string;
  requests: number | string;
}

/** A table cell from stored data: no pipe or line break can break the table. */
function cell(value: unknown): string {
  return String(value)
    .replace(/[|\r\n]/g, ' ')
    .slice(0, 100);
}

/** Markdown for the issue, and the number of failed requests. */
export function summarizeErrors(rows: ErrorRow[]): { markdown: string; total: number } {
  const total = rows.reduce((sum, row) => sum + Number(row.requests), 0);
  if (total === 0) return { markdown: '### No 5xx answer from /api/ in the last 24 hours', total };
  const table = rows
    .map(
      (row) =>
        `| ${cell(row.path)} | ${cell(row.status)} | ${cell(row.outcome)} | ${Number(row.requests)} |`,
    )
    .join('\n');
  const markdown = [
    `### ${total} failed /api/ requests in the last 24 hours`,
    '',
    '| Path | Status | Outcome | Requests |',
    '| --- | --- | --- | ---: |',
    table,
    '',
    'The outcome word names the cause; docs/runbook.md says what to do for each, and the',
    "Worker's logs carry the request IDs.",
  ].join('\n');
  return { markdown, total };
}

async function main(): Promise<number> {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_ANALYTICS_TOKEN;
  if (!account || !token) {
    console.error('Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_ANALYTICS_TOKEN.');
    return 2;
  }
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/analytics_engine/sql`,
    { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: QUERY },
  );
  if (!response.ok) {
    console.error(`Analytics Engine answered ${response.status}: ${await response.text()}`);
    return 2;
  }
  const { data } = (await response.json()) as { data: ErrorRow[] };
  const { markdown, total } = summarizeErrors(data);
  console.log(markdown);
  return total > 0 ? 1 : 0;
}

if (import.meta.main) process.exit(await main());
