/**
 * One Analytics Engine data point per /api/ request, for request counts, error
 * rates and latency by path and status. Query them with SQL in the dashboard
 * (Workers & Pages → Analytics Engine) or the API; docs/runbook.md has examples.
 * Holds no personal data: path, method, status, outcome and milliseconds only.
 */

export interface AnalyticsEngine {
  writeDataPoint(point: { blobs?: string[]; doubles?: number[]; indexes?: string[] }): void;
}

export interface RequestMetric {
  path: string;
  method: string;
  status: number;
  /** A short word for what happened: sent, invalid, rate_limited, resend_failed, … */
  outcome: string;
  ms: number;
  /** Milliseconds spent waiting for Resend, when the request sent an email. */
  resendMs?: number;
}

/** Writes the point when the binding exists. Never throws: metrics must not break a request. */
export function recordRequest(dataset: AnalyticsEngine | undefined, metric: RequestMetric): void {
  if (!dataset) return;
  try {
    dataset.writeDataPoint({
      indexes: [metric.path],
      blobs: [metric.method, String(metric.status), metric.outcome],
      doubles: [metric.ms, metric.status >= 500 ? 1 : 0, metric.resendMs ?? 0],
    });
  } catch {
    // A full or unavailable dataset drops the point; the answer to the visitor matters more.
  }
}

/** The outcome word for a status of /api/contact. */
export function contactOutcome(status: number): string {
  return (
    {
      200: 'sent',
      400: 'invalid',
      403: 'cross_site',
      405: 'method',
      413: 'too_large',
      429: 'rate_limited',
      502: 'resend_failed',
      503: 'unavailable',
    }[status] ?? 'other'
  );
}
