// app/components/JobSectionCard.jsx

export default function JobSectionCard({
  title,
  children,
}) {
  return (
    <section
      className="
        bg-white
        border
        border-gray-200
        rounded-lg
        p-4
        space-y-3
      "
    >
      <h2 className="text-lg font-bold text-blue-700">
        {title}
      </h2>

      <div className="text-sm text-gray-800 leading-7">
        {children}
      </div>
    </section>
  );
}