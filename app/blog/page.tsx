'use client'

import Link from 'next/link'
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react'
import CTASection from '@/components/sections/CTASection'
import { useSiteContent } from '@/hooks/useSiteContent'

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
  featured: boolean
  imageUrl?: string
}

export default function BlogPage() {
  const { data } = useSiteContent()
  const posts: BlogPost[] = data?.blog || []
  
  // Sort posts by date, most recent first
  const sortedPosts = [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  const featuredPosts = sortedPosts.filter(p => p.featured)
  const regularPosts = sortedPosts.filter(p => !p.featured)

  return (
    <>
      <section className="pt-32 pb-16 bg-ivory">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-10 bg-gold" />
            <span className="section-label">Expert Insights</span>
            <div className="h-px w-10 bg-gold" />
          </div>
          <h1 className="font-playfair text-5xl lg:text-6xl text-charcoal mb-5">
            Health & Beauty Blog
          </h1>
          <p className="text-charcoal-muted text-lg max-w-xl mx-auto leading-relaxed">
            Expert skin and dental health advice from Dr. Hadi Raza. Stay informed with the latest in dermatology and dental care.
          </p>
        </div>
      </section>

      <section className="py-12 bg-cream">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="font-playfair text-2xl text-charcoal mb-8">Featured Articles</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="luxury-card rounded-3xl overflow-hidden group h-full">
                  <div
                    className="h-52 flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: post.category === 'Dermatology'
                        ? 'linear-gradient(135deg, #E8E3D8 0%, #D6B98C30 100%)'
                        : 'linear-gradient(135deg, #E3E8E3 0%, #8CB9D630 100%)'
                    }}
                  >
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <span className="text-charcoal-muted/40 text-sm">Article Image — Add via Admin</span>
                    )}
                  </div>

                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="treatment-tag">{post.category}</span>
                      <span className="text-xs text-gold-dark font-semibold">Featured</span>
                    </div>
                    <h3 className="font-playfair text-xl text-charcoal font-medium mb-3 group-hover:text-gold-dark transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-charcoal-muted text-sm leading-relaxed mb-5">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-charcoal-muted">
                        <span className="flex items-center gap-1"><Calendar size={11} /> {post.date}</span>
                        <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime}</span>
                      </div>
                      <span className="text-gold-dark text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-ivory">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="font-playfair text-2xl text-charcoal mb-8">All Articles</h2>
          <div className="space-y-4">
            {regularPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="luxury-card rounded-2xl p-6 flex flex-col md:flex-row gap-6 group">
                  <div
                    className="w-full md:w-32 h-24 rounded-xl shrink-0 flex items-center justify-center relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #E8E3D8 0%, #D6B98C20 100%)' }}
                  >
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <Tag size={18} className="text-gold/40" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="treatment-tag text-xs">{post.category}</span>
                    </div>
                    <h3 className="font-playfair text-lg text-charcoal font-medium mb-2 group-hover:text-gold-dark transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-charcoal-muted text-sm leading-relaxed mb-3 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-charcoal-muted">
                      <span className="flex items-center gap-1"><Calendar size={11} /> {post.date}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center shrink-0">
                    <ArrowRight size={18} className="text-gold/50 group-hover:text-gold-dark group-hover:translate-x-1 transition-all" />
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
