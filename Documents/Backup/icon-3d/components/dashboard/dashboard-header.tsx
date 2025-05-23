"use client";

import Link from "next/link"
import UserButton from "@/components/auth/user-button"
import CreditBadge from "@/components/credit-badge"
import { useCredits } from "@/hooks/use-credits"

export default function DashboardHeader() {
  const { credits } = useCredits()

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold mr-8">
            icon3d.ai
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-gray-600 hover:text-black transition-colors">
              Dashboard
            </Link>
            <Link href="/create" className="text-gray-600 hover:text-black transition-colors">
              Create Icon
            </Link>
            <Link href="/gallery" className="text-gray-600 hover:text-black transition-colors">
              My Icons
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <CreditBadge credits={credits} />
          <UserButton />
        </div>
      </div>
    </header>
  )
}
