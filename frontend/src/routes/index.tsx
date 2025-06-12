import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute({
  component: Index,
})

interface Slug {
  id: number
  slug: string
  targetUrl: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  success: boolean
  count: number
  slugs: Slug[]
}

const fetchSlugs = async (): Promise<ApiResponse> => {
  const response = await fetch('/api/slugs')
  if (!response.ok) {
    throw new Error('Failed to fetch slugs')
  }
  return response.json()
}

function Index() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['slugs'],
    queryFn: fetchSlugs,
  })

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">Error</h2>
          <p className="text-red-600">Failed to load slugs. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-8 py-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Links</h1>
        <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors text-sm">Create link</button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        {data?.slugs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔗</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No slugs yet</h3>
            <p className="text-gray-500">Create your first shortened URL to get started.</p>
          </div>
        ) : (
          <>
            {data?.slugs
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((slug) => (
              <div key={slug.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 text-sm text-gray-600 uppercase">
                    {new URL(slug.targetUrl).hostname[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">lynkr.app/{slug.slug}</span>
                      <span className="text-xs text-gray-400">{new Date(slug.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                      {slug.targetUrl}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">0 clicks</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(`http://localhost:3000/${slug.slug}`)}
                    className="text-xs text-white hover:text-gray-500"
                  >
                    Copy
                  </button>
                  <a
                    href={`http://localhost:3000/${slug.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-600 hover:text-gray-800"
                  >
                    Visit
                  </a>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      <div className="mt-4 text-xs text-center text-gray-500">Viewing {data?.count || 0} of {data?.count || 0} links</div>
    </div>
  )
}