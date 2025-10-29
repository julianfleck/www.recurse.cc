import Link from 'next/link';
import { ApiStatus } from './ApiStatus';

export function Footer() {
  const footerSections = [
    {
      title: 'Docs',
      links: [
        { name: 'FAQ', href: '/faq' },
        { name: 'Features', href: '/features' },
        { name: 'Technology', href: '/about' },
        { name: 'API Docs', href: 'https://docs.recurse.cc/api' },
        { name: 'Changelog', href: '/changelog' },
      ],
    },
    {
      title: 'Guides',
      links: [
        { name: 'Developers', href: '/guides/developers' },
        { name: 'Researchers', href: '/guides/researchers' },
        { name: 'Writers', href: '/guides/writers' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'Pricing', href: '/pricing' },
        { name: 'About', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Contact Us', href: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/legal#privacy-policy' },
        { name: 'Impressum', href: '/legal#impressum' },
        { name: 'Legal', href: '/legal' },
      ],
    },
  ];

  return (
    <footer className="border-border border-t bg-background">
      <div className="container mx-auto py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-8 grid grid-cols-2 gap-8 md:grid-cols-4">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-3 font-medium text-foreground">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        className="text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground"
                        href={link.href}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-start justify-between gap-4 border-border border-t pt-8 sm:flex-row sm:items-center">
            <ApiStatus />

            <div className="flex items-center gap-6">
              <Link
                className="text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground"
                href="https://github.com/recurse-cc"
                rel="noopener noreferrer"
                target="_blank"
              >
                GitHub
              </Link>
              <Link
                className="text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground"
                href="https://twitter.com/recurse_cc"
                rel="noopener noreferrer"
                target="_blank"
              >
                Twitter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
