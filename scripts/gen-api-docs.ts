/**
 * Writes docs/api.md from docs/openapi.json, so the readable API reference cannot drift
 * from the spec that tests/openapi.test.ts checks against the Worker.
 * Run: npm run docs          (rewrite docs/api.md)
 *      npm run docs -- --check   (exit 1 when docs/api.md is out of date)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const specUrl = new URL('../docs/openapi.json', import.meta.url);
const outUrl = new URL('../docs/api.md', import.meta.url);

type Schema = {
  type?: string;
  const?: unknown;
  required?: string[];
  properties?: Record<string, Schema>;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  description?: string;
  $ref?: string;
};

const spec = JSON.parse(readFileSync(specUrl, 'utf8'));
const refName = (s: Schema) => s.$ref?.split('/').pop();
const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ');

function rules(s: Schema): string {
  const out: string[] = [];
  if (s.const !== undefined) out.push(`always \`${JSON.stringify(s.const)}\``);
  else if (s.type) out.push(s.type);
  if (s.minLength !== undefined) out.push(`at least ${s.minLength}`);
  if (s.maxLength !== undefined) out.push(`at most ${s.maxLength}`);
  if (s.pattern) out.push(`matches \`${s.pattern}\``);
  return out.join(', ');
}

function fieldTable(name: string): string[] {
  const s = spec.components.schemas[name] as Schema;
  const lines = [`### ${name}`, '', '| Field | Required | Rules | Meaning |', '|---|---|---|---|'];
  for (const [key, field] of Object.entries(s.properties ?? {})) {
    const required = s.required?.includes(key) ? 'yes' : 'no';
    lines.push(
      `| \`${key}\` | ${required} | ${cell(rules(field))} | ${cell(field.description ?? '')} |`,
    );
  }
  return [...lines, ''];
}

function render(): string {
  const lines: string[] = [
    '<!-- Generated from docs/openapi.json by scripts/gen-api-docs.ts. Edit the spec, then run `npm run docs`. -->',
    '',
    `# ${spec.info.title} ${spec.info.version}`,
    '',
    spec.info.description,
    '',
    'Servers:',
    '',
    ...spec.servers.map(
      (s: { url: string; description: string }) => `- \`${s.url}\`: ${s.description}`,
    ),
    '',
  ];
  for (const [path, item] of Object.entries(spec.paths) as [string, any][]) {
    for (const [method, op] of Object.entries(item).filter(([k]) => k !== 'description') as [
      string,
      any,
    ][]) {
      lines.push(
        `## ${method.toUpperCase()} ${path}`,
        '',
        op.summary + '.',
        '',
        op.description,
        '',
      );
      if (item.description) lines.push(item.description, '');
      const types = Object.entries(op.requestBody.content) as [string, { schema: Schema }][];
      lines.push(
        '**Request body:** ' +
          types.map(([type, c]) => `\`${type}\` (${refName(c.schema)})`).join(' or ') +
          '. ' +
          op.requestBody.description,
        '',
        '| Status | Body | Meaning |',
        '|---|---|---|',
      );
      for (const [status, res] of Object.entries(op.responses) as [string, any][]) {
        const body = res.content ? refName(res.content['application/json'].schema) : '';
        const headers = Object.entries(res.headers ?? {}).map(
          ([h, d]: [string, any]) => ` Header \`${h}\`: ${d.description}`,
        );
        lines.push(`| ${status} | ${body ?? ''} | ${cell(res.description + headers.join(''))} |`);
      }
      lines.push('');
    }
  }
  lines.push('## Schemas', '');
  for (const name of Object.keys(spec.components.schemas)) lines.push(...fieldTable(name));
  return lines.join('\n').replace(/\n+$/, '\n');
}

const next = render();
if (process.argv.includes('--check')) {
  if (!existsSync(outUrl) || readFileSync(outUrl, 'utf8') !== next) {
    console.error('docs/api.md is out of date with docs/openapi.json. Run `npm run docs`.');
    process.exit(1);
  }
  console.log('docs: docs/api.md matches docs/openapi.json');
} else {
  writeFileSync(outUrl, next);
  console.log('docs: wrote docs/api.md');
}
