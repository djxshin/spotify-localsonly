"use client"

import { CalendarIcon, MapPinIcon, TicketIcon } from "lucide-react"
import useSWR from "swr"
import fetcher from '@/lib/fetcher'

interface Event {
  id: string
  name: string
  date: string
  venue: string
  ticketUrl: string
}

export default function EventListings() {
  const { data, isLoading, error } = useSWR<{ events: Event[] }>('/api/events', fetcher)
  const events = data?.events || []

  if (isLoading) return <div>Loading local events...</div>
  if (error) return <div>Error loading events</div>

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <CalendarIcon className="mr-2" /> Upcoming Local Events
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event: Event) => (
          <div key={event.id} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">{event.name}</h3>
            <p className="text-sm text-gray-600 mb-2 flex items-center">
              <CalendarIcon className="mr-1" size={16} /> {event.date}
            </p>
            <p className="text-sm text-gray-600 mb-4 flex items-center">
              <MapPinIcon className="mr-1" size={16} /> {event.venue}
            </p>
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors inline-flex items-center"
            >
              <TicketIcon className="mr-2" size={16} /> Get Tickets
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

