"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Calendar, Edit2, Play, Check, Search, Star } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ShowSearchDialog } from "@/components/ShowSearchDialog"
import { AuthGuard } from "@/components/AuthGuard"
import { AuthButton } from "@/components/AuthButton"
import { useFirestore } from "@/hooks/useFirestore"
import { showsApi } from "@/services/showsApi"
import type { UserShow, WatchStatus, ShowSearchResult, ShowMetadata } from "@/types/show"

export default function TVTracker() {
  const { shows, loading, saveShow, deleteShow: deleteShowFromFirestore, updateShow } = useFirestore()
  const [newShowTitle, setNewShowTitle] = useState("")
  const [newShowSeasons, setNewShowSeasons] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false)
  const [editingDate, setEditingDate] = useState<{
    showId: number
    seasonId: number
    type: "started" | "watched"
  } | null>(null)
  const [editDateValue, setEditDateValue] = useState("")

  const addShow = async () => {
    if (!newShowTitle || !newShowSeasons) return

    const seasonsCount = Number.parseInt(newShowSeasons)
    const now = new Date().toISOString()

    const seasons = Array.from({ length: seasonsCount }, (_, seasonIndex) => ({
      id: seasonIndex + 1,
      status: "not-watched" as WatchStatus,
    }))

    const newShow: UserShow = {
      id: Date.now(),
      title: newShowTitle,
      seasons,
      addedDate: now,
      lastUpdated: now,
    }

    try {
      await saveShow(newShow)
      setNewShowTitle("")
      setNewShowSeasons("")
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error adding show:", error)
    }
  }

  const addShowFromSearch = async (searchResult: ShowSearchResult, metadata?: ShowMetadata) => {
    const now = new Date().toISOString()
    const seasonsCount = metadata?.totalSeasons || searchResult.totalSeasons || 1

    const seasons = Array.from({ length: seasonsCount }, (_, seasonIndex) => ({
      id: seasonIndex + 1,
      status: "not-watched" as WatchStatus,
    }))

    const newShow: UserShow = {
      id: Date.now(),
      externalId: searchResult.id,
      title: searchResult.title,
      seasons,
      metadata,
      addedDate: now,
      lastUpdated: now,
    }

    try {
      await saveShow(newShow)
    } catch (error) {
      console.error("Error adding show from search:", error)
    }
  }

  const deleteShow = async (showId: number) => {
    try {
      await deleteShowFromFirestore(showId)
    } catch (error) {
      console.error("Error deleting show:", error)
    }
  }

  const updateSeasonStatus = async (showId: number, seasonId: number, newStatus: WatchStatus) => {
    const show = shows.find((s) => s.id === showId)
    if (!show) return

    const updatedShow = {
      ...show,
      lastUpdated: new Date().toISOString(),
      seasons: show.seasons.map((season) => {
        const currentDate = getCurrentMonthYear()

        // If marking a season as watching or watched, auto-mark previous seasons as watched
        if ((newStatus === "watching" || newStatus === "watched") && season.id < seasonId) {
          // Only update if the previous season isn't already watched
          if (season.status !== "watched") {
            return {
              ...season,
              status: "watched" as WatchStatus,
              watchedDate: currentDate,
              startedDate: season.startedDate || currentDate,
            }
          }
          return season
        }

        // Update the target season
        if (season.id === seasonId) {
          const updatedSeason = { ...season, status: newStatus }

          if (newStatus === "watching") {
            updatedSeason.startedDate = currentDate
            updatedSeason.watchedDate = undefined
          } else if (newStatus === "watched") {
            updatedSeason.watchedDate = currentDate
            if (!updatedSeason.startedDate) {
              updatedSeason.startedDate = currentDate
            }
          } else if (newStatus === "not-watched") {
            updatedSeason.startedDate = undefined
            updatedSeason.watchedDate = undefined
          }

          return updatedSeason
        }

        return season
      }),
    }

    try {
      await updateShow(updatedShow)
    } catch (error) {
      console.error("Error updating season status:", error)
    }
  }

  const getCurrentMonthYear = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  }

  const formatDate = (dateString: string) => {
    const [year, month] = dateString.split("-")
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${monthNames[Number.parseInt(month) - 1]} ${year}`
  }

  const startEditingDate = (showId: number, seasonId: number, type: "started" | "watched", currentDate?: string) => {
    setEditingDate({ showId, seasonId, type })
    setEditDateValue(currentDate || getCurrentMonthYear())
  }

  const saveEditedDate = async () => {
    if (!editingDate) return

    const show = shows.find((s) => s.id === editingDate.showId)
    if (!show) return

    const updatedShow = {
      ...show,
      lastUpdated: new Date().toISOString(),
      seasons: show.seasons.map((season) => {
        if (season.id === editingDate.seasonId) {
          if (editingDate.type === "started") {
            return { ...season, startedDate: editDateValue }
          } else {
            return { ...season, watchedDate: editDateValue }
          }
        }
        return season
      }),
    }

    try {
      await updateShow(updatedShow)
      setEditingDate(null)
      setEditDateValue("")
    } catch (error) {
      console.error("Error updating date:", error)
    }
  }

  const cancelEditingDate = () => {
    setEditingDate(null)
    setEditDateValue("")
  }

  const getShowProgress = (show: UserShow) => {
    const totalSeasons = show.seasons.length
    const watchedSeasons = show.seasons.filter((season) => season.status === "watched").length
    const watchingSeasons = show.seasons.filter((season) => season.status === "watching").length
    return { watched: watchedSeasons, watching: watchingSeasons, total: totalSeasons }
  }

  const getStatusBadge = (status: WatchStatus) => {
    switch (status) {
      case "not-watched":
        return (
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Not Watched
          </div>
        )
      case "watching":
        return (
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5"></div>
            Watching
          </div>
        )
      case "watched":
        return (
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <Check className="w-3 h-3 mr-1" />
            Watched
          </div>
        )
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#f5f5f7] font-system">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-semibold text-[#1d1d1f] tracking-tight mb-2">TV Shows</h1>
              <p className="text-[#86868b] text-lg">Track your watching progress</p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsSearchDialogOpen(true)}
                className="bg-[#34c759] hover:bg-[#28a745] text-white border-0 rounded-lg px-4 py-2 font-medium shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <Search className="w-4 h-4 mr-2" />
                Search Shows
              </Button>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#007aff] hover:bg-[#0056cc] text-white border-0 rounded-lg px-4 py-2 font-medium shadow-sm transition-all duration-200 hover:shadow-md">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Manually
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white rounded-2xl border-0 shadow-2xl max-w-md">
                  <DialogHeader className="pb-4">
                    <DialogTitle className="text-xl font-semibold text-[#1d1d1f]">Add Show Manually</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium text-[#1d1d1f]">
                        Show Title
                      </Label>
                      <Input
                        id="title"
                        value={newShowTitle}
                        onChange={(e) => setNewShowTitle(e.target.value)}
                        placeholder="Enter show title"
                        className="border-[#d2d2d7] rounded-lg focus:border-[#007aff] focus:ring-[#007aff] focus:ring-opacity-20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seasons" className="text-sm font-medium text-[#1d1d1f]">
                        Number of Seasons
                      </Label>
                      <Input
                        id="seasons"
                        type="number"
                        value={newShowSeasons}
                        onChange={(e) => setNewShowSeasons(e.target.value)}
                        placeholder="e.g., 5"
                        min="1"
                        className="border-[#d2d2d7] rounded-lg focus:border-[#007aff] focus:ring-[#007aff] focus:ring-opacity-20"
                      />
                    </div>
                    <Button
                      onClick={addShow}
                      className="w-full bg-[#007aff] hover:bg-[#0056cc] text-white border-0 rounded-lg py-2.5 font-medium mt-6"
                    >
                      Add Show
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <AuthButton />
            </div>
          </div>

          <ShowSearchDialog
            open={isSearchDialogOpen}
            onOpenChange={setIsSearchDialogOpen}
            onSelectShow={addShowFromSearch}
          />

          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e7] p-16 text-center">
              <div className="w-16 h-16 bg-[#f5f5f7] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Plus className="w-8 h-8 text-[#86868b]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">Loading your shows...</h3>
              <p className="text-[#86868b]">Syncing your progress from the cloud</p>
            </div>
          ) : shows.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e7] p-16 text-center">
              <div className="w-16 h-16 bg-[#f5f5f7] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-[#86868b]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">No shows yet</h3>
              <p className="text-[#86868b] mb-4">Add your first TV show to start tracking your progress</p>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => setIsSearchDialogOpen(true)}
                  className="bg-[#34c759] hover:bg-[#28a745] text-white border-0 rounded-lg px-4 py-2 font-medium"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search Shows
                </Button>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-[#007aff] hover:bg-[#0056cc] text-white border-0 rounded-lg px-4 py-2 font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Manually
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {shows.map((show) => {
                const progress = getShowProgress(show)
                const progressPercentage = progress.total > 0 ? (progress.watched / progress.total) * 100 : 0

                return (
                  <div key={show.id} className="bg-white rounded-2xl shadow-sm border border-[#e5e5e7] overflow-hidden">
                    {/* Show Header */}
                    <div className="px-6 py-5 border-b border-[#e5e5e7]">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          {/* Show Poster */}
                          {show.metadata?.posterPath && (
                            <div className="w-16 h-24 bg-[#e5e5e7] rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={showsApi.getImageUrl(show.metadata.posterPath, "w154") || "/placeholder.svg"}
                                alt={show.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-2">
                              <h2 className="text-2xl font-semibold text-[#1d1d1f]">{show.title}</h2>
                              {show.metadata?.rating && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-[#f5f5f7] rounded-lg">
                                  <Star className="w-3 h-3 text-[#ff9500]" />
                                  <span className="text-xs font-medium text-[#1d1d1f]">
                                    {show.metadata.rating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {show.metadata?.overview && (
                              <p className="text-sm text-[#86868b] mb-3 line-clamp-2">{show.metadata.overview}</p>
                            )}

                            <div className="flex items-center gap-6">
                              <div className="text-sm text-[#86868b]">
                                {show.seasons.length} season{show.seasons.length !== 1 ? "s" : ""}
                              </div>
                              {show.metadata?.network && (
                                <div className="text-sm text-[#86868b]">{show.metadata.network}</div>
                              )}
                              {show.metadata?.firstAirDate && (
                                <div className="text-sm text-[#86868b]">
                                  {new Date(show.metadata.firstAirDate).getFullYear()}
                                </div>
                              )}
                              <div className="flex items-center gap-3">
                                <div className="text-sm text-[#86868b]">
                                  {progress.watched} of {progress.total} watched
                                </div>
                                <div className="w-32 h-1.5 bg-[#e5e5e7] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#34c759] rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                  />
                                </div>
                                <div className="text-sm font-medium text-[#1d1d1f] min-w-[3rem]">
                                  {Math.round(progressPercentage)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteShow(show.id)}
                          className="text-[#ff3b30] hover:text-[#d70015] hover:bg-[#ff3b30]/10 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Seasons */}
                    <div className="p-6">
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {show.seasons.map((season) => (
                          <div key={season.id} className="flex-shrink-0 w-56">
                            <div className="bg-[#f5f5f7] rounded-xl p-4 h-full">
                              <div className="space-y-3">
                                <div className="text-center space-y-2">
                                  <h4 className="font-semibold text-[#1d1d1f]">Season {season.id}</h4>
                                  {getStatusBadge(season.status)}
                                </div>

                                <div className="space-y-2">
                                  <button
                                    onClick={() => {
                                      if (season.status === "watching") {
                                        updateSeasonStatus(show.id, season.id, "not-watched")
                                      } else {
                                        updateSeasonStatus(show.id, season.id, "watching")
                                      }
                                    }}
                                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                      season.status === "watching"
                                        ? "bg-[#007aff] text-white shadow-sm"
                                        : "bg-white text-[#007aff] border border-[#007aff] hover:bg-[#007aff]/5"
                                    }`}
                                  >
                                    <Play className="w-3 h-3 inline mr-1.5" />
                                    Watching
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (season.status === "watched") {
                                        updateSeasonStatus(show.id, season.id, "not-watched")
                                      } else {
                                        updateSeasonStatus(show.id, season.id, "watched")
                                      }
                                    }}
                                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                      season.status === "watched"
                                        ? "bg-[#34c759] text-white shadow-sm"
                                        : "bg-white text-[#34c759] border border-[#34c759] hover:bg-[#34c759]/5"
                                    }`}
                                  >
                                    <Check className="w-3 h-3 inline mr-1.5" />
                                    Watched
                                  </button>
                                </div>

                                {/* Date Information */}
                                {season.startedDate && (
                                  <div className="pt-2 border-t border-[#e5e5e7]">
                                    <div className="text-xs text-[#86868b] mb-1 flex items-center">
                                      <Play className="w-3 h-3 mr-1" />
                                      Started
                                    </div>
                                    {editingDate?.showId === show.id &&
                                    editingDate?.seasonId === season.id &&
                                    editingDate?.type === "started" ? (
                                      <div className="space-y-2">
                                        <Input
                                          type="month"
                                          value={editDateValue}
                                          onChange={(e) => setEditDateValue(e.target.value)}
                                          className="text-xs h-7 border-[#d2d2d7] rounded-md"
                                        />
                                        <div className="flex gap-1">
                                          <Button
                                            size="sm"
                                            onClick={saveEditedDate}
                                            className="h-6 text-xs px-2 bg-[#007aff] hover:bg-[#0056cc] text-white border-0 rounded-md"
                                          >
                                            Save
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={cancelEditingDate}
                                            className="h-6 text-xs px-2 text-[#86868b] hover:bg-[#f5f5f7] rounded-md"
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-[#1d1d1f]">
                                          {formatDate(season.startedDate)}
                                        </span>
                                        <button
                                          onClick={() =>
                                            startEditingDate(show.id, season.id, "started", season.startedDate)
                                          }
                                          className="p-1 text-[#86868b] hover:text-[#007aff] rounded-md hover:bg-white transition-colors"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {season.status === "watched" && season.watchedDate && (
                                  <div className="pt-2 border-t border-[#e5e5e7]">
                                    <div className="text-xs text-[#86868b] mb-1 flex items-center">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      Completed
                                    </div>
                                    {editingDate?.showId === show.id &&
                                    editingDate?.seasonId === season.id &&
                                    editingDate?.type === "watched" ? (
                                      <div className="space-y-2">
                                        <Input
                                          type="month"
                                          value={editDateValue}
                                          onChange={(e) => setEditDateValue(e.target.value)}
                                          className="text-xs h-7 border-[#d2d2d7] rounded-md"
                                        />
                                        <div className="flex gap-1">
                                          <Button
                                            size="sm"
                                            onClick={saveEditedDate}
                                            className="h-6 text-xs px-2 bg-[#007aff] hover:bg-[#0056cc] text-white border-0 rounded-md"
                                          >
                                            Save
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={cancelEditingDate}
                                            className="h-6 text-xs px-2 text-[#86868b] hover:bg-[#f5f5f7] rounded-md"
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-[#1d1d1f]">
                                          {formatDate(season.watchedDate)}
                                        </span>
                                        <button
                                          onClick={() =>
                                            startEditingDate(show.id, season.id, "watched", season.watchedDate)
                                          }
                                          className="p-1 text-[#86868b] hover:text-[#007aff] rounded-md hover:bg-white transition-colors"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
