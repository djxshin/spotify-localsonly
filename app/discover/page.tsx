import ArtistDiscovery from "@/components/ArtistDiscovery"
import EventListings from "@/components/EventListings"
import LocationDetector from "@/components/LocationDetector"
import PlaylistGenerator from "@/components/PlaylistGenerator"
import Header from "@/components/Header"

export default function Discover() {
  return (
    <main className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <LocationDetector />
        <ArtistDiscovery />
        <EventListings />
        <PlaylistGenerator />
      </div>
    </main>
  )
} 