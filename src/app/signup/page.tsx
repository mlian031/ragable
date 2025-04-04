import { SignupForm } from "@/components/signup-form"
import Image from "next/image"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
             <Image
               src="https://storage.googleapis.com/ragable-static/grainient-2.png"
               alt="Logo"
               className="h-6 w-6 rounded-md"
                width={24}
                height={24}
              />
            </div>
            Ragable Inc.
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
       <Image
         src="https://storage.googleapis.com/ragable-static/grainient-2.png"
         alt="Image"
         className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          fill
          priority
        />
      </div>
    </div>
  )
}
