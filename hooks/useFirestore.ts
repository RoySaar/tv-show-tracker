"use client"

import { useState, useEffect } from "react"
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/useAuth"
import type { UserShow } from "@/types/show"

export function useFirestore() {
  const { user } = useAuth()
  const [shows, setShows] = useState<UserShow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Real-time listener for user's shows
  useEffect(() => {
    if (!user) {
      setShows([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const showsRef = collection(db, "shows")
    const q = query(showsRef, where("userId", "==", user.uid), orderBy("addedDate", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const showsData: UserShow[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          showsData.push({
            id: Number.parseInt(doc.id),
            ...data,
          } as UserShow)
        })
        setShows(showsData)
        setLoading(false)
      },
      (err) => {
        console.error("Error fetching shows:", err)
        setError("Failed to load shows")
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user])

  const saveShow = async (show: UserShow) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const showData = {
        ...show,
        userId: user.uid,
        lastUpdated: serverTimestamp(),
      }

      await setDoc(doc(db, "shows", show.id.toString()), showData)
    } catch (err) {
      console.error("Error saving show:", err)
      throw new Error("Failed to save show")
    }
  }

  const deleteShow = async (showId: number) => {
    if (!user) throw new Error("User not authenticated")

    try {
      await deleteDoc(doc(db, "shows", showId.toString()))
    } catch (err) {
      console.error("Error deleting show:", err)
      throw new Error("Failed to delete show")
    }
  }

  const updateShow = async (show: UserShow) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const showData = {
        ...show,
        userId: user.uid,
        lastUpdated: serverTimestamp(),
      }

      await setDoc(doc(db, "shows", show.id.toString()), showData, { merge: true })
    } catch (err) {
      console.error("Error updating show:", err)
      throw new Error("Failed to update show")
    }
  }

  return {
    shows,
    loading,
    error,
    saveShow,
    deleteShow,
    updateShow,
  }
}
