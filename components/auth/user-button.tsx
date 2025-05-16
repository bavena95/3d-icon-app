"use client"

import { UserButton as ClerkUserButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function UserButton() {
  const { isSignedIn, user } = useUser()

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button>
        <Button asChild className="bg-black text-white hover:bg-gray-800">
          <Link href="/sign-up">Create Account</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <Button asChild className="bg-black text-white hover:bg-gray-800">
        <Link href="/dashboard">Dashboard</Link>
      </Button>
      <ClerkUserButton afterSignOutUrl="/" />
    </div>
  )
}
