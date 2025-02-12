import { NextResponse } from "next/server"
import { getSpotifyAccessToken } from "@/utils/spotifyAuth"

const placeholderImage = "data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%236b7280' text-anchor='middle' dy='.3em'%3EArtist%3C/text%3E%3C/svg%3E"

async function getUserTopGenres(accessToken: string) {
  try {
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

    const genres = data.items?.reduce((acc: string[], artist: any) => {
      return [...acc, ...artist.genres]
    }, []) || []
    
    const genreCounts = genres.reduce((acc: {[key: string]: number}, genre: string) => {
      acc[genre] = (acc[genre] || 0) + 1
      return acc
    }, {})
    
    return Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([genre]) => genre)
      .slice(0, 3)
  } catch (error) {
    console.error('Error in getUserTopGenres:', error)
    throw error
  }
}

async function getLocalArtists(accessToken: string, city: string, genres: string[]) {
  try {
    const searchQueries = genres.map(genre => 
      fetch(`https://api.spotify.com/v1/search?q=genre:${genre}%20${city}&type=artist&limit=3`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      }).then(res => res.json())
    )
    
    const results = await Promise.all(searchQueries)
    return results.flatMap(result => result.artists?.items || [])
  } catch (error) {
    console.error('Error in getLocalArtists:', error)
    throw error
  }
}

export async function GET(request: Request) {
  if (!process.env.SPOTIFY_CLIENT_SECRET) {
    console.error('Missing SPOTIFY_CLIENT_SECRET environment variable')
    return NextResponse.json({ 
      error: "Server configuration error",
      details: "Missing required environment variables"
    }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const city = searchParams.get("city")

  console.log('API Request:', { code: code?.slice(0, 10) + '...', city })

  if (!code || !city) {
    console.log('Missing parameters:', { code: !!code, city: !!city })
    return NextResponse.json({ 
      error: "Spotify authorization code and city are required" 
    }, { status: 400 })
  }

  try {
    console.log('Getting access token...')
    const tokenResponse = await getSpotifyAccessToken(code)
    console.log('Access token response:', {
      success: !!tokenResponse.accessToken,
      tokenLength: tokenResponse.accessToken?.length
    })

    if (!tokenResponse.accessToken) {
      throw new Error('Failed to get access token')
    }

    console.log('Getting top genres...')
    const topGenres = await getUserTopGenres(tokenResponse.accessToken)
    console.log('Top genres:', topGenres)

    if (!topGenres?.length) {
      throw new Error('No genres found')
    }

    console.log('Getting local artists...')
    const localArtists = await getLocalArtists(tokenResponse.accessToken, city, topGenres)
    console.log('Local artists found:', localArtists?.length)

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
      spotifyUrl: artist.external_urls?.spotify
    }))

    return NextResponse.json({ artists })
  } catch (error) {
    console.error("Error in GET route:", {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    // More specific error messages
    let errorMessage = "Failed to fetch artists"
    if (error instanceof Error) {
      if (error.message.includes('access token')) {
        errorMessage = "Failed to authenticate with Spotify"
      } else if (error.message.includes('genres')) {
        errorMessage = "Could not determine your music preferences"
      }
    }

    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

