import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const HomePage = () => {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Welcome</h1>
        <p className="text-lg ">
          This is a simple home page built with Next.js and Tailwind CSS.
        </p>
        <div className="flex flex-row space-x-10">
          <div className="flex flex-row *:space-x-2 items-center underline underline-offset-4 hover:underline ml-2">
            
            <Link href="/chat" className="">
              Go to Chat
            </Link>

            <ArrowUpRight className="h-5 w-5" />
          </div>

        </div>
      </div>
    </main>
  )
}

export default HomePage