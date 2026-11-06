import type { Metadata, Viewport } from "next";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeetNote — meetings in, clarity out",
  description: "Paste a transcript and get a summary, decisions and an owner-assigned action list in seconds. Runs offline or with Gemini/Groq.",
};
export const viewport: Viewport = { themeColor: "#07060d" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="aurora">
        <Nav />
        <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
