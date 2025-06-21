import { Button } from "@/components/ui/button"
import { Link2, Menu, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false)
        toggleButtonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMenuOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a 
              href="/" 
              className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded-lg"
              aria-label="Lynkr home"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                <Link2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Lynkr</span>
            </a>
          </div>

          <div className="hidden md:flex items-center">
            <ul className="flex items-center space-x-8" role="list">
              <li>
                <a 
                  href="#features" 
                  className="text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded px-2 py-1"
                  aria-label="Navigate to features section"
                >
                  Features
                </a>
              </li>
              <li>
                <a 
                  href="#demo" 
                  className="text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded px-2 py-1"
                  aria-label="Navigate to documentation section"
                >
                  Docs
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/rayhanmp/lynkr/" 
                  className="text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded px-2 py-1"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View Lynkr source code on GitHub (opens in new tab)"
                >
                  GitHub
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              onClick={() => window.location.href = '/login'}
              aria-label="Go to login page"
            >
              Login
            </Button>
            <Button 
              className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 cursor-pointer text-white focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              onClick={() => window.location.href = '/dashboard'}
              aria-label="Go to registration page"
            >
              Register
            </Button>
          </div>

          <div className="md:hidden flex items-center">
            <button
              ref={toggleButtonRef}
              onClick={handleMenuToggle}
              className="text-gray-600 hover:text-gray-900 transition-colors focus:outline-none cursor-pointer"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div 
          ref={menuRef}
          id="mobile-menu"
          className="md:hidden bg-white border-t border-gray-200 "
          role="region"
          aria-label="Mobile navigation menu"
        >
          <nav role="navigation" aria-label="Mobile main navigation">
            <ul className="px-2 pt-2 pb-3 space-y-1" role="list">
              <li>
                <a
                  href="#features"
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded"
                  onClick={closeMenu}
                  aria-label="Navigate to features section"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#demo"
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded"
                  onClick={closeMenu}
                  aria-label="Navigate to documentation section"
                >
                  Docs
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/rayhanmp/lynkr/"
                  className="block px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded"
                  onClick={closeMenu}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View Lynkr source code on GitHub (opens in new tab)"
                >
                  GitHub
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              </li>
            </ul>
          </nav>
          
          <div className="px-2 pb-3 space-y-2" role="region" aria-label="Authentication actions">
            <Button 
              variant="outline" 
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              onClick={() => window.location.href = '/login'}
              aria-label="Go to login page"
            >
              Login
            </Button>
            <Button 
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              onClick={() => window.location.href = '/dashboard'}
              aria-label="Go to registration page"
            >
              Register
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
} 