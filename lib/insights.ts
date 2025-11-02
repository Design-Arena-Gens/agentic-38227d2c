export type InsightResult = {
  averageIncreasePercent: number | null;
  averageDeltaKwh: number | null;
  pValueApprox: number | null;
  recommendation: string;
};

function mean(arr: number[]): number { return arr.reduce((a,b)=>a+b,0)/arr.length; }
function stddev(arr: number[], m: number): number {
  const v = arr.reduce((a,b)=>a+(b-m)*(b-m),0)/Math.max(1,arr.length-1);
  return Math.sqrt(v);
}

function normalCdf(z: number): number {
  // Abramowitz-Stegun approximation for Phi(z)
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * (((((1.330274429 * t - 1.821255978) * t) + 1.781477937) * t - 0.356563782) * t + 0.319381530) * t;
  return z >= 0 ? 1 - p : p;
}

export function analyzePerformance(pre: number[], post: number[]): InsightResult {
  const n = Math.min(pre.length, post.length);
  if (n === 0) return { averageIncreasePercent: null, averageDeltaKwh: null, pValueApprox: null, recommendation: 'Provide pre and post arrays.' };
  const d: number[] = [];
  for (let i = 0; i < n; i++) d.push(post[i] - pre[i]);
  const m = mean(d);
  const avgPre = mean(pre.slice(0, n));
  const sd = stddev(d, m);
  let pValueApprox: number | null = null;
  if (sd > 0 && n > 1) {
    const t = m / (sd / Math.sqrt(n));
    const pTwoTailed = 2 * (1 - normalCdf(Math.abs(t))); // normal approx
    pValueApprox = Math.max(0, Math.min(1, pTwoTailed));
  }
  const averageIncreasePercent = avgPre !== 0 ? (m / avgPre) * 100 : null;
  const averageDeltaKwh = m;

  let recommendation = 'Performance looks consistent.';
  if (averageIncreasePercent !== null) {
    if (averageIncreasePercent < 5) recommendation = 'Consider shorter cleaning intervals or inspect for shading/faults.';
    else if (averageIncreasePercent < 10) recommendation = 'Moderate improvement; maintain schedule and monitor weekly.';
    else recommendation = 'Strong improvement; current cleaning cadence is effective.';
  }

  return { averageIncreasePercent, averageDeltaKwh, pValueApprox, recommendation };
}
