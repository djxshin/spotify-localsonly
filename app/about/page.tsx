import Header from "@/components/Header"

export default function About() {
  return (
    <main className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">About LocalVibes</h1>
        <p className="mb-4">
          LocalVibes is your gateway to discovering the vibrant music scene in your area. We connect you with local
          artists, upcoming events, and curated playlists to help you immerse yourself in the sounds of your community.
        </p>
        <p className="mb-4">
          Our mission is to support local musicians and foster a thriving music ecosystem in every city. By using
          LocalVibes, you&apos;re not just discovering great music – you&apos;re supporting the artists who make your local scene
          unique.
        </p>
        <h2 className="text-2xl font-bold mb-2">How It Works</h2>
        <ul className="list-disc list-inside mb-4">
          <li>We use your location to find artists and events near you</li>
          <li>We integrate with Spotify to provide you with the best local music recommendations</li>
          <li>We aggregate event data to keep you informed about upcoming concerts and gigs</li>
          <li>We generate custom playlists featuring the hottest local tracks</li>
        </ul>
        <p>Start exploring your local music scene today with LocalVibes!</p>
      </div>
    </main>
  )
}

