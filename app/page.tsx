"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {
  Download,
  Link2Icon,
  Loader2,
  Share,
  Share2,
  Trash,
} from "lucide-react";
import CountdownTimer from "@/components/custom/CountdownTimer";
import Link from "next/link";
import { SignedIn, UserButton } from "@clerk/nextjs";

type GenerateImageResponse = {
  imageUrl: string;
  description: string;
  title: string;
  tokenId?: number;
  createdAt?: number;
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [generateImageResponse, setGenerateImageResponse] =
    useState<GenerateImageResponse>();
  const [history, setHistory] = useState<GenerateImageResponse[]>([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("generated_images");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  const saveToHistory = (data: GenerateImageResponse) => {
    const record = { ...data, createdAt: Date.now() };
    const updated = [record, ...history.slice(0, 9)];
    setHistory(updated);
    localStorage.setItem("generated_images", JSON.stringify(updated));
  };
  const handleDeleteFromHistory = (indexToDelete: number) => {
    const updated = history.filter((_, index) => index !== indexToDelete);
    setHistory(updated);
    localStorage.setItem("generated_images", JSON.stringify(updated));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setImageUrl("");
    setGenerateImageResponse(undefined);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.error || "Failed to generate image");
      }

      const data = await res.json();
      setImageUrl(data.imageUrl);
      setGenerateImageResponse(data);
      saveToHistory(data); // save on success
    } catch (error) {
      console.error("Image generation error:", error);
      alert("❌ Something went wrong while generating the image.");
    } finally {
      setLoading(false);
    }
  };
  // add downloading image
  const downloadImage = async (imageUrl: string) => {
    const res = await fetch(
      `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
    );
    const blob = await res.blob();

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `generated-image-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleMint = async () => {
    setMinting(true);
    try {
      const res = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: imageUrl,
          title: generateImageResponse?.title,
          description: generateImageResponse?.description,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.error || "Failed to mint NFT");
      }
      const data = await res.json();
      alert(`✅ NFT minted! Tx Hash: ${data.transactionHash}`);
    } catch (error) {
      console.error("Minting error:", error);
      alert("❌ Something went wrong while minting the NFT.");
    } finally {
      setMinting(false);
    }
  };

  const handleSelectFromHistory = (record: GenerateImageResponse) => {
    setGenerateImageResponse(record);
    setImageUrl(record.imageUrl);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-28 md:w-40 border-r bg-gray-50 px-4 py-6 overflow-y-auto shadow-inner">
        <h2 className="text-center font-bold text-sm text-gray-700 mb-4 tracking-wide">
          History
        </h2>
        <div className="flex flex-col gap-3 items-center">
          {history.map((item, index) => (
            <div
              key={index}
              className="relative group w-16 h-16"
              title={item.title}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                onClick={() => handleSelectFromHistory(item)}
                onKeyUp={() => handleSelectFromHistory(item)}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:scale-105 transition duration-300 ring-1 ring-gray-300 hover:ring-blue-400"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFromHistory(index);
                }}
                title="Delete from history"
                className="absolute -top-3 -right-3  bg-white rounded-full"
              >
                <Trash className="h-4 w-4 text-red-600  " />
              </Button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main className="relative flex-1 flex flex-col items-center px-4 py-10 max-w-3xl mx-auto">
        <div className="w-full flex justify-end mb-4 gap-2 items-center">
          <Link
            href="https://testnets.opensea.io/collection/dall-e-generative-art"
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-lg rounded transition duration-300"
          >
            NFT Gallery
          </Link>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>

        {/* Loader Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-6">
          🎨 AI Image Generator & NFT Minter
        </h1>

        <Input
          className="border p-3 w-full text-lg"
          placeholder="Describe an image..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading || minting}
        />

        <Button
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg rounded transition duration-300"
          onClick={handleGenerate}
          disabled={loading || prompt.trim() === ""}
        >
          Generate Image
        </Button>

        {generateImageResponse?.imageUrl && (
          <div className="mt-8 w-full text-center">
            <img
              src={generateImageResponse.imageUrl}
              alt="Generated"
              className="w-full max-w-md mx-auto rounded-lg shadow-lg transition hover:scale-105 duration-300"
            />
            <div className="flex justify-center items-center gap-4 mt-4">
              <CountdownTimer url={generateImageResponse.imageUrl} />
              <Button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                onClick={() => downloadImage(generateImageResponse.imageUrl)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {generateImageResponse?.title && (
          <div className="mt-6 w-full">
            <h2 className="text-xl font-semibold mb-1">🖼️ Title:</h2>
            <p className="text-gray-800">{generateImageResponse.title}</p>
          </div>
        )}

        {generateImageResponse?.description && (
          <div className="mt-4 w-full">
            <h2 className="text-xl font-semibold mb-1">📝 Description:</h2>
            <p className="text-gray-800">{generateImageResponse.description}</p>
          </div>
        )}

        {generateImageResponse?.imageUrl && (
          <Button
            className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg rounded transition duration-300"
            onClick={handleMint}
            disabled={minting}
          >
            {minting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                Minting...
              </span>
            ) : (
              "Mint as NFT"
            )}
          </Button>
        )}
      </main>
    </div>
  );
}
