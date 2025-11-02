export type ReportData = {
  siteName: string;
  date: string; // YYYY-MM-DD
  technician: string;
  durationMinutes?: number;
  preKwh?: number;
  postKwh?: number;
  notes?: string;
};

export function parseNotesToReport(text: string): ReportData {
  const norm = text.replace(/\r/g, '');
  const get = (re: RegExp) => {
    const m = norm.match(re);
    return m ? m[1].trim() : undefined;
  };
  const siteName = get(/(?:Site|Client|Location):\s*([^\n]+)/i) || 'Unknown Site';
  const date = get(/(?:Date):\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}\/[0-9]{2}\/[0-9]{4})/i) || new Date().toISOString().slice(0, 10);
  const technician = get(/(?:Tech|Technician):\s*([^\n]+)/i) || 'Unspecified';

  const toNum = (s?: string) => (s ? Number(String(s).replace(/[^0-9.\-]/g, '')) : undefined);
  const preKwh = toNum(get(/(?:Pre|Before)\s*(?:kWh|energy|gen):\s*([^\n]+)/i));
  const postKwh = toNum(get(/(?:Post|After)\s*(?:kWh|energy|gen):\s*([^\n]+)/i));
  const durationMinutes = toNum(get(/(?:Duration|Time on site):\s*([^\n]+)/i));

  const notes = get(/(?:Notes|Observations|Findings):\s*([\s\S]+)/i);

  return { siteName, date, technician, durationMinutes, preKwh, postKwh, notes };
}

export function renderReportHtml(data: ReportData): string {
  const delta =
    typeof data.preKwh === 'number' && typeof data.postKwh === 'number'
      ? data.postKwh - data.preKwh
      : undefined;
  const pct =
    typeof data.preKwh === 'number' && typeof data.postKwh === 'number' && data.preKwh !== 0
      ? ((data.postKwh - data.preKwh) / data.preKwh) * 100
      : undefined;

  const fmt = (n?: number, unit = '') => (typeof n === 'number' ? `${n.toFixed(2)}${unit}` : '?');

  return `
  <div style="font-family: Arial, sans-serif; color: #0f172a;">
    <h1 style="margin:0">Cleaning Report</h1>
    <p style="margin:4px 0 12px 0; color:#334155">${data.date} ? ${data.siteName}</p>
    <table style="border-collapse: collapse; width: 100%; margin-bottom:12px">
      <tr>
        <th style="text-align:left;border:1px solid #e2e8f0;padding:8px;background:#f8fafc">Technician</th>
        <td style="border:1px solid #e2e8f0;padding:8px">${data.technician}</td>
      </tr>
      <tr>
        <th style="text-align:left;border:1px solid #e2e8f0;padding:8px;background:#f8fafc">Duration</th>
        <td style="border:1px solid #e2e8f0;padding:8px">${fmt(data.durationMinutes, ' min')}</td>
      </tr>
      <tr>
        <th style="text-align:left;border:1px solid #e2e8f0;padding:8px;background:#f8fafc">Pre-Cleaning</th>
        <td style="border:1px solid #e2e8f0;padding:8px">${fmt(data.preKwh, ' kWh')}</td>
      </tr>
      <tr>
        <th style="text-align:left;border:1px solid #e2e8f0;padding:8px;background:#f8fafc">Post-Cleaning</th>
        <td style="border:1px solid #e2e8f0;padding:8px">${fmt(data.postKwh, ' kWh')}</td>
      </tr>
      <tr>
        <th style="text-align:left;border:1px solid #e2e8f0;padding:8px;background:#f8fafc">Improvement</th>
        <td style="border:1px solid #e2e8f0;padding:8px">${
          delta !== undefined ? `${fmt(delta, ' kWh')} (${fmt(pct, '%')})` : '?'
        }</td>
      </tr>
    </table>
    ${data.notes ? `<h3 style="margin:8px 0 4px">Notes</h3><p style="white-space:pre-wrap">${
      data.notes
    }</p>` : ''}
  </div>
  `;
}
