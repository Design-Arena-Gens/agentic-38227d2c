const STOPWORDS = new Set([
  'the','is','and','or','of','to','a','in','on','for','with','how','what','when','why','your','you','my','our','it','be','do','we','can'
]);

export type QA = { q: string; a: string };

const FAQS: QA[] = [
  {
    q: 'When is my next cleaning?',
    a: 'We recommend cleaning every 4-8 weeks depending on dust and bird activity. If you have a service plan, your next visit is scheduled within your agreed frequency. Contact support with your site name for the exact date.'
  },
  {
    q: 'Why is my output low after cleaning?',
    a: 'Output can be affected by weather (clouds), shading, inverter curtailment, or soiling not on modules (e.g., on sensors). Check for faults and review generation in comparable sunny conditions.'
  },
  {
    q: 'Do you work during rain?',
    a: 'We avoid cleaning during rain for safety and quality. Jobs may be rescheduled based on forecasted rain probability.'
  },
  {
    q: 'How do you price quotes?',
    a: 'We price based on a call-out fee, per-panel rate, travel distance, and roof difficulty, plus VAT (15%).'
  },
  {
    q: 'What is included in the report?',
    a: 'Technician, duration, pre/post generation (kWh) if provided, and observations, formatted into a client-ready PDF.'
  }
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t && !STOPWORDS.has(t));
}

function scoreQueryToDoc(q: string, doc: string): number {
  const qtoks = tokenize(q);
  const dtoks = tokenize(doc);
  const dset = new Set(dtoks);
  let overlap = 0;
  for (const t of qtoks) if (dset.has(t)) overlap++;
  return overlap / Math.max(1, qtoks.length);
}

export function answerQuestion(question: string): string {
  let best = FAQS[0];
  let bestScore = -1;
  for (const qa of FAQS) {
    const s = Math.max(scoreQueryToDoc(question, qa.q), scoreQueryToDoc(question, qa.a));
    if (s > bestScore) {
      best = qa;
      bestScore = s;
    }
  }
  if (bestScore < 0.2) {
    return 'Please share your site name and question details. Typical FAQs: scheduling, pricing, performance after cleaning, and reporting.';
  }
  return best.a;
}
