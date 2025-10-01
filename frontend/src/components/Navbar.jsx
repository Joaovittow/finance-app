import React from 'react'
import { Wallet, Home } from 'lucide-react'

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="h-8 w-8" />
            <h1 className="text-xl font-bold">Finance App</h1>
          </div>
          <div className="flex items-center space-x-4">
            <a href="/" className="flex items-center space-x-1 hover:text-blue-200">
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar