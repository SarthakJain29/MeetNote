import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white border-b py-3 px-6 flex justify-between">
      <Link href="/" className="font-semibold text-xl text-blue-600">MeetNote</Link>
      <div className="space-x-4">
        <Link href="/">Home</Link>
        <Link href="/history">History</Link>
      </div>
    </nav>
  )
}
