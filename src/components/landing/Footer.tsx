"use client";

import Link from "next/link";

type FooterColumnProps = {
  title: string;
  links: {
    text: string;
    href: string;
    isExternal?: boolean;
  }[];
};

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div className="px-6">
      <h3 className="font-semibold text-sm mb-4">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.text}>
            <Link
              href={link.href}
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-400 transition-colors duration-200"
              target={link.isExternal ? "_blank" : undefined}
              rel={link.isExternal ? "noopener noreferrer" : undefined}
            >
              {link.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const columns: FooterColumnProps[] = [
    {
      title: "Resources",
      links: [
        { text: "User Guide", href: "/" },
        { text: "Changelog", href: "/" },
        { text: "FAQs", href: "/faq" },
        { text: "Discord Community", href: "https://discord.gg/bzTEStMhER", isExternal: true },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "Careers", href: "/careers", isExternal: true },
        { text: "Support", href: "mailto:support@ragable.ca", isExternal: true },
        { text: "Contact", href: "mailto:team@ragable.ca", isExternal: true },
      ],
    },
    {
      title: "Product",
      links: [
        { text: "Web App", href: "/" },
        { text: "Open Source", href: "https://github.com/ragable-dev" },
      ],
    },
    {
      title: "Legal",
      links: [
        { text: "Terms of Service", href: "/tos" },
        { text: "Privacy Policy", href: "/privacy-policy" },
      ],
    },
    {
      title: "Socials",
      links: [
        { text: "X (Twitter)", href: "", isExternal: true },
        { text: "Instagram", href: "", isExternal: true },
        { text: "TikTok", href: "", isExternal: true },
        { text: "LinkedIn", href: "https://www.linkedin.com/company/ragable", isExternal: true },
      ],
    },
  ];

  return (
    <footer className="bg-white dark:bg-neutral-900 py-12 border-t border-gray-100 dark:border-neutral-800">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {columns.map((column) => (
            <FooterColumn
              key={column.title}
              title={column.title}
              links={column.links}
            />
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center">
          <Link href="/" className="font-bold text-xl mb-4 md:mb-0">
            Ragable
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-100">&copy; 2025 Ragable</p>
        </div>
      </div>
    </footer>
  );
}
