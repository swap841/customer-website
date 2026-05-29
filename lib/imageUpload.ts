// SECURITY: This file now proxies through a server-side API route.
// The ImgBB API key is stored server-side, never exposed to the client.

export async function uploadToImgBB(file: File): Promise<string> {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    throw new Error("File is too large. Maximum allowed size is 10MB.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Invalid file type. Please upload an image file (PNG, JPG, JPEG, WEBP, GIF).");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/upload-photo", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || `HTTP error ${response.status}`);
  }

  if (data.success && data.url) {
    return data.url;
  }

  throw new Error(data.error?.message || "Upload failed.");
}
