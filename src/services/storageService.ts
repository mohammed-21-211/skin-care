import { supabase } from './supabaseClient';
import { RULES } from '@/config/constants';

/** Validate an image file against the spec's size/type rules. Returns an error key or null. */
export function validateImage(file: File): 'imageTooLarge' | 'invalidType' | null {
  if (!RULES.ACCEPTED_IMAGE_TYPES.includes(file.type as never)) return 'invalidType';
  if (file.size > RULES.MAX_IMAGE_BYTES) return 'imageTooLarge';
  return null;
}

export const storageService = {
  /** Upload a face photo to the user's private folder. Returns the storage path. */
  async uploadFacePhoto(userId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from(RULES.STORAGE_BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type });
    if (error) throw error;
    return path;
  },

  /** Create a short-lived signed URL for displaying a stored photo. */
  async getSignedUrl(path: string, expiresInSeconds = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(RULES.STORAGE_BUCKET)
      .createSignedUrl(path, expiresInSeconds);
    if (error) throw error;
    return data.signedUrl;
  },
};
