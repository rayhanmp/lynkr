import { GalleryVerticalEnd, AlertTriangle } from "lucide-react"
import { GrainGradient } from '@paper-design/shaders-react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
}

async function fetchUserProfile() {
  const response = await fetch('http://localhost:3000/api/me', {
    credentials: 'include',
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Please login to view your profile');
    }
    throw new Error('Failed to fetch profile');
  }
  
  const data = await response.json();
  if (!data.user) {
    throw new Error('Invalid response format');
  }
  
  return data.user as User;
}

export const Route = createFileRoute({
  component: Profile,
})

export default function Profile() {
  const navigate = useNavigate();
  const { data: user, error, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchUserProfile,
    retry: false, // Don't retry on 401 errors
  });

  if (isLoading) {
    return (
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="#" className="flex items-center gap-2 font-medium">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              Lynkr
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative hidden bg-muted lg:block">
          <GrainGradient style={{ position: 'fixed', width: '100%', height: '100%' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="#" className="flex items-center gap-2 font-medium">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              Lynkr
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Error</h2>
                </div>
                <p className="text-sm text-muted-foreground">{error.message}</p>
                <button 
                  onClick={() => navigate({ to: '/login' })}
                  className="text-sm text-primary hover:underline"
                >
                  Go to login
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="relative hidden bg-muted lg:block">
          <GrainGradient style={{ position: 'fixed', width: '100%', height: '100%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Lynkr
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold mb-2">Profile</h1>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                  <p className="text-lg">{user?.name}</p>
                </div>
                <div className="grid gap-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Username</h3>
                  <p className="text-lg">{user?.username}</p>
                </div>
                <div className="grid gap-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="text-lg">{user?.email}</p>
                </div>
                <div className="pt-4">
                  <button 
                    onClick={async () => {
                      try {
                        await fetch('http://localhost:3000/api/logout', {
                          method: 'POST',
                          credentials: 'include',
                        });
                        navigate({ to: '/login' });
                      } catch (error) {
                        console.error('Logout failed:', error);
                      }
                    }}
                    className="w-full text-sm text-red-500 hover:text-red-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <GrainGradient style={{ position: 'fixed', width: '100%', height: '100%' }} />
      </div>
    </div>
  );
} 