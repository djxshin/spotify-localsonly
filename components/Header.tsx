"use client"

import Link from "next/link"
import { HomeIcon, InfoIcon } from "lucide-react"

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold flex items-center">
            <HomeIcon className="mr-2" />
            LocalVibes
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/about"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <InfoIcon className="mr-1" size={18} />
              About
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}

