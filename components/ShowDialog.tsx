"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface ShowDialogProps {
  isOpen: boolean
  onClose: () => void
  newShowTitle: string
  setNewShowTitle: (title: string) => void
  newShowSeasons: string
  setNewShowSeasons: (seasons: string) => void
  addShow: () => void
}

export function ShowDialog({
  isOpen,
  onClose,
  newShowTitle,
  setNewShowTitle,
  newShowSeasons,
  setNewShowSeasons,
  addShow,
}: ShowDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
  )
}
