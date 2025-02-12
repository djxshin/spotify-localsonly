import { NextResponse } from "next/server"

export async function GET() {
  // TODO: Implement actual event API integration (e.g., Songkick or Ticketmaster)
  // For now, we'll return mock data
  const mockEvents = [
    {
      id: "1",
      name: "Local Music Festival",
      date: "2023-07-15",
      venue: "City Park",
      ticketUrl: "https://example.com/tickets/1",
    },
    {
      id: "2",
      name: "Indie Night",
      date: "2023-07-20",
      venue: "The Basement",
      ticketUrl: "https://example.com/tickets/2",
    },
    {
      id: "3",
      name: "Jazz in the Square",
      date: "2023-07-25",
      venue: "Town Square",
      ticketUrl: "https://example.com/tickets/3",
    },
  ]

  return NextResponse.json({ events: mockEvents })
}

