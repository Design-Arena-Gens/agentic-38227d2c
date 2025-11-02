"use client";

import { useMemo, useState } from 'react';
import { generateQuote, QuoteInput, renderQuoteHtml } from '../../lib/quote';
import jsPDF from 'jspdf';

export default function QuotePage() {
  const [input, setInput] = useState<QuoteInput>({
    clientName: 'Sunrise Retail',
    siteAddress: '123 Rivonia Rd, Sandton',
    panelCount: 500,
    systemSizeKw: 250,
    roofType: 'metal',
    distanceKm: 35,
    frequency: 'bi-monthly'
  });

  const quote = useMemo(()=>generateQuote(input), [input]);
  const html = useMemo(()=>renderQuoteHtml(input, quote), [input, quote]);

  const exportPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    let y = 40, x = 40, line = 18;
    doc.setFont('helvetica','bold'); doc.setFontSize(18); doc.text('Quotation', x, y); y += line * 1.5;
    doc.setFont('helvetica','normal'); doc.setFontSize(11);
    doc.text(`${input.clientName} ? ${input.siteAddress}`, x, y); y += line * 1.5;
    quote.items.forEach(it => { doc.text(it.description, x, y); doc.text(it.amount.toFixed(2)+' ZAR', 555, y, { align:'right' as any }); y += line; });
    y += line; doc.text('Subtotal', x, y); doc.text(quote.subtotal.toFixed(2)+' ZAR', 555, y, { align:'right' as any });
    y += line; doc.text('VAT (15%)', x, y); doc.text(quote.vat.toFixed(2)+' ZAR', 555, y, { align:'right' as any });
    y += line; doc.setFont('helvetica','bold'); doc.text('Total', x, y); doc.text(quote.total.toFixed(2)+' ZAR', 555, y, { align:'right' as any });
    doc.save(`quote_${input.clientName.replace(/\s+/g,'_')}.pdf`);
  };

  return (
    <div>
      <h1>Quotation Generator</h1>
      <div className="section">
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
          <div>
            <label>Client Name</label>
            <input value={input.clientName} onChange={e=>setInput({...input, clientName: e.target.value})} />
          </div>
          <div>
            <label>Site Address</label>
            <input value={input.siteAddress} onChange={e=>setInput({...input, siteAddress: e.target.value})} />
          </div>
          <div>
            <label>Panel Count</label>
            <input type="number" value={input.panelCount} onChange={e=>setInput({...input, panelCount: parseInt(e.target.value,10)||0})} />
          </div>
          <div>
            <label>System Size (kW)</label>
            <input type="number" value={input.systemSizeKw ?? ''} onChange={e=>setInput({...input, systemSizeKw: Number(e.target.value)})} />
          </div>
          <div>
            <label>Roof Type</label>
            <select value={input.roofType} onChange={e=>setInput({...input, roofType: e.target.value as any})}>
              <option value="metal">Metal</option>
              <option value="tile">Tile</option>
              <option value="thatch">Thatch</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label>Distance (km)</label>
            <input type="number" value={input.distanceKm} onChange={e=>setInput({...input, distanceKm: Number(e.target.value)})} />
          </div>
          <div>
            <label>Frequency</label>
            <select value={input.frequency} onChange={e=>setInput({...input, frequency: e.target.value as any})}>
              <option value="once-off">Once-off</option>
              <option value="monthly">Monthly</option>
              <option value="bi-monthly">Bi-monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
        </div>
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button onClick={exportPdf}>Export PDF</button>
          <button className="secondary" onClick={()=>window.print()}>Print</button>
        </div>
      </div>
      <div className="section">
        <h3>Preview</h3>
        <div dangerouslySetInnerHTML={{__html: html}} />
      </div>
    </div>
  );
}
