// app/jobs/loading.js

export default function LoadingJobList() {
  return (
    <main className="space-y-4">

      <div className="space-y-2">
        <div className="h-7 w-40 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-56 bg-gray-100 rounded animate-pulse"></div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="border rounded-lg p-4 bg-white animate-pulse space-y-3"
          >
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>

            <div className="h-4 bg-gray-100 rounded w-1/2"></div>

            <div className="h-4 bg-gray-100 rounded w-2/3"></div>

            <div className="h-4 bg-gray-100 rounded w-1/3"></div>

            <div className="pt-2 border-t">
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}

      </div>

    </main>
  );
}