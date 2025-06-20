import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Link2, BarChart3, Shield, Zap, Server,  Users, Sparkles, Smile, Soup } from "lucide-react"

export const Route = createFileRoute({
  component: Index,
})

function Index() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">

      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-400/20 to-amber-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-300/10 to-amber-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Icons Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 left-20 animate-bounce delay-100">
          <Link2 className="w-6 h-6 text-yellow-400/30" aria-hidden="true" />
        </div>
        <div className="absolute top-40 right-32 animate-bounce delay-300">
          <BarChart3 className="w-5 h-5 text-amber-400/30" aria-hidden="true" />
        </div>
        <div className="absolute bottom-40 left-16 animate-bounce delay-700">
          <Shield className="w-7 h-7 text-yellow-400/30" aria-hidden="true" />
        </div>
        <div className="absolute bottom-20 right-20 animate-bounce delay-500">
          <Zap className="w-6 h-6 text-yellow-400/30" aria-hidden="true" />
        </div>

      </div>

      <main className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-lg backdrop-blur-sm border border-white/20 animate-fade-in-up" role="banner">
            <div className="relative">
              <Smile className="w-4 h-4" aria-hidden="true" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" aria-hidden="true"></div>
            </div>
            <span>Free to Use • Self-Host Friendly</span>
            <Sparkles className="w-4 h-4 text-amber-600" aria-hidden="true" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 animate-fade-in-up delay-200">
            Your Service,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 animate-gradient-x relative">
              Your Links, Your Way
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600/20 via-amber-600/20 to-orange-600/20 blur-xl -z-10 animate-pulse"></div>
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto animate-fade-in-up delay-400 leading-relaxed">
            The URL shortener for individuals and organizations. <br/> Try Lynkr for free, or self-host to suit your production needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-600">
            <Button 
              size="lg" 
              className="group px-15 py-6 text-lg cursor-pointer bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-white"
              onClick={() => window.location.href = '/dashboard'}
              aria-label="Try Lynkr now - Go to dashboard"
            >
              Try Now
              <ArrowRight className="ml-0 w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="group px-15 py-6 text-lg border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 opacity-75"
              disabled
              aria-label="Self-hosting option coming soon"
            >
              <Server className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform" aria-hidden="true" />
              Self-Host (Coming Soon)
            </Button>
          </div>
        </div>
      </main>

      <section className="max-w-6xl mx-auto px-6 py-16 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
            Built for Everyone, Customized for You
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in-up delay-100">
            From personal portfolios to large teams, Lynkr adapts to your exact needs and style
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16" role="list">
          <Card className="group bg-white/90 backdrop-blur-sm border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up" role="listitem">
            <CardContent className="p-8">
              <div className="relative mb-6">
                <div className="bg-gradient-to-br from-yellow-500 to-amber-600 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg" role="img" aria-label="Easy to use icon">
                  <Soup className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center animate-pulse" aria-hidden="true">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors">Easy to Use</h3>
              <p className="text-gray-600 leading-relaxed">
                Lynkr is designed to be easy to use, with a focus on simplicity and ease of use, making it perfect for personal use and teams.
              </p>
            </CardContent>
          </Card>

          <Card className="group bg-white/90 backdrop-blur-sm border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up delay-100" role="listitem">
            <CardContent className="p-8">
              <div className="relative mb-6">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg" role="img" aria-label="Team collaboration icon">
                  <Users className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                <div className="absolute -top-1 -right-1 animate-spin-slow" aria-hidden="true">
                  <Sparkles className="w-5 h-5 text-amber-400" aria-hidden="true" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">Personal & Team Ready</h3>
              <p className="text-gray-600 leading-relaxed">
                Designed for personal use, teams, and organisations. Our features are built to suit your needs, unlike other customer-facing URL shorteners.
              </p>
            </CardContent>
          </Card>

          <Card className="group bg-white/90 backdrop-blur-sm border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up delay-200" role="listitem">
            <CardContent className="p-8">
              <div className="relative mb-6">
                <div className="bg-gradient-to-br from-orange-500 to-yellow-600 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg" role="img" aria-label="Self-hosting server icon">
                  <Server className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/50 to-amber-400/50 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">Self-Hosted Freedom</h3>
              <p className="text-gray-600 leading-relaxed">
                Deploy anywhere - your server, cloud provider, or local network. 
                Own your data and customizations.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center" role="img" aria-label="Lynkr logo">
                  <Link2 className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
                Lynkr
              </h3>
              <p className="text-gray-400 leading-relaxed">
                The URL shortener that puts you in control.
              </p>
            </div>
            <nav aria-label="Product navigation">
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/dashboard" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded">Dashboard</a></li>
              </ul>
            </nav>
            <nav aria-label="Resources navigation">
              <h4 className="font-medium mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded" aria-label="Go to documentation">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded" aria-label="View GitHub repository">GitHub</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 inline-block focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded" aria-label="Get support">Support</a></li>
              </ul>
            </nav>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Lynkr. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}