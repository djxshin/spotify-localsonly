"use client"

import { useState } from "react"
import { PlayIcon, ShareIcon } from "lucide-react"
import useSWR, { mutate } from "swr"
import fetcher from '@/lib/fetcher'

export default function PlaylistGenerator() {
  const { data, isLoading: isFetching } = useSWR('/api/playlist', fetcher)
  const [loading, setLoading] = useState(false)
  const playlist = data?.playlistUrl || null

  const generatePlaylist = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/generate-playlist", { method: "POST" })
      if (!response.ok) throw new Error('Failed to generate playlist')
      const data = await response.json()
      await mutate('/api/playlist', { playlistUrl: data.playlistUrl }, false)
    } catch (error) {
      console.error("Failed to generate playlist:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <PlayIcon className="mr-2" /> Local Playlist Generator
      </h2>
      {isFetching ? (
        <p>Loading...</p>
      ) : playlist ? (
        <div>
          <p className="mb-4">Your local playlist has been generated!</p>
          <a
            href={playlist}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            Open in Spotify
          </a>
          <button
            onClick={() => {
              // TODO: Implement sharing functionality
              alert('Sharing coming soon!')
            }}
            className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            <ShareIcon className="inline-block mr-2" />
            Share Playlist
          </button>
        </div>
      ) : (
        <button
          onClick={generatePlaylist}
          disabled={loading}
          className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors disabled:bg-indigo-300"
        >
          {loading ? "Generating..." : "Generate Local Playlist"}
        </button>
      )}
    </div>
  )
}

