"use client"

import { useEffect, useState } from "react"
import { MapPinIcon } from "lucide-react"

export default function LocationDetector() {
  const [city, setCity] = useState<string | null>(null)

  useEffect(() => {
    const storedCity = localStorage.getItem('userCity')
    if (storedCity) {
      setCity(storedCity)
    }
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <MapPinIcon className="mr-2" /> Your Location
      </h2>
      <p className="text-lg">{city || 'Location not set'}</p>
    </div>
  )
}

