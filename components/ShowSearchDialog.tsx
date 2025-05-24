"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Star, Calendar, Tv } from "lucide-react"
import { useShowSearch, useShowDetails } from "@/hooks/useShowsApi"
import { showsApi } from "@/services/showsApi"
import type { ShowSearchResult, ShowMetadata } from "@/types/show"

interface ShowSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectShow: (show: ShowSearchResult, metadata?: ShowMetadata) => void
}

export function ShowSearchDialog({ open, onOpenChange, onSelectShow }: ShowSearchDialogProps) {
  const [query, setQuery] = useState("")
  const { results, isLoading, searchShows, clearResults } = useShowSearch()
  const { fetchShowDetails } = useShowDetails()

  useEffect(() => {
    if (!open) {
      setQuery("")
      clearResults()
    }
  }, [open, clearResults])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchShows(query)
      } else {
        clearResults()
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, searchShows, clearResults])

  const handleSelectShow = async (show: ShowSearchResult) => {
    const metadata = await fetchShowDetails(show.id)
    onSelectShow(show, metadata || undefined)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white rounded-2xl border-0 shadow-2xl max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-[#1d1d1f]">Search TV Shows</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#86868b]" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for TV shows..."
              className="pl-10 border-[#d2d2d7] rounded-lg focus:border-[#007aff] focus:ring-[#007aff] focus:ring-opacity-20"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {isLoading && <div className="text-center py-8 text-[#86868b]">Searching shows...</div>}

            {!isLoading && query && results.length === 0 && (
              <div className="text-center py-8 text-[#86868b]">No shows found for "{query}"</div>
            )}

            {results.map((show) => (
              <div
                key={show.id}
                onClick={() => handleSelectShow(show)}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-[#f5f5f7] cursor-pointer transition-colors"
              >
                <div className="w-16 h-24 bg-[#e5e5e7] rounded-lg overflow-hidden flex-shrink-0">
                  {show.posterPath ? (
                    <img
                      src={showsApi.getImageUrl(show.posterPath, "w154") || "/placeholder.svg"}
                      alt={show.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Tv className="w-6 h-6 text-[#86868b]" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1d1d1f] mb-1 truncate">{show.title}</h3>
                  <p className="text-sm text-[#86868b] line-clamp-2 mb-2">{show.overview}</p>

                  <div className="flex items-center gap-4 text-xs text-[#86868b]">
                    {show.firstAirDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(show.firstAirDate).getFullYear()}
                      </div>
                    )}
                    {show.totalSeasons && (
                      <div className="flex items-center gap-1">
                        <Tv className="w-3 h-3" />
                        {show.totalSeasons} season{show.totalSeasons !== 1 ? "s" : ""}
                      </div>
                    )}
                    {show.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {show.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#e5e5e7]">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full text-[#86868b] hover:bg-[#f5f5f7]"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
