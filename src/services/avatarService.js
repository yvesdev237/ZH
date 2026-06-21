import { db } from "./database";

const BUCKET_NAME = "avatar";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Initialize avatar bucket (call this once during app setup)
 */
export const initAvatarBucket = async () => {
  try {
    const { data: buckets } = await db.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === BUCKET_NAME);

    if (!exists) {
      const { data, error } = await db.storage.createBucket(BUCKET_NAME, {
        public: true,
      });
      if (error) throw error;
      console.log("Avatar bucket created:", data);
    }
  } catch (error) {
    console.error("Error initializing avatar bucket:", error);
  }
};

/**
 * Construct full avatar URL from storage key
 * @param {string} key - Storage key/path
 * @returns {string|null}
 */
export const getAvatarUrlFromKey = (key) => {
  if (!key || typeof key !== "string") return null;
  if (key.startsWith("http")) return key;

  const { data } = db.storage.from(BUCKET_NAME).getPublicUrl(key);
  return data?.publicUrl || null;
};

/**
 * Upload avatar to Supabase Storage and save to profiles table
 * @param {File} file - Image file to upload
 * @param {string} userId - User ID
 * @returns {Promise<{url: string, error: null} | {url: null, error: string}>}
 */
export const uploadAvatar = async (file, userId) => {
  try {
    // Validate file
    if (!file) {
      return { url: null, error: "No file provided" };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        url: null,
        error: `File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      };
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      return {
        url: null,
        error: "Only JPG and PNG files are supported",
      };
    }

    // Remove old avatar if exists
    const { data: files } = await db.storage.from(BUCKET_NAME).list(userId);

    if (files && files.length > 0) {
      const filePaths = files.map((f) => `${userId}/${f.name}`);
      await db.storage.from(BUCKET_NAME).remove(filePaths);
    }

    // Upload new avatar
    const fileName = `avatar_${Date.now()}.${file.type === "image/jpeg" ? "jpg" : "png"}`;
    const storagePath = `${userId}/${fileName}`;

    const { data, error } = await db.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return { url: null, error: error.message };
    }

    // Update profiles table with storage key
    const { error: updateError } = await db
      .from("profiles")
      .update({ avatar_url: data.path })
      .eq("id", userId);

    if (updateError) {
      console.error("Update profiles error:", updateError);
      return { url: null, error: updateError.message };
    }

    // Get public URL
    const publicUrl = getAvatarUrlFromKey(data.path);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error("Avatar upload error:", error);
    return { url: null, error: error.message };
  }
};

/**
 * Get avatar for user from profiles table
 * @param {string} userId - User ID
 * @returns {Promise<{key: string|null, url: string|null, error: string|null}>}
 */
export const getUserAvatar = async (userId) => {
  try {
    const { data, error } = await db
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user avatar:", error);
      return { key: null, url: null, error: error.message };
    }

    const key = data?.avatar_url || null;
    const url = key ? getAvatarUrlFromKey(key) : null;

    return { key, url, error: null };
  } catch (error) {
    console.error("Error in getUserAvatar:", error);
    return { key: null, url: null, error: error.message };
  }
};

/**
 * Delete user's avatar
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const deleteAvatar = async (userId) => {
  try {
    const { data: files } = await db.storage.from(BUCKET_NAME).list(userId);

    if (files && files.length > 0) {
      const filePaths = files.map((f) => `${userId}/${f.name}`);
      await db.storage.from(BUCKET_NAME).remove(filePaths);
    }

    // Remove from profiles table
    const { error } = await db
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Avatar delete error:", error);
    return { success: false, error: error.message };
  }
};
