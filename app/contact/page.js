// app/contact/page.js
export const metadata = {
  title: "Contact JobCat",
  description:
    "For job updates, partnerships and support, contact our team — support@jobcat.in for general support, contact@jobcat.in for business enquiries.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact JobCat | JobCat.in",
    description:
      "For job updates, partnerships and support, contact our team.",
  },
};

const CONTACT_SECTIONS = [
  {
    icon: "🛠️",
    title: "General Support",
    description:
      "Issues with the website, job listings or your account? Our support team will help you out.",
    email: "support@jobcat.in",
  },
  {
    icon: "🤝",
    title: "Business Enquiries",
    description:
      "Partnerships, advertising and collaboration opportunities — we would love to hear from you.",
    email: "contact@jobcat.in",
  },
];

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Title */}
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
          Contact JobCat
        </h1>
        <p className="text-base text-gray-600 max-w-xl mx-auto">
          Questions, feedback or partnership ideas — reach the right team
          directly by email.
        </p>
      </header>

      <main className="grid gap-6 sm:grid-cols-2">
        {CONTACT_SECTIONS.map((section) => (
          <section
            key={section.email}
            aria-labelledby={`contact-${section.email}`}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 flex flex-col"
          >
            <span className="text-3xl" aria-hidden>
              {section.icon}
            </span>
            <h2
              id={`contact-${section.email}`}
              className="text-lg font-bold text-gray-900 mt-3 mb-1"
            >
              {section.title}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed flex-grow">
              {section.description}
            </p>
            <a
              href={`mailto:${section.email}`}
              className="mt-5 min-h-[44px] inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition break-all"
            >
              ✉️ {section.email}
            </a>
          </section>
        ))}
      </main>

      <p className="text-center text-sm text-gray-500 mt-10">
        We usually respond within 1–2 business days.
      </p>
    </div>
  );
}
