import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const HomePage = () => {
  return (
    <main className="flex items-center justify-center min-h-screen p-8 bg-background text-foreground">
      <div className="text-center max-w-lg mx-auto">
        {/* Attempting a serif font similar to the image, fallback to default */}
        <h1 className="text-6xl font-serif font-medium mb-4 text-gray-700">
          Welcome!
        </h1>
        <p className="text-xl text-gray-500 mb-8">
          what can i help you learn?
        </p>
        <p className="text-lg text-gray-600 mb-12">
          Start exploring capabilities by asking a question or exploring different modes.
        </p>
        <Link
          href="/chat"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
        >
          Start Chatting
          <ArrowUpRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </main>
  )
}

export default HomePage
