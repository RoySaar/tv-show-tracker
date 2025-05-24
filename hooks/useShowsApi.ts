"use client"

import { useState, useCallback } from "react"
import { searchTMDBShows, getTMDBShowDetails } from "@/lib/tmdb-actions"
import { showsApi } from "@/services/showsApi"
import type { ShowSearchResult, ShowMetadata } from "@/types/show"

export function useShowSearch() {
  const [results, setResults] = useState<ShowSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchShows = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Try server action first, fallback to mock data
      let searchResults = await searchTMDBShows(query)

      // If server action returns empty (no API key), use mock data
      if (searchResults.length === 0) {
        searchResults = await showsApi.searchShows(query)
      }

      setResults(searchResults)
    } catch (err) {
      setError("Failed to search shows")
      // Fallback to mock data on error
      try {
        const mockResults = await showsApi.searchShows(query)
        setResults(mockResults)
      } catch (mockError) {
        setResults([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return {
    results,
    isLoading,
    error,
    searchShows,
    clearResults,
  }
}

export function useShowDetails() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchShowDetails = useCallback(async (id: string): Promise<ShowMetadata | null> => {
    setIsLoading(true)
    setError(null)

    try {
      // Try server action first, fallback to mock data
      let details = await getTMDBShowDetails(id)

      // If server action returns null (no API key), use mock data
      if (!details) {
        details = await showsApi.getShowDetails(id)
      }

      return details
    } catch (err) {
      setError("Failed to fetch show details")
      // Fallback to mock data on error
      try {
        const mockDetails = await showsApi.getShowDetails(id)
        return mockDetails
      } catch (mockError) {
        return null
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    fetchShowDetails,
  }
}
