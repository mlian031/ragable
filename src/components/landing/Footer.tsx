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
              className="text-sm text-gray-600 hover:text-gray-900"
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
        { text: "User Guide", href: "/guide" },
        { text: "Changelog", href: "/changelog" },
        { text: "FAQs", href: "/faqs" },
        { text: "Discord Community", href: "", isExternal: true },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "Careers", href: "", isExternal: true },
        { text: "Support", href: "/" },
        { text: "Contact", href: "", isExternal: true },
      ],
    },
    {
      title: "Product",
      links: [
        { text: "Web App", href: "/" },
        { text: "Open Source", href: "/" },
      ],
    },
    {
      title: "Legal",
      links: [
        { text: "Terms", href: "/terms" },
        { text: "Privacy", href: "/privacy" },
      ],
    },
    {
      title: "Socials",
      links: [
        { text: "X (Twitter)", href: "", isExternal: true },
        { text: "Instagram", href: "", isExternal: true },
        { text: "TikTok", href: "", isExternal: true },
        { text: "LinkedIn", href: "", isExternal: true },
      ],
    },
  ];

  return (
    <footer className="bg-white py-12 border-t border-gray-100">
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
          <p className="text-sm text-gray-500">&copy; 2025 Ragable</p>
        </div>
      </div>
    </footer>
  );
}
