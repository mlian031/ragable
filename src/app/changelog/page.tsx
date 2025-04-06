import fs from 'fs';
import path from 'path';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import matter from 'gray-matter';
import Footer from '@/components/landing/Footer';
import Header from '@/components/landing/Header';

interface ChangelogEntry {
  version?: string;
  date?: string;
  title?: string;
  content: string;
}

export default async function ChangelogPage() {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  const raw = fs.readFileSync(changelogPath, 'utf8');

  // Remove the top-level title
  const contentWithoutTitle = raw.replace(/^# .*\n/, '').trim();

  // Split on '---' blocks
  const parts = contentWithoutTitle.split(/^---\s*$/m).map(s => s.trim()).filter(Boolean);

  const entries: ChangelogEntry[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const fm = parts[i];
    const body = parts[i + 1] || '';
    const parsed = matter(`---\n${fm}\n---\n${body}`);
    const data = parsed.data as { version?: string; date?: string | Date; title?: string };
    entries.push({
      version: data.version,
      date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date,
      title: data.title,
      content: parsed.content.trim(),
    });
  }

  return (
    <>
    <Header/>
      <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-24">Changelog</h1>
      <div className="space-y-12">
        {entries.map((entry, idx) => (
          <div key={idx} className="flex items-start gap-x-6">
            {/* Date badge */}
            <div className="flex-shrink-0 mt-1 px-6">
              <span className="inline-block rounded-full border border-gray-600 bg-black px-3 py-1 font-mono text-xs text-gray-300">
                {entry.date || 'Date'}
              </span>
            </div>

          

            {/* Content */}
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">{entry.version || 'Version'}</h2>
              {entry.title && <h3 className="text-lg font-semibold mb-4">{entry.title}</h3>}
              <div className="prose prose-invert prose-lg changelog-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {entry.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
    <Footer/>
    </>
  );
}
