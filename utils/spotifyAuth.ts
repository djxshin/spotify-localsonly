const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

export function getSpotifyAuthUrl() {
  const scope = [
    'user-read-email',
    'user-top-read',
    'playlist-modify-public',
    'playlist-modify-private'
  ].join(' ')

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID!,
    scope,
    redirect_uri: SPOTIFY_REDIRECT_URI!,
  })

  return `https://accounts.spotify.com/authorize?${params.toString()}`
}

export async function getSpotifyAccessToken(code: string) {
  try {
    console.log('Attempting to get access token with code:', code.slice(0, 10) + '...')
    
    const tokenEndpoint = 'https://accounts.spotify.com/api/token'
    const credentials = Buffer.from(
      `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
    ).toString('base64')

    console.log('Using credentials:', {
      clientId: SPOTIFY_CLIENT_ID?.slice(0, 5) + '...',
      clientSecret: SPOTIFY_CLIENT_SECRET ? 'present' : 'missing',
      redirectUri: SPOTIFY_REDIRECT_URI
    })

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI!,
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('Spotify token error:', data)
      throw new Error(data.error_description || 'Failed to get access token')
    }

    if (!data.access_token) {
      console.error('No access token in response:', data)
      throw new Error('Access token missing from response')
    }

    return { accessToken: data.access_token }
  } catch (error) {
    console.error('Token exchange error:', error)
    throw error
  }
}

