// Sanity CMS integration - configure after deployment
// To enable: npm install @sanity/client @sanity/image-url
// Then add NEXT_PUBLIC_SANITY_PROJECT_ID to Vercel env vars

export const queries = {
  doctor: `*[_type == "doctor"][0]`,
  treatments: `*[_type == "treatment"] | order(order asc)`,
  testimonials: `*[_type == "testimonial"] | order(date desc)`,
  posts: `*[_type == "post"] | order(publishedAt desc)`,
  gallery: `*[_type == "galleryItem"] | order(order asc)`,
}

export async function fetchFromCMS(_query: string) {
  return null
}
