import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import '../index.css'
import Sidebar from '@/components/sidebar'
import Navbar from '@/components/navbar'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const location = useLocation()
  
  // Routes that should show the sidebar (dashboard and authenticated routes)
  const dashboardRoutes = ['/dashboard', '/analytics', '/folders', '/tags', '/profile']
  const showSidebar = dashboardRoutes.some(route => location.pathname.startsWith(route))
  
  // Auth routes that should be clean (no navbar, no sidebar)
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.includes(location.pathname)
  
  // Show navbar only on landing page (and other public pages, but not auth pages)
  const showNavbar = !showSidebar && !isAuthRoute

  return (
    <>
      {showNavbar && <Navbar />}
      <div className="flex h-screen bg-gray-50 text-gray-900">
        {showSidebar && <Sidebar />}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <TanStackRouterDevtools />
    </>
  )
}