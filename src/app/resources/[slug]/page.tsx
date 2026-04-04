import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BlogPostJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title_fr, excerpt_fr, cover_image, slug, published_at, is_published')
    .eq('slug', slug)
    .single();

  if (!post || !post.is_published) {
    return { title: 'Article | Palais Rouge Immo', robots: { index: false } };
  }

  const title = post.title_fr ?? 'Article';
  const description = post.excerpt_fr
    ? post.excerpt_fr.slice(0, 160)
    : "Conseils d'experts en immobilier de luxe à Marrakech. Palais Rouge Immo.";
  const url = `https://palaisrouge.online/resources/${slug}`;
  const image = post.cover_image ?? 'https://palaisrouge.online/og-blog.svg';

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'Palais Rouge Immo',
      publishedTime: post.published_at ?? undefined,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from('blog_posts')
    .select('id, title_fr, title_en, content_fr, excerpt_fr, cover_image, slug, published_at, created_at')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!post) notFound();

  const url = `https://palaisrouge.online/resources/${slug}`;
  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="pt-32 pb-20 bg-[var(--parchment)] min-h-screen">
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://palaisrouge.online' },
        { name: 'Blog', url: 'https://palaisrouge.online/resources' },
        { name: post.title_fr ?? '', url },
      ]} />
      <BlogPostJsonLd post={{
        title: post.title_fr,
        excerpt: post.excerpt_fr,
        cover_image: post.cover_image,
        slug: post.slug,
        published_at: post.published_at,
        updated_at: post.published_at,
      }} />

      <article className="max-w-3xl mx-auto px-4 md:px-8">
        <div className="mb-8">
          <Link
            href="/resources"
            className="text-sm text-[var(--stone)] hover:text-[var(--rouge)] transition-colors"
          >
            ← Retour au blog
          </Link>
        </div>

        {post.cover_image && (
          <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
            <Image
              src={post.cover_image}
              alt={post.title_fr ?? ''}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        <header className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[var(--noir)] mb-4 leading-tight">
            {post.title_fr}
          </h1>
          {publishedDate && (
            <time
              dateTime={post.published_at ?? ''}
              className="text-sm text-[var(--stone)]"
            >
              {publishedDate}
            </time>
          )}
          {post.excerpt_fr && (
            <p className="mt-4 text-lg text-[var(--charcoal)] leading-relaxed border-l-4 border-[var(--gold)] pl-4">
              {post.excerpt_fr}
            </p>
          )}
        </header>

        {post.content_fr && (
          <div
            className="prose prose-lg max-w-none text-[var(--charcoal)] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content_fr }}
          />
        )}

        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--rouge)] text-white rounded-xl hover:bg-[var(--rouge-dark)] transition-colors font-medium text-sm"
          >
            ← Tous les articles
          </Link>
        </div>
      </article>
    </div>
  );
}
