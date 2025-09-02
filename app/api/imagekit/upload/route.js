// Import Next.js built-in response helper for API routes
import { NextResponse } from "next/server";

// Import ImageKit SDK for uploading images
import ImageKit from "imagekit";

// Import Clerk authentication helper for verifying the user
import { auth } from "@clerk/nextjs/server";

// -------------------------------------------
// Initialize ImageKit instance with API keys
// -------------------------------------------
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY, // Public key (safe for frontend use too)
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY, // Private key (keep secret - only server)
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT, // Your ImageKit URL endpoint
});

// -------------------------------------------
// Handle POST request (image upload endpoint)
// -------------------------------------------
export async function POST(request) {
  try {
    // -------------------------------
    // 1. Verify authentication
    // -------------------------------
    const { userId } = await auth(); // Get logged-in user's ID
    if (!userId) {
      // If no user found, return 401 Unauthorized
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // -------------------------------
    // 2. Get file data from request
    // -------------------------------
    const formData = await request.formData(); // Extract multipart form data
    const file = formData.get("file"); // Actual file
    const fileName = formData.get("fileName"); // Original file name

    // If no file provided, return 400 Bad Request
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // -------------------------------
    // 3. Convert file to Buffer
    // -------------------------------
    const bytes = await file.arrayBuffer(); // Convert to ArrayBuffer
    const buffer = Buffer.from(bytes); // Convert ArrayBuffer → Node.js Buffer

    // -------------------------------
    // 4. Generate unique filename
    // -------------------------------
    const timestamp = Date.now(); // Add timestamp to avoid collisions
    const sanitizedFileName =
      fileName?.replace(/[^a-zA-Z0-9.-]/g, "_") || "upload"; // Replace invalid chars
    const uniqueFileName = `${userId}/${timestamp}_${sanitizedFileName}`;
    // Example → "user123/1693658821345_my_photo.png"

    // -------------------------------
    // 5. Upload to ImageKit
    // -------------------------------
    const uploadResponse = await imagekit.upload({
      file: buffer, // File buffer
      fileName: uniqueFileName, // Unique file name
      folder: "/projects", // Destination folder in ImageKit
    });

    // -------------------------------
    // 6. Generate Thumbnail URL
    // -------------------------------
    const thumbnailUrl = imagekit.url({
      src: uploadResponse.url, // Source image URL
      transformation: [
        {
          width: 400, // Max width
          height: 300, // Max height
          cropMode: "maintain_ar", // Maintain aspect ratio
          quality: 80, // Reduce size for preview
        },
      ],
    });

    // -------------------------------
    // 7. Return upload result as JSON
    // -------------------------------
    return NextResponse.json({
      success: true,
      url: uploadResponse.url, // Original uploaded image URL
      thumbnailUrl: thumbnailUrl, // Transformed preview URL
      fileId: uploadResponse.fileId, // ImageKit's unique file ID
      width: uploadResponse.width, // Image width
      height: uploadResponse.height, // Image height
      size: uploadResponse.size, // File size in bytes
      name: uploadResponse.name, // File name stored in ImageKit
    });
  } catch (error) {
    // -------------------------------
    // 8. Handle errors gracefully
    // -------------------------------
    console.error("ImageKit upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload image", // Generic error message
        details: error.message, // Specific error for debugging
      },
      { status: 500 } // Internal Server Error
    );
  }
}
