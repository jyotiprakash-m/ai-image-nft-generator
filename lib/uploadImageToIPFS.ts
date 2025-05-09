import { upload } from "thirdweb/storage";
import { createThirdwebClient } from "thirdweb";

// Initialize Thirdweb client
const client = createThirdwebClient({
  clientId: process.env.THIRDWEB_CLIENT_ID,
  secretKey: process.env.THIRDWEB_SECRET_KEY || "",
});

export async function uploadImageToIPFS(imageUrl: string) {
  try {
    console.log("Uploading image to IPFS:", imageUrl);

    // Convert relative URL to absolute URL
    const absoluteUrl = imageUrl.startsWith("http")
      ? imageUrl
      : `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }${imageUrl}`;

    console.log("Absolute URL:", absoluteUrl);

    const response = await fetch(absoluteUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image at ${absoluteUrl}`);
    }

    const blob = await response.blob();
    const fileName = imageUrl.split("/").pop() || "uploaded_image.png";

    const file = new File([blob], fileName, { type: blob.type });

    console.log("Uploading file to IPFS...");
    const uri = await upload({
      client,
      files: [file],
    });

    console.log("Uploaded IPFS URI:", uri);
    return uri;
  } catch (error) {
    console.error("Error uploading image to IPFS:", error);
    throw error;
  }
}
