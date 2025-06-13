import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import '../index.css'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  )
}