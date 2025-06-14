import { GalleryVerticalEnd, Eye, EyeOff, AlertTriangle } from "lucide-react"
import { GrainGradient } from '@paper-design/shaders-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import zxcvbn from 'zxcvbn'

const checkEmailAvailability = async (email: string): Promise<boolean> => {
  const res = await fetch('http://localhost:3000/api/check-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });

  if (!res.ok) {
    throw new Error('Failed to check email');
  }

  const data = await res.json();
  return data.status === 'available';
}; 

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .transform(val => val.trim().toLowerCase())
    .refine(async (val) => await checkEmailAvailability(val), {
      message: 'We couldn’t use that email. Try another one.',
    }),
  password: z.string().min(8, 'Password is too short').max(64, 'Password is too long')
    .refine(val => zxcvbn(val).score >= 3, {
      message: 'Password is too weak. Try another one.',
    }),
})

type RegisterForm = z.infer<typeof registerSchema>

const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  if (!password) return null;
  
  const result = zxcvbn(password)
  const strength = result.score // 0-4
  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
        return 'bg-red-500'
      case 1:
        return 'bg-orange-500'
      case 2:
        return 'bg-yellow-500'
      case 3:
        return 'bg-green-500'
      case 4:
        return 'bg-emerald-500'
      default:
        return 'bg-gray-200'
    }
  }

  const getStrengthText = (score: number) => {
    switch (score) {
      case 0:
        return 'Very Weak'
      case 1:
        return 'Weak'
      case 2:
        return 'Medium'
      case 3:
        return 'Strong'
      case 4:
        return 'Very Strong'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex h-2 w-full gap-1 mt-2" aria-hidden="true">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`h-full w-full rounded-full transition-colors ${
              i < strength ? getStrengthColor(strength) : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className={getStrengthColor(strength).replace('bg-', 'text-')}>
          {getStrengthText(strength)}
        </span>
      </div>
    </div>
  )
}

export const Route = createFileRoute({
  component: Register,
})

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      password: '',
    }
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          email: data.email.trim().toLowerCase()
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      console.log('Registration successful:', result);
    } catch (error) {
      console.error('Registration error:', error);
    }
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold mb-2">Signup to Lynkr</h1>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="Name"
                    autoComplete="name"
                    required
                    aria-required="true"
                    aria-describedby="name-error"
                    aria-invalid={!!form.formState.errors.name}
                    {...form.register('name')}
                  />
                  {form.formState.errors.name && (
                    <p id="name-error" role="alert" className="text-sm text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Email" 
                    autoComplete="email"
                    required
                    aria-required="true"
                    aria-describedby="email-error email-status"
                    aria-invalid={!!form.formState.errors.email}
                    {...form.register('email')}
                  />
                  {form.formState.errors.email && (
                    <p id="email-error" role="alert" className="text-sm text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {form.formState.errors.email.message}
                    </p>
                  )}
                  {form.formState.isValidating && (
                    <p id="email-status" className="text-sm text-muted-foreground">
                      Checking email...
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      autoComplete="new-password"
                      required
                      aria-required="true"
                      aria-describedby="password-error password-helper"
                      aria-invalid={!!form.formState.errors.password}
                      {...form.register('password', {
                        onChange: (e) => setPassword(e.target.value)
                      })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {form.formState.errors.password && (
                    <p id="password-error" role="alert"className="text-sm text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {form.formState.errors.password.message}
                    </p>
                  )}
                  <p id="password-helper" className="text-xs text-muted-foreground">
                    Password should be at least 8 characters. Avoid common passwords.
                  </p>
                  <div aria-live="polite">
                    <PasswordStrengthIndicator password={password} />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full cursor-pointer"
                  disabled={form.formState.isValidating || form.formState.isSubmitting}
                >
                  Create Account
                </Button>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-gray-50 px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
                <Button variant="outline" className="w-full cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                      fill="currentColor"
                    />
                  </svg>
                  Sign up with GitHub
                </Button>
                <p className="text-xs text-left text-muted-foreground">
                  By creating an account, you agree to the{' '}
                  <a href="/terms" className="underline underline-offset-4 hover:text-primary">
                    Terms of Service
                  </a>
                  . For more information about Lynkr's privacy practices, see the{' '}
                  <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
                    Privacy Statement
                  </a>
                  .
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <GrainGradient style={{ position: 'fixed', width: '100%', height: '100%' }} />
      </div>
    </div>
  )
}
