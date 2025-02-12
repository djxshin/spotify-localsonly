"use client"

import { useEffect, useState } from "react"
import { MusicIcon } from "lucide-react"
import { getSpotifyAuthUrl } from "@/utils/spotifyAuth"
import Image from 'next/image'
import useSWR from 'swr'
import fetcher from '@/lib/fetcher'
import { useRouter } from 'next/navigation'

interface Artist {
  id: string
  name: string
  image: string
  genres: string[]
  spotifyUrl: string
}

const placeholderImage = "data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%236b7280' text-anchor='middle' dy='.3em'%3EArtist%3C/text%3E%3C/svg%3E"

export default function ArtistDiscovery() {
  const router = useRouter()
  const [city, setCity] = useState<string | null>(null)
  const [shouldFetch, setShouldFetch] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)

  useEffect(() => {
    const storedCity = localStorage.getItem('userCity')
    setCity(storedCity)
    
    if (!storedCity) {
      router.push('/')
      return
    }

    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")
    const state = urlParams.get("state")
    const storedState = localStorage.getItem('spotify_auth_state')
    
    // Clear the stored state
    localStorage.removeItem('spotify_auth_state')
    
    if (!code) {
      // Only redirect if we haven't just returned from Spotify
      if (!state) {
        window.location.href = getSpotifyAuthUrl()
      }
      return
    }

    // Verify the state parameter
    if (state !== storedState) {
      console.error('State mismatch, possible CSRF attack')
      window.location.href = getSpotifyAuthUrl()
      return
    }

    // Remove code and state from URL without triggering a refresh
    const newUrl = window.location.pathname
    window.history.replaceState({}, '', newUrl)
    
    setShouldFetch(true)
  }, [router])

  const { data, isLoading, error } = useSWR<{ 
    artists: Artist[], 
    refreshToken: string,
    expiresIn: number 
  }>(
    shouldFetch ? () => {
      if (city) {
        if (refreshToken) {
          return `/api/local-artists?refresh_token=${refreshToken}&city=${encodeURIComponent(city)}`
        }
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get("code")
        if (code) {
          return `/api/local-artists?code=${code}&city=${encodeURIComponent(city)}`
        }
      }
      return null
    } : null,
    fetcher,
    {
      onSuccess: (data) => {
        if (data.refreshToken) {
          setRefreshToken(data.refreshToken)
        }
      },
      onError: (err) => {
        console.error('SWR Error:', err)
        setRefreshToken(null)
        if (err.message.includes('auth') || 
            err.message.includes('token') || 
            err.message.includes('client')) {
          window.location.href = getSpotifyAuthUrl()
        }
      },
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      dedupingInterval: 10000 // Only retry every 10 seconds
    }
  )

  if (!city) return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <p>Please enter your city first</p>
    </div>
  )
  
  if (isLoading) return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <p>Loading local artists...</p>
    </div>
  )
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Error</h2>
        <p>{error.message}</p>
        <button 
          onClick={() => window.location.href = getSpotifyAuthUrl()}
          className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          Try Again
        </button>
      </div>
    )
  }

  const artists = data?.artists || []

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <MusicIcon className="mr-2" /> Local Artists in Your Favorite Genres
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {artists.map((artist: Artist) => (
          <div key={artist.id} className="bg-gray-100 rounded-lg p-4">
            <Image 
              src={artist.image}
              alt={artist.name}
              width={200}
              height={200}
              className="w-full h-48 object-cover rounded-md mb-2"
            />
            <h3 className="font-semibold">{artist.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{artist.genres.join(", ")}</p>
            <a 
              href={artist.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              View on Spotify →
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

