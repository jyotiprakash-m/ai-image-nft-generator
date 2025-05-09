import { upload } from "thirdweb/storage";
import { createThirdwebClient } from "thirdweb";

// Initialize Thirdweb client
const client = createThirdwebClient({
  clientId: process.env.THIRDWEB_CLIENT_ID,
  secretKey: process.env.THIRDWEB_SECRET_KEY || "",
});

/**
 * Type definition for NFT metadata
 */
export interface NFTMetadata {
  name: string;
  description: string;
  image: string; // IPFS URI of the image
  properties: {
    token_id: string;
  };
}

/**
 * Upload metadata JSON to IPFS
 * @param metadata - The metadata JSON object to upload
 * @returns The IPFS URI of the uploaded metadata
 */
export async function uploadMetadataToIPFS(
  metadata: NFTMetadata
): Promise<string> {
  try {
    console.log("Uploading metadata to IPFS:", metadata);

    // Convert metadata JSON to a Blob
    const metadataBlob = new Blob([JSON.stringify(metadata)], {
      type: "application/json",
    });

    const fileName = metadata.properties.token_id
      ? `${metadata.properties.token_id}.json`
      : "metadata.json";

    // Create a File object from the metadata Blob
    const file = new File([metadataBlob], fileName, {
      type: "application/json",
    });

    console.log("Uploading metadata file to IPFS...");
    const uri = await upload({
      client,
      files: [file],
    });

    console.log("Uploaded metadata IPFS URI:", uri);
    return uri;
  } catch (error) {
    console.error("Error uploading metadata to IPFS:", error);
    throw error;
  }
}
