import Link from "next/link";

export default function NotFound() {
  return (
    <div className="glass mx-auto mt-16 max-w-md p-10 text-center">
      <h1 className="font-display text-3xl font-bold text-white">Lost in the meeting</h1>
      <p className="mt-2 text-zinc-400">That page doesn&apos;t exist.</p>
      <Link href="/" className="btn-primary mt-6">Go home</Link>
    </div>
  );
}
