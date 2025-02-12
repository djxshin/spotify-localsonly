import { NextResponse } from "next/server"
import { getSpotifyAccessToken } from "@/utils/spotifyAuth"

const placeholderImage = "data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%236b7280' text-anchor='middle' dy='.3em'%3EArtist%3C/text%3E%3C/svg%3E"

interface SpotifyArtist {
  id: string
  name: string
  images?: { url: string }[]
  genres?: string[]
  external_urls?: {
    spotify?: string
  }
}

async function getUserTopGenres(accessToken: string): Promise<string[]> {
  const response = await fetch('https://api.spotify.com/v1/me/top/artists', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    }
  })
  const data = await response.json()
  
  if (!response.ok) {
    console.error('Spotify API error:', data)
    throw new Error(data.error?.message || 'Failed to fetch top artists')
  }

  const genres = data.items?.reduce((acc: string[], artist: SpotifyArtist) => {
    return [...acc, ...(artist.genres || [])]
  }, []) || []
  
  const genreCounts = genres.reduce((acc: Record<string, number>, genre: string) => {
    acc[genre] = (acc[genre] || 0) + 1
    return acc
  }, {})
  
  return Object.entries(genreCounts)
    .sort((entryA, entryB) => entryB[1] - entryA[1])
    .map(([genre]) => genre)
    .slice(0, 3)
}

async function getLocalArtists(accessToken: string, city: string, genres: string[]): Promise<SpotifyArtist[]> {
  const searchQueries = genres.map(genre => 
    fetch(`https://api.spotify.com/v1/search?q=genre:${genre}%20${city}&type=artist&limit=3`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    }).then(res => res.json())
  )
  
  const results = await Promise.all(searchQueries)
  return results.flatMap(result => result.artists?.items || [])
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const city = searchParams.get("city")

  if (!code) {
    return NextResponse.json({ 
      error: "Authorization code is required" 
    }, { status: 400 })
  }

  if (!city) {
    return NextResponse.json({ 
      error: "City is required" 
    }, { status: 400 })
  }

  try {
    const tokenData = await getSpotifyAccessToken(code)
    const topGenres = await getUserTopGenres(tokenData.accessToken)
    const localArtists = await getLocalArtists(tokenData.accessToken, city, topGenres)

    if (!topGenres?.length) {
      return NextResponse.json({ 
        artists: [],
        message: "No genres found in your listening history" 
      })
    }

    if (!localArtists?.length) {
      return NextResponse.json({ 
        artists: [],
        message: "No local artists found for your genres" 
      })
    }

    const artists = localArtists.map(artist => ({
      id: artist.id,
      name: artist.name,
      image: artist.images?.[0]?.url || placeholderImage,
      genres: artist.genres || [],
      spotifyUrl: artist.external_urls?.spotify || ''
    }))

    return NextResponse.json({ artists })
  } catch (error) {
    console.error("Error in GET route:", error)
    
    if (error instanceof Error && error.message.includes('Invalid authorization code')) {
      return NextResponse.json({ 
        error: "Authentication expired",
        details: "Please authenticate with Spotify again"
      }, { status: 401 })
    }

    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to fetch artists"
    }, { status: 500 })
  }
}

