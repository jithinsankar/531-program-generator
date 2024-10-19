import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "5/3/1 Workout Generator",
  description:
    "A tool to create personalized 5/3/1 strength training programs based on your 1-rep max and training cycle.",
  openGraph: {
    title: "5/3/1 Workout Generator",
    description:
      "A tool to create personalized 5/3/1 strength training programs based on your 1-rep max and training cycle.",
    url: "https://531-program-generator.vercel.app/",
    siteName: "5/3/1 Workout Generator",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link
        rel="icon"
        href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏋🏽</text></svg>"
      />

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
