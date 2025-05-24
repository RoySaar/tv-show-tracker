"use client"

import { Plus } from "lucide-react"
import { useState } from "react"

import { ShowCard } from "@/components/ShowCard"
import { ShowDialog } from "@/components/ShowDialog"
import { SearchDialog } from "@/components/SearchDialog"
import { EditDateDialog } from "@/components/EditDateDialog"
import { getCurrentMonthYear } from "@/lib/utils"
import { AuthGuard } from "@/components/AuthGuard"
import { AuthButton } from "@/components/AuthButton"
import { useFirestore } from "@/hooks/useFirestore"

type WatchStatus = "not-watched" | "watching" | "watched"

interface Season {
  id: number
  status: WatchStatus
  startedDate?: string
  watchedDate?: string
}

interface UserShow {
  id: number
  externalId?: number
  title: string
  seasons: Season[]
  addedDate: string
  lastUpdated: string
  metadata?: ShowMetadata
}

interface ShowSearchResult {
  id: number
  title: string
  totalSeasons?: number
}

interface ShowMetadata {
  totalSeasons: number
}

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false)
  const [newShowTitle, setNewShowTitle] = useState("")
  const [newShowSeasons, setNewShowSeasons] = useState("")
  const [editingDate, setEditingDate] = useState<{
    showId: number
    seasonId: number
    type: "started" | "watched"
  } | null>(null)
  const [editDateValue, setEditDateValue] = useState("")

  const { shows, loading, saveShow, deleteShow: deleteShowFromFirestore, updateShow } = useFirestore()

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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#f5f5f7] font-system">
        <header className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-semibold">My Shows</h1>
          <div className="space-x-2">
            <button
              onClick={() => setIsDialogOpen(true)}
              className="bg-white rounded-2xl shadow-sm border border-[#e5e5e7] px-4 py-2 text-sm font-medium"
            >
              Add Show
            </button>
            <button
              onClick={() => setIsSearchDialogOpen(true)}
              className="bg-white rounded-2xl shadow-sm border border-[#e5e5e7] px-4 py-2 text-sm font-medium"
            >
              Search
            </button>
            <AuthButton />
          </div>
        </header>

        <main className="p-4">
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
              <p className="text-[#86868b]">Add a show to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {shows.map((show) => (
                <ShowCard
                  key={show.id}
                  show={show}
                  deleteShow={deleteShow}
                  updateSeasonStatus={updateSeasonStatus}
                  setEditingDate={setEditingDate}
                  setEditDateValue={setEditDateValue}
                />
              ))}
            </div>
          )}
        </main>

        <ShowDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          newShowTitle={newShowTitle}
          setNewShowTitle={setNewShowTitle}
          newShowSeasons={newShowSeasons}
          setNewShowSeasons={setNewShowSeasons}
          addShow={addShow}
        />

        <SearchDialog
          isOpen={isSearchDialogOpen}
          onClose={() => setIsSearchDialogOpen(false)}
          addShowFromSearch={addShowFromSearch}
        />

        <EditDateDialog
          editingDate={editingDate}
          setEditingDate={setEditingDate}
          editDateValue={editDateValue}
          setEditDateValue={setEditDateValue}
          saveEditedDate={saveEditedDate}
        />
      </div>
    </AuthGuard>
  )
}
