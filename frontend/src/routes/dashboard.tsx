import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { HelpCircle, Lock } from "lucide-react"
import { useEffect, useState } from 'react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

export const Route = createFileRoute({
  component: Dashboard,
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

const FieldLabel = ({ children, tooltip }: { children: React.ReactNode, tooltip: string }) => (
  <div className="flex items-center gap-1.5">
    {children}
    <Tooltip>
      <TooltipTrigger>
        <HelpCircle className="h-4 w-4 text-gray-400" />
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </div>
)

const createLinkSchema = z.object({
  url: z.string()
    .transform((val) => {
      // If the URL doesn't start with http:// or https://, add https://
      if (!val.startsWith('http://') && !val.startsWith('https://')) {
        return `https://${val}`;
      }
      return val;
    })
    .pipe(z.string().url("Please enter a valid URL")),
  customSlug: z.string()
    .regex(/^[a-zA-Z0-9-_]*$/, "Only letters, numbers, hyphens, and underscores are allowed")
    .optional(),
  comments: z.string().optional(),
  isOneTime: z.boolean(),
})

type CreateLinkFormData = z.infer<typeof createLinkSchema>

function PasswordDialog({ password, setPassword }: { password: string, setPassword: (value: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 cursor-pointer"
          type="button"
        >
          <Lock className="h-4 w-4" />
          {password ? 'Change Password' : 'Add Password'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Password Protection</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <FieldLabel tooltip="Add a password to protect your link. Visitors will need to enter this password to access the destination URL">
              <Label htmlFor="password">Password</Label>
            </FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="Enter password to protect this link"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              If set, visitors will need to enter this password to access the link.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setIsOpen(false)} className="cursor-pointer">Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CreateLinkDialog({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const [password, setPassword] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    setFocus,
  } = useForm<CreateLinkFormData>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      isOneTime: false,
    }
  })

  const isOneTime = watch('isOneTime')

  const onSubmit = async (data: CreateLinkFormData) => {
    // TODO: Implement create link functionality
    console.log({ ...data, password })
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors text-sm cursor-pointer">
          Create link
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-2xl"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          setFocus("url")
        }}
      >
        <DialogHeader>
          <DialogTitle>Create new link</DialogTitle>
        </DialogHeader>
        <TooltipProvider>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FieldLabel tooltip="The URL that your shortened link will redirect to">
                <Label htmlFor="url">Destination URL</Label>
              </FieldLabel>
              <Input
                id="url"
                type="text"
                placeholder="example.com"
                {...register("url")}
              />
              {errors.url && (
                <p className="text-sm text-red-500">{errors.url.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <FieldLabel tooltip="Create a custom short URL. Leave empty for an auto-generated one">
                <Label htmlFor="customSlug">Custom Slug (optional)</Label>
              </FieldLabel>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 bg-gray-100 h-9 px-3 flex items-center rounded-l-md border border-r-0 border-gray-200">lynkr.app/</span>
                <Input
                  id="customSlug"
                  type="text"
                  placeholder="my-custom-link"
                  {...register("customSlug")}
                  className="rounded-l-none"
                />
              </div>
              {errors.customSlug && (
                <p className="text-sm text-red-500">{errors.customSlug.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Leave empty for auto-generated slug. Only letters, numbers, hyphens, and underscores are allowed.
              </p>
            </div>
            <div className="space-y-2">
              <FieldLabel tooltip="Add notes or comments about this link. This is only visible to you">
                <Label htmlFor="comments">Comments (optional)</Label>
              </FieldLabel>
              <Textarea
                id="comments"
                placeholder="Add any notes or comments about this link..."
                {...register("comments")}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center gap-2">
                <FieldLabel tooltip="When enabled, the link will only work once and then become invalid">
                  <Label htmlFor="isOneTime">One-time link</Label>
                </FieldLabel>
              </div>
              <Switch
                id="isOneTime"
                checked={isOneTime}
                onCheckedChange={(checked) => setValue("isOneTime", checked)}
              />
            </div>
            {isOneTime && (
              <div className="rounded-md bg-yellow-50 p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>This link will only work once. After the first use, it will become invalid and cannot be accessed again.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <PasswordDialog password={password} setPassword={setPassword} />
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer">
                Create
              </Button>
            </div>
          </form>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  )
}

function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['slugs'],
    queryFn: fetchSlugs,
  })

  const [isCreateLinkDialogOpen, setCreateLinkDialogOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'c') {
        const target = event.target as HTMLElement
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return
        }
        event.preventDefault()
        setCreateLinkDialogOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

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
          <CreateLinkDialog isOpen={isCreateLinkDialogOpen} onOpenChange={setCreateLinkDialogOpen} />
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