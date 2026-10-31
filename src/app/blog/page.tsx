// app/blog/page.tsx
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import Image from 'next/image'
import { getSiteSettings } from '@/lib/site-settings'

export async function generateMetadata(): Promise<Metadata> {
  const { siteName, siteUrl } = await getSiteSettings()
  return {
  title: `Blog — Satellite Tracking Guides & Space Insights | ${siteName}`,
  description:
    `Explainers and guides on satellite tracking, orbital mechanics, TLE data, and how to spot the ISS — from the team behind ${siteName}.`,
  keywords: [
    'satellite tracking blog',
    'how to track satellites',
    'ISS spotting guide',
    'orbital mechanics explained',
    'TLE data explained',
    'satellite tracker tips',
    'starlink tracking',
    `${siteName} blog`,
  ],
  alternates: { canonical: `${siteUrl}/blog` },
  openGraph: {
    title: `Blog — Satellite Tracking Guides & Space Insights | ${siteName}`,
    description:
      'Explainers and guides on satellite tracking, orbital mechanics, and how to spot the ISS.',
    url: `${siteUrl}/blog`,
    type: 'website',
    siteName: siteName,
    images: [
      {
        url: `${siteUrl}/og-blog.png`,
        width: 1200,
        height: 630,
        alt: `${siteName} Blog — Satellite Tracking Guides`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Blog — Satellite Tracking Guides & Space Insights | ${siteName}`,
    description:
      'Explainers and guides on satellite tracking, orbital mechanics, and how to spot the ISS.',
    images: [`${siteUrl}/og-blog.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
}
}

const makeJsonLd = (siteName: string, siteUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: `${siteName} Blog`,
  description:
    'Guides and explainers on satellite tracking, orbital mechanics, and live orbital data.',
  url: `${siteUrl}/blog`,
  publisher: {
    '@type': 'Organization',
    name: siteName,
    url: `${siteUrl}`,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/logo.png`,
    },
  },
})

export const revalidate = 0

export default async function BlogPage() {
  const { siteName, siteUrl } = await getSiteSettings()
  const jsonLd = makeJsonLd(siteName, siteUrl)
  const { data: posts, error } = await supabase
    .from('blogs')
    .select('id, slug, title, excerpt, category, published_at, image_url, author_name')
    .eq('is_live', true)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Supabase Error:', error.message)
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen pt-24 pb-20 px-4 bg-[#05070c]">
        <div className="max-w-7xl mx-auto">

          {/* ── Header ── */}
          <div className="text-center mb-14">
            <p className="text-[#8fe7f2] font-bold tracking-[0.2em] uppercase text-[11px] mb-3">
              {siteName} Blog
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Notes From Orbit
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm">
              Explainers, guides, and deep dives on satellite tracking, orbital mechanics, and how
              to make sense of the data behind the map.
            </p>
          </div>

          {/* ── Uniform Blog Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts?.map((post, index) => (
              <article
                key={post.id}
                className="rounded-2xl overflow-hidden flex flex-col group border border-white/5 hover:border-[#4fd8eb]/30 transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="block relative h-52 overflow-hidden bg-[#0a0e18] flex-shrink-0"
                >
                  {post.image_url ? (
                    <Image
                      src={post.image_url}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority={index < 3}
                      loading={index < 3 ? 'eager' : 'lazy'}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#0a0e18]" />
                  )}
                </Link>

                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="bg-[#4fd8eb]/10 text-[#8fe7f2] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                      {post.category || 'Satellite Tracking'}
                    </span>
                    <span className="text-gray-500 text-[11px]">
                      {new Date(post.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold mb-2 text-white group-hover:text-[#8fe7f2] transition-colors leading-snug line-clamp-2">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>

                  <p className="text-gray-400 text-sm leading-relaxed mb-5 line-clamp-2 flex-grow">
                    {post.excerpt}
                  </p>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-[#8fe7f2] text-sm font-bold inline-flex items-center gap-1 mt-auto hover:gap-2 transition-all"
                  >
                    Read article →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {(!posts || posts.length === 0) && (
            <p className="text-center text-gray-500 mt-20">No posts yet. Check back soon.</p>
          )}
        </div>
      </main>
    </>
  )
}
