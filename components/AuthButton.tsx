"use client"

import { Button } from "@/components/ui/button"
import { LogIn, LogOut, User, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"

export function AuthButton() {
  const { user, signInWithGoogle, signOut, loading, error } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSignIn = async () => {
    setIsSigningIn(true)
    setLocalError(null)

    try {
      await signInWithGoogle()
    } catch (error: any) {
      setLocalError(error.message)
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleSignOut = async () => {
    setLocalError(null)
    try {
      await signOut()
    } catch (error: any) {
      setLocalError("Failed to sign out")
    }
  }

  if (loading) {
    return (
      <Button disabled className="bg-[#007aff] text-white border-0 rounded-lg px-4 py-2 font-medium">
        Loading...
      </Button>
    )
  }

  // Show error state
  if (error || localError) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Auth Error</span>
        </div>
        <Button
          onClick={handleSignIn}
          disabled={isSigningIn}
          className="bg-[#007aff] hover:bg-[#0056cc] text-white border-0 rounded-lg px-4 py-2 font-medium shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <LogIn className="w-4 h-4 mr-2" />
          {isSigningIn ? "Signing In..." : "Retry Sign In"}
        </Button>
      </div>
    )
  }

  if (!user) {
    return (
      <Button
        onClick={handleSignIn}
        disabled={isSigningIn}
        className="bg-[#007aff] hover:bg-[#0056cc] text-white border-0 rounded-lg px-4 py-2 font-medium shadow-sm transition-all duration-200 hover:shadow-md"
      >
        <LogIn className="w-4 h-4 mr-2" />
        {isSigningIn ? "Signing In..." : "Sign In"}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-lg px-3 py-2"
        >
          {user.photoURL ? (
            <img
              src={user.photoURL || "/placeholder.svg"}
              alt={user.displayName || "User"}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <User className="w-4 h-4" />
          )}
          <span className="font-medium">{user.displayName || "User"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white rounded-xl border border-[#e5e5e7] shadow-lg">
        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center gap-2 text-[#ff3b30] hover:bg-[#ff3b30]/10 rounded-lg cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
