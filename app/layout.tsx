import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Art Generator & NFT Creator | DALL·E + Blockchain",
  description:
    "Generate stunning AI artwork using OpenAI's DALL·E and mint them as NFTs on the blockchain. Own your imagination, one token at a time.",
  applicationName: "AI NFT Minter",
  generator: "Next.js",
  keywords: [
    "AI image generator",
    "DALL·E",
    "NFT creator",
    "AI art",
    "blockchain art",
    "mint NFT",
    "OpenAI",
    "Web3 art",
    "AI NFT marketplace",
    "create NFT from image",
    "AI creativity",
  ],
  authors: [
    {
      name: "Jyoti Prakash Mohanta",
      url: "https://ai-image-nft-generator-taupe.vercel.app",
    },
  ],
  creator: "Jyoti Prakash Mohanta",
  metadataBase: new URL("https://ai-image-nft-generator-taupe.vercel.app"),

  // 🌐 Open Graph (used by LinkedIn and Facebook)
  openGraph: {
    title: "AI Art Generator & NFT Creator",
    description:
      "Generate stunning AI artwork with DALL·E and mint it as NFTs on the blockchain. Instantly turn text into collectible digital art.",
    url: "https://ai-image-nft-generator-taupe.vercel.app",
    siteName: "AI NFT Minter",
    images: [
      {
        url: "https://ai-image-nft-generator-taupe.vercel.app/website.png", // make sure this is public!
        width: 1200,
        height: 630,
        alt: "AI-generated art example",
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // 🐦 Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "AI Art Generator & NFT Creator",
    description:
      "Generate images with AI and mint them as NFTs on the blockchain. Powered by DALL·E and Web3.",
    images: ["https://ai-image-nft-generator-taupe.vercel.app/website.png"],
  },

  // 🕷️ Robots & indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // 🌈 Appearance
  themeColor: "#0f172a",

  // 📱 Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  // 🗂️ Category (for some search engines)
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
