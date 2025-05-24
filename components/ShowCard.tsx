"use client"

import { Trash2, Calendar, Edit2, Play, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UserShow, WatchStatus } from "@/types/show"

interface ShowCardProps {
  show: UserShow
  deleteShow: (showId: number) => void
  updateSeasonStatus: (showId: number, seasonId: number, newStatus: WatchStatus) => void
  setEditingDate: (data: { showId: number; seasonId: number; type: "started" | "watched" } | null) => void
  setEditDateValue: (value: string) => void
}

export function ShowCard({ show, deleteShow, updateSeasonStatus, setEditingDate, setEditDateValue }: ShowCardProps) {
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

  const formatDate = (dateString: string) => {
    const [year, month] = dateString.split("-")
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${monthNames[Number.parseInt(month) - 1]} ${year}`
  }

  const getCurrentMonthYear = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  }

  const startEditingDate = (showId: number, seasonId: number, type: "started" | "watched", currentDate?: string) => {
    setEditingDate({ showId, seasonId, type })
    setEditDateValue(currentDate || getCurrentMonthYear())
  }

  const progress = getShowProgress(show)
  const progressPercentage = progress.total > 0 ? (progress.watched / progress.total) * 100 : 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e7] overflow-hidden">
      {/* Show Header */}
      <div className="px-6 py-5 border-b border-[#e5e5e7]">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-2">{show.title}</h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-[#86868b]">
                {show.seasons.length} season{show.seasons.length !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-[#86868b]">
                  {progress.watched} of {progress.total} watched
                </div>
                <div className="w-24 h-1.5 bg-[#e5e5e7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#34c759] rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="text-sm font-medium text-[#1d1d1f] min-w-[3rem]">{Math.round(progressPercentage)}%</div>
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
      <div className="p-4">
        <div className="grid grid-cols-1 gap-3">
          {show.seasons.map((season) => (
            <div key={season.id} className="bg-[#f5f5f7] rounded-xl p-4">
              <div className="space-y-3">
                <div className="text-center space-y-2">
                  <h4 className="font-semibold text-[#1d1d1f]">Season {season.id}</h4>
                  {getStatusBadge(season.status)}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (season.status === "watching") {
                        updateSeasonStatus(show.id, season.id, "not-watched")
                      } else {
                        updateSeasonStatus(show.id, season.id, "watching")
                      }
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#1d1d1f]">{formatDate(season.startedDate)}</span>
                      <button
                        onClick={() => startEditingDate(show.id, season.id, "started", season.startedDate)}
                        className="p-1 text-[#86868b] hover:text-[#007aff] rounded-md hover:bg-white transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {season.status === "watched" && season.watchedDate && (
                  <div className="pt-2 border-t border-[#e5e5e7]">
                    <div className="text-xs text-[#86868b] mb-1 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Completed
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#1d1d1f]">{formatDate(season.watchedDate)}</span>
                      <button
                        onClick={() => startEditingDate(show.id, season.id, "watched", season.watchedDate)}
                        className="p-1 text-[#86868b] hover:text-[#007aff] rounded-md hover:bg-white transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
