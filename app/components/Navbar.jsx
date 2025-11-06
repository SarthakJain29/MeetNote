import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-bold text-2xl text-blue-600 hover:text-blue-700 transition-colors">
            MeetNote
          </Link>
          <div className="flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/history" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              History
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
