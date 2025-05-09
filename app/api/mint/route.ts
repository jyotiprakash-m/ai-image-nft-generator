// app/api/mint/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { uploadImageToIPFS } from "@/lib/uploadImageToIPFS";
import {
  type NFTMetadata,
  uploadMetadataToIPFS,
} from "@/lib/uploadMetadataToIPFS";
import contractArtifact from "@/lib/dall_E.json";

const { RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS, MINTER_ADDRESS } = process.env;

if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS || !MINTER_ADDRESS) {
  throw new Error(
    "Missing one of: RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS, or MINTER_ADDRESS"
  );
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  contractArtifact.output.abi,
  wallet
);

export async function POST(req: NextRequest) {
  try {
    const { url, title, description, tokenId } = await req.json();

    if (!url || !title || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate random tokenId if not provided
    const finalTokenId = tokenId ?? Math.floor(Math.random() * 1_000_000_000);

    const ipfsImageUrl = await uploadImageToIPFS(url);

    if (!ipfsImageUrl) {
      return NextResponse.json(
        { error: "Failed to upload image to IPFS" },
        { status: 500 }
      );
    }

    const metadata: NFTMetadata = {
      name: title,
      description,
      image: ipfsImageUrl,
      properties: { token_id: finalTokenId },
    };

    console.log("Uploading metadata to IPFS:", metadata);

    const metadataIpfsUrl = await uploadMetadataToIPFS(metadata);

    console.log("Minting NFT to:", MINTER_ADDRESS);

    const tx = await contract.mint(
      MINTER_ADDRESS,
      finalTokenId,
      1,
      metadataIpfsUrl
    );
    const receipt = await tx.wait();

    console.log("NFT minted, tx receipt:", receipt);

    return NextResponse.json(
      {
        message: "NFT minted successfully",
        transactionHash: receipt.hash,
        tokenId: finalTokenId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Minting failed:", error);
    return NextResponse.json(
      { error: "Something went wrong during minting." },
      { status: 500 }
    );
  }
}
