import { NextResponse } from "next/server"
import { getSpotifyAccessToken } from "@/utils/spotifyAuth"

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.json({ error: "Spotify authorization code is required" }, { status: 400 })
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { accessToken } = await getSpotifyAccessToken(code)
    // TODO: Implement playlist creation using accessToken
    const mockPlaylistUrl = "https://open.spotify.com/playlist/mock123"
    return NextResponse.json({ playlistUrl: mockPlaylistUrl })
  } catch (error) {
    console.error("Error generating playlist:", error)
    return NextResponse.json({ error: "Failed to generate playlist" }, { status: 500 })
  }
}

