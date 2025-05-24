"use client"

import type React from "react"

import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { LogIn, Tv, AlertCircle, RefreshCw } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, signInWithGoogle, error } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#007aff] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Tv className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">Loading...</h3>
          <p className="text-[#86868b]">Setting up your TV tracker</p>
        </div>
      </div>
    )
  }

  // Show error state with debugging info
  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e7] p-16 text-center max-w-lg">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-2xl font-semibold text-[#1d1d1f] mb-2">Configuration Error</h3>
          <p className="text-[#86868b] mb-4">{error}</p>

          <div className="bg-[#f5f5f7] rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-[#86868b] mb-2">Debug Information:</p>
            <div className="text-xs text-[#86868b] space-y-1">
              <div>API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✓ Set" : "✗ Missing"}</div>
              <div>Auth Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✓ Set" : "✗ Missing"}</div>
              <div>Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✓ Set" : "✗ Missing"}</div>
              <div>Storage Bucket: {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "✓ Set" : "✗ Missing"}</div>
              <div>
                Messaging Sender ID: {process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "✓ Set" : "✗ Missing"}
              </div>
              <div>App ID: {process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "✓ Set" : "✗ Missing"}</div>
            </div>
          </div>

          <Button
            onClick={() => window.location.reload()}
            className="bg-[#007aff] hover:bg-[#0056cc] text-white border-0 rounded-lg px-6 py-3 font-medium shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Page
          </Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e7] p-16 text-center max-w-md">
          <div className="w-16 h-16 bg-[#007aff] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Tv className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-semibold text-[#1d1d1f] mb-2">Welcome to TV Tracker</h3>
          <p className="text-[#86868b] mb-6">
            Sign in to start tracking your favorite TV shows and sync your progress across devices.
          </p>
          <Button
            onClick={signInWithGoogle}
            className="bg-[#007aff] hover:bg-[#0056cc] text-white border-0 rounded-lg px-6 py-3 font-medium shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign in with Google
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
