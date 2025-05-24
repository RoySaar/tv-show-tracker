"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface EditDateDialogProps {
  editingDate: { showId: number; seasonId: number; type: "started" | "watched" } | null
  setEditingDate: (data: { showId: number; seasonId: number; type: "started" | "watched" } | null) => void
  editDateValue: string
  setEditDateValue: (value: string) => void
  saveEditedDate: () => void
}

export function EditDateDialog({
  editingDate,
  setEditingDate,
  editDateValue,
  setEditDateValue,
  saveEditedDate,
}: EditDateDialogProps) {
  const cancelEditingDate = () => {
    setEditingDate(null)
  }

  const handleSave = () => {
    saveEditedDate()
  }

  return (
    <Dialog open={!!editingDate} onOpenChange={() => setEditingDate(null)}>
      <DialogContent className="bg-white rounded-2xl border-0 shadow-2xl max-w-md">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-[#1d1d1f]">
            Edit {editingDate?.type === "started" ? "Started" : "Completed"} Date
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="month"
            value={editDateValue}
            onChange={(e) => setEditDateValue(e.target.value)}
            className="border-[#d2d2d7] rounded-lg focus:border-[#007aff] focus:ring-[#007aff] focus:ring-opacity-20"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              className="flex-1 bg-[#007aff] hover:bg-[#0056cc] text-white border-0 rounded-lg py-2.5 font-medium"
            >
              Save
            </Button>
            <Button
              variant="ghost"
              onClick={cancelEditingDate}
              className="flex-1 text-[#86868b] hover:bg-[#f5f5f7] rounded-lg py-2.5 font-medium"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
