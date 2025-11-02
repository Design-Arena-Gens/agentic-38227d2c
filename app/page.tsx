import Link from 'next/link';

export default function HomePage() {
  const cards = [
    { href: '/scheduler', title: 'Job Scheduling & Routes', desc: 'Plan routes by SLA, weather, irradiance' },
    { href: '/reporting', title: 'Automated Reporting', desc: 'Generate client-ready reports from notes' },
    { href: '/chat', title: 'Client FAQ Bot', desc: 'Answer client queries with retrieval' },
    { href: '/insights', title: 'Performance Insights', desc: 'Compare pre/post cleaning energy' },
    { href: '/quote', title: 'Quotation Generator', desc: 'Create quotes with VAT' },
  ];
  return (
    <div>
      <h1>Solar Ops AI Suite</h1>
      <p>South African Solar PV Panel Cleaning Operations Toolkit</p>
      <div className="grid">
        {cards.map((c) => (
          <Link className="card" href={c.href} key={c.href}>
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
