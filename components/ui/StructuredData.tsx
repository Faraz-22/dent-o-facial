export default function StructuredData() {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "Dent-O-Facial",
    "description": "Luxury dermatology and dental clinic in Purnea and Banmankhi, Bihar. Led by Dr. Hadi Raza, specialist in dermatology and dental surgery.",
    "url": "https://dentofacial.in",
    "telephone": "+91-98765-43210",
    "priceRange": "₹₹",
    "medicalSpecialty": ["Dermatology", "Dental Surgery"],
    "address": [
      {
        "@type": "PostalAddress",
        "streetAddress": "Main Road",
        "addressLocality": "Purnea",
        "addressRegion": "Bihar",
        "postalCode": "854301",
        "addressCountry": "IN"
      }
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "10:00",
        "closes": "19:00"
      }
    ],
    "sameAs": [
      "https://instagram.com/dentofacial"
    ]
  }

  const doctorSchema = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "name": "Dr. Hadi Raza",
    "description": "Specialist in Dermatology and Dental Surgery in Purnea, Bihar",
    "medicalSpecialty": ["Dermatology", "Dental Surgery"],
    "worksFor": {
      "@type": "MedicalBusiness",
      "name": "Dent-O-Facial"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Purnea",
      "addressRegion": "Bihar",
      "addressCountry": "IN"
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(doctorSchema) }}
      />
    </>
  )
}
