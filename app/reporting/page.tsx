"use client";

import { useMemo, useRef, useState } from 'react';
import { parseNotesToReport, renderReportHtml } from '../../lib/reporting';
import jsPDF from 'jspdf';

export default function ReportingPage() {
  const [notes, setNotes] = useState(`Site: Mall of Joburg\nDate: 2025-10-10\nTechnician: S. Nkosi\nPre kWh: 1250\nPost kWh: 1385\nDuration: 180\nObservations: Heavy bird droppings on north arrays. Cleaned all strings.`);
  const data = useMemo(()=>parseNotesToReport(notes), [notes]);
  const html = useMemo(()=>renderReportHtml(data), [data]);
  const containerRef = useRef<HTMLDivElement>(null);

  const exportPdf = async () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const left = 40, top = 40, line = 18;
    let y = top;
    doc.setFont('helvetica','bold'); doc.setFontSize(18); doc.text('Cleaning Report', left, y); y += 8;
    doc.setFont('helvetica','normal'); doc.setFontSize(11); y += line;
    doc.text(`${data.date} ? ${data.siteName}`, left, y); y += line * 1.5;
    const kv = [
      ['Technician', data.technician],
      ['Duration', data.durationMinutes ? `${data.durationMinutes} min` : '?'],
      ['Pre-Cleaning', data.preKwh !== undefined ? `${data.preKwh.toFixed(2)} kWh` : '?'],
      ['Post-Cleaning', data.postKwh !== undefined ? `${data.postKwh.toFixed(2)} kWh` : '?'],
    ];
    kv.forEach(([k,v]) => { doc.text(`${k}: ${v}`, left, y); y += line; });
    if (data.notes) { y += line; doc.text('Notes:', left, y); y += line; doc.setFontSize(10);
      const split = doc.splitTextToSize(data.notes, 515);
      doc.text(split as any, left, y); y += line * (split.length + 1);
    }
    doc.save(`report_${data.siteName.replace(/\s+/g,'_')}.pdf`);
  };

  return (
    <div>
      <h1>Automated Reporting</h1>
      <div className="section">
        <label>Technician notes / WhatsApp log</label>
        <textarea rows={10} value={notes} onChange={e=>setNotes(e.target.value)} />
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button onClick={exportPdf}>Export PDF</button>
          <button className="secondary" onClick={()=>window.print()}>Print</button>
        </div>
      </div>
      <div className="section">
        <h3>Preview</h3>
        <div ref={containerRef} dangerouslySetInnerHTML={{__html: html}} />
      </div>
    </div>
  );
}
