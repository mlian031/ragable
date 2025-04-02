import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
      <p className="text-muted-foreground text-center mb-6">
        There was a problem with the authentication process. Please try again.
      </p>
      <Link 
        href="/login" 
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
      >
        Go back to login
      </Link>
    </div>
  )
} 