import { Link } from '@tanstack/react-router'
import '../index.css'

interface SidebarLinkProps {
  to: string
  label: string
}

function SidebarLink({ to, label }: SidebarLinkProps) {
  return (
    <Link
      to={to}
      className="block rounded-lg mx-2 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 [&.active]:bg-gray-100 [&.active]:text-gray-900 [&.active]:font-semibold transition-all duration-200"
    >
      {label}
    </Link>
  )
}

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Lynkr</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 space-y-8">
        <div>
          <SidebarLink to="/" label="Links" />
        </div>

        <div>
          <p className="px-5 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Insights</p>
          <SidebarLink to="/analytics" label="Analytics" />
        </div>

        <div>
          <p className="px-5 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Library</p>
          <SidebarLink to="/folders" label="Folders" />
          <SidebarLink to="/tags" label="Tags" />
        </div>
      </nav>
    </aside>
  )
} 