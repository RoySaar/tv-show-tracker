"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import {
  type User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth"
import { auth } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user)
        setLoading(false)
        setError(null)
      })

      return () => unsubscribe()
    } catch (err) {
      console.error("Firebase auth state change error:", err)
      setError("Failed to initialize authentication")
      setLoading(false)
    }
  }, [])

  const signInWithGoogle = async () => {
    setError(null)

    try {
      // Check if Firebase is properly configured
      if (!auth) {
        throw new Error("Firebase authentication not initialized")
      }

      const provider = new GoogleAuthProvider()

      // Add additional scopes if needed
      provider.addScope("profile")
      provider.addScope("email")

      await signInWithPopup(auth, provider)
    } catch (error: any) {
      console.error("Error signing in with Google:", error)

      // Provide user-friendly error messages
      let errorMessage = "Failed to sign in with Google"

      if (error.code === "auth/configuration-not-found") {
        errorMessage = "Firebase configuration is incomplete. Please check your environment variables."
      } else if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in was cancelled"
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Pop-up was blocked. Please allow pop-ups for this site."
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection."
      }

      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const signOut = async () => {
    setError(null)

    try {
      await firebaseSignOut(auth)
    } catch (error: any) {
      console.error("Error signing out:", error)
      setError("Failed to sign out")
      throw error
    }
  }

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
