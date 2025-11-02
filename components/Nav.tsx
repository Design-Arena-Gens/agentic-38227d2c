import Link from 'next/link';

export function Nav() {
  const items = [
    { href: '/scheduler', label: 'Scheduler' },
    { href: '/reporting', label: 'Reporting' },
    { href: '/chat', label: 'FAQ Bot' },
    { href: '/insights', label: 'Insights' },
    { href: '/quote', label: 'Quotes' },
  ];
  return (
    <nav>
      {items.map((i) => (
        <Link key={i.href} href={i.href}>{i.label}</Link>
      ))}
    </nav>
  );
}
