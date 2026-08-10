import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Calendar, User } from 'lucide-react'
import fs from 'fs'
import path from 'path'

// Fetch statically during build or on demand
async function getPostData(slug: string) {
  const file = path.join(process.cwd(), 'data', 'site-content.json')
  try {
    const raw = fs.readFileSync(file, 'utf-8')
    const data = JSON.parse(raw)
    const blogs = data.blog || []
    const post = blogs.find((b: any) => b.slug === slug)
    return { post, doctor: data.doctor || {} }
  } catch (err) {
    return { post: null, doctor: {} }
  }
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { post, doctor } = await getPostData(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-ivory pt-32 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-charcoal-muted hover:text-gold transition mb-8">
          <ArrowLeft size={16} />
          Back to Blog
        </Link>
        
        <article className="bg-white rounded-3xl overflow-hidden shadow-sm border border-cream-dark">
          {post.imageUrl && (
            <div className="w-full h-64 md:h-96 relative">
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-4 text-xs text-charcoal-muted font-medium uppercase tracking-widest mb-6">
              <span className="text-gold-dark">{post.category}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} /> {post.date}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Clock size={14} /> {post.readTime}</span>
            </div>
            
            <h1 className="font-playfair text-3xl md:text-5xl text-charcoal mb-6 leading-tight">{post.title}</h1>
            
            <div className="flex items-center gap-3 mb-10 pb-10 border-b border-cream">
              <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center">
                <User size={18} className="text-gold-dark" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal">{doctor.name || 'Author'}</p>
                <p className="text-xs text-charcoal-muted">{doctor.title || 'Specialist'}</p>
              </div>
            </div>
            
            {/* The blog body content (placeholder if none exists) */}
            <div className="prose prose-lg prose-headings:font-playfair prose-headings:text-charcoal prose-p:text-charcoal-muted prose-a:text-gold max-w-none">
              {post.body ? (
                <div dangerouslySetInnerHTML={{ __html: post.body }} />
              ) : (
                <>
                  <p className="lead text-xl mb-6">{post.excerpt}</p>
                  <p>More detailed content for this topic will be published soon. In the meantime, you can explore our treatments or book a consultation.</p>
                </>
              )}
            </div>
            
            <div className="mt-16 pt-8 border-t border-cream-dark">
              <div className="bg-gradient-to-br from-[#1a1a2e] to-[#12122a] rounded-2xl p-8 text-center text-white">
                <h3 className="font-playfair text-2xl mb-3">Ready to start your journey?</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">Book a consultation today to discuss your concerns with our specialist.</p>
                <Link href="/book" className="btn-gold px-8 py-3 rounded-full text-sm font-medium inline-block">
                  Book an Appointment
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
