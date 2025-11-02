export type QuoteInput = {
  clientName: string;
  siteAddress: string;
  panelCount: number;
  systemSizeKw?: number;
  roofType: 'metal' | 'tile' | 'thatch' | 'other';
  distanceKm: number;
  frequency: 'once-off' | 'monthly' | 'bi-monthly' | 'quarterly';
};

export type LineItem = { description: string; amount: number };
export type Quote = { items: LineItem[]; subtotal: number; vat: number; total: number };

const VAT_RATE = 0.15; // 15% SA VAT

function roofMultiplier(roof: QuoteInput['roofType']): number {
  switch (roof) {
    case 'tile': return 1.15;
    case 'thatch': return 1.25;
    case 'metal': return 1.0;
    default: return 1.1;
  }
}

function frequencyDiscount(freq: QuoteInput['frequency']): number {
  switch (freq) {
    case 'monthly': return 0.9; // 10% discount
    case 'bi-monthly': return 0.94; // 6% discount
    case 'quarterly': return 0.97; // 3% discount
    default: return 1.0;
  }
}

export function generateQuote(input: QuoteInput): Quote {
  const items: LineItem[] = [];
  const callOut = 450; // ZAR
  items.push({ description: 'Call-out fee', amount: callOut });

  const perPanel = 12; // ZAR per panel
  const panelCost = perPanel * input.panelCount * roofMultiplier(input.roofType);
  items.push({ description: `Panel cleaning (${input.panelCount} panels)`, amount: panelCost });

  const excessKm = Math.max(0, input.distanceKm - 20);
  const travel = excessKm * 5; // R5/km beyond 20km
  if (travel > 0) items.push({ description: `Travel (${excessKm.toFixed(0)} km beyond 20km)`, amount: travel });

  let subtotal = items.reduce((a, i) => a + i.amount, 0);
  subtotal *= frequencyDiscount(input.frequency);

  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;

  return { items, subtotal, vat, total };
}

export function renderQuoteHtml(input: QuoteInput, q: Quote): string {
  return `
  <div style="font-family:Arial,sans-serif;color:#0f172a">
    <h1 style="margin:0">Quotation</h1>
    <p style="margin:4px 0 12px;color:#334155">${input.clientName} ? ${input.siteAddress}</p>
    <table style="border-collapse:collapse;width:100%;margin-bottom:12px">
      <thead>
        <tr>
          <th style="text-align:left;border:1px solid #e2e8f0;padding:8px;background:#f8fafc">Description</th>
          <th style="text-align:right;border:1px solid #e2e8f0;padding:8px;background:#f8fafc">Amount (ZAR)</th>
        </tr>
      </thead>
      <tbody>
        ${q.items.map(i => `<tr><td style=\"border:1px solid #e2e8f0;padding:8px\">${i.description}</td><td style=\"border:1px solid #e2e8f0;padding:8px;text-align:right\">${i.amount.toFixed(2)}</td></tr>`).join('')}
        <tr><td style="border:1px solid #e2e8f0;padding:8px;text-align:right;font-weight:600">Subtotal</td><td style="border:1px solid #e2e8f0;padding:8px;text-align:right">${q.subtotal.toFixed(2)}</td></tr>
        <tr><td style="border:1px solid #e2e8f0;padding:8px;text-align:right;font-weight:600">VAT (15%)</td><td style="border:1px solid #e2e8f0;padding:8px;text-align:right">${q.vat.toFixed(2)}</td></tr>
        <tr><td style="border:1px solid #e2e8f0;padding:8px;text-align:right;font-weight:800">Total</td><td style="border:1px solid #e2e8f0;padding:8px;text-align:right;font-weight:800">${q.total.toFixed(2)}</td></tr>
      </tbody>
    </table>
    <p style="color:#475569">Prices include standard cleaning. Roof type multiplier applied. Travel charged beyond 20 km. Valid for 14 days.</p>
  </div>
  `;
}
