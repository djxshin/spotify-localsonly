const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

export function getSpotifyAuthUrl() {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_REDIRECT_URI) {
    throw new Error('Missing required Spotify configuration')
  }

  const scope = [
    'user-read-email',
    'user-top-read',
    'playlist-modify-public',
    'playlist-modify-private'
  ].join(' ')

  const state = Math.random().toString(36).substring(7)
  
  if (typeof window !== 'undefined') {
    // Clear any existing auth state
    localStorage.removeItem('spotify_auth_state')
    
    // Set new state
    localStorage.setItem('spotify_auth_state', state)
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    show_dialog: 'false',
    state
  })

  return `https://accounts.spotify.com/authorize?${params.toString()}`
}

export async function getSpotifyAccessToken(code: string) {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REDIRECT_URI) {
    throw new Error('Missing required Spotify configuration')
  }

  try {
    const tokenEndpoint = 'https://accounts.spotify.com/api/token'
    const credentials = Buffer.from(
      `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
    ).toString('base64')

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
    })

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: body.toString(),
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('Spotify token error:', data)
      if (data.error === 'invalid_grant') {
        throw new Error('Invalid authorization code')
      }
      if (data.error === 'invalid_client') {
        throw new Error('Invalid Spotify credentials')
      }
      throw new Error(data.error_description || 'Failed to get access token')
    }

    return { 
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in
    }
  } catch (error) {
    console.error('Token exchange error:', error)
    throw error
  }
}

export async function refreshSpotifyToken(refreshToken: string) {
  try {
    const tokenEndpoint = 'https://accounts.spotify.com/api/token'
    const credentials = Buffer.from(
      `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
    ).toString('base64')

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error_description || 'Failed to refresh token')
    }

    return { 
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken, // Some responses don't include a new refresh token
      expiresIn: data.expires_in
    }
  } catch (error) {
    console.error('Token refresh error:', error)
    throw error
  }
}

