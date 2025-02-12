"use client"

import { useState } from "react"
import { MapPinIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Home() {
  const [city, setCity] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (city) {
      // Store the city in localStorage or state management
      localStorage.setItem('userCity', city)
      // Redirect to the main app view
      router.push('/discover')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8">
          LocalVibes
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Discover local music and events in your city
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Enter your city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Get Started
          </button>
        </form>
      </div>
    </main>
  )
}
