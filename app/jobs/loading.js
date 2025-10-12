// app/jobs/loading.js

export default function LoadingJobList() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Loading Jobs...</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-4 border rounded-lg shadow bg-white space-y-3"
          >
            <div className="h-5 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-300 rounded w-full mt-4"></div>
          </div>
        ))}
      </div>
    </main>
  );
}