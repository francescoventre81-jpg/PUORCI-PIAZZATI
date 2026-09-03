import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import {
  editorialNews,
  getEditorialNews,
} from "@/lib/editorial-data";
import { getPublishedArticle } from "@/lib/editorial-content";

export function generateStaticParams() {
  return editorialNews.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = (await getPublishedArticle(slug)) ?? getEditorialNews(slug);

  if (!article) return {};

  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: `/news/${article.slug}` },
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = (await getPublishedArticle(slug)) ?? getEditorialNews(slug);

  if (!article) notFound();

  return (
    <article className="fantasy-news-page">
      <div className="container fantasy-news-shell">
        <Link className="fantasy-news-back" href="/#news">
          <ArrowLeft size={17} /> Torna alle news
        </Link>

        <header className="fantasy-news-header">
          <div className="fantasy-news-meta">
            <span>{article.category}</span>
            <small>{article.publishedLabel}</small>
          </div>
          <h1>{article.title}</h1>
          <p>{article.summary}</p>
          <div className="fantasy-news-reliability">
            <ShieldCheck size={18} /> Affidabilità: {article.reliability}
          </div>
        </header>

        {article.imageUrl ? (
          <Image
            alt={article.title}
            className="fantasy-news-cover"
            height={720}
            priority
            src={article.imageUrl}
            unoptimized
            width={1280}
          />
        ) : null}

        <aside className="fantasy-takeaway">
          <span>IN BREVE · COSA FARE AL FANTACALCIO</span>
          <strong>{article.fantasyTakeaway}</strong>
        </aside>

        <div className="fantasy-news-body">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>

        <footer className="fantasy-news-sources">
          <span>Fonti consultate</span>
          <p>
            Questa è una sintesi originale PUORCIPIAZZATI. Le fonti sono riportate
            per permetterti di verificare le informazioni complete.
          </p>
          <div>
            {article.sources.map((source) => (
              <a href={source.url} key={source.url} rel="noopener noreferrer" target="_blank">
                {source.label} <ExternalLink size={15} />
              </a>
            ))}
          </div>
        </footer>
      </div>
    </article>
  );
}
