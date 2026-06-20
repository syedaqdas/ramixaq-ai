import crypto from "node:crypto";

const cloudinaryConfig = () => ({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET
});

export const uploadProfileImage = async (file, userId) => {
  const { cloudName, apiKey, apiSecret } = cloudinaryConfig();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Profile photo uploads require Cloudinary environment variables");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "ramixaq-ai/avatars";
  const publicId = String(userId);
  const signaturePayload = `folder=${folder}&overwrite=true&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(signaturePayload).digest("hex");
  const form = new FormData();

  form.append("file", new Blob([file.buffer], { type: file.mimetype }), file.originalname);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", folder);
  form.append("public_id", publicId);
  form.append("overwrite", "true");

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Cloudinary upload failed");
  }

  return {
    url: data.secure_url,
    publicId: data.public_id
  };
};
