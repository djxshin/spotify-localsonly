const fetcher = async (url: string) => {
  const res = await fetch(url)
  const data = await res.json()
  
  if (!res.ok) {
    const error = new Error(data.details || data.error || 'An error occurred')
    console.error('Fetch error:', { url, status: res.status, data })
    throw error
  }
  
  return data
}

export default fetcher 