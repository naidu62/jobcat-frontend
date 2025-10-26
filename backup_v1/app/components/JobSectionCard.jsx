// app/components/JobSectionCard.jsx
export default function JobSectionCard({ title, children }) {
  return (
    <section className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <h2 className="text-lg font-semibold text-blue-700 mb-3">{title}</h2>
      <div className="text-gray-800 text-sm leading-relaxed">{children}</div>
    </section>
  );
}