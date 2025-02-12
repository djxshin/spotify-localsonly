import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
  }

  // TODO: Implement actual geocoding using Google Maps API or Mapbox API
  // For now, we'll return a mock response
  const mockLocation = "New York, NY"

  return NextResponse.json({ location: mockLocation })
}

