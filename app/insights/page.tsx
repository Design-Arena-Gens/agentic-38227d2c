"use client";

import { useMemo, useState } from 'react';
import { analyzePerformance } from '../../lib/insights';

function parseNumbers(text: string): number[] {
  return text
    .split(/[,\n\s]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => Number(t))
    .filter((n) => !isNaN(n));
}

export default function InsightsPage() {
  const [pre, setPre] = useState('120, 118, 119, 121, 122');
  const [post, setPost] = useState('132, 129, 131, 135, 134');

  const preArr = useMemo(()=>parseNumbers(pre), [pre]);
  const postArr = useMemo(()=>parseNumbers(post), [post]);
  const r = useMemo(()=>analyzePerformance(preArr, postArr), [preArr, postArr]);

  return (
    <div>
      <h1>Performance Insights</h1>
      <div className="section">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div>
            <label>Pre-Cleaning kWh (comma or newline separated)</label>
            <textarea rows={8} value={pre} onChange={e=>setPre(e.target.value)} />
          </div>
          <div>
            <label>Post-Cleaning kWh (comma or newline separated)</label>
            <textarea rows={8} value={post} onChange={e=>setPost(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="section">
        <h3>Results</h3>
        <table className="table">
          <tbody>
            <tr><th>Average delta (kWh)</th><td>{r.averageDeltaKwh !== null ? r.averageDeltaKwh.toFixed(2) : '?'}</td></tr>
            <tr><th>Average increase (%)</th><td>{r.averageIncreasePercent !== null ? r.averageIncreasePercent.toFixed(2)+'%' : '?'}</td></tr>
            <tr><th>Significance (p?)</th><td>{r.pValueApprox !== null ? r.pValueApprox.toFixed(3) : '?'}</td></tr>
          </tbody>
        </table>
        <p><strong>Recommendation:</strong> {r.recommendation}</p>
      </div>
    </div>
  );
}
