import { supabase } from './supabase';

/**
 * Uploads a dish image to the Supabase storage bucket `dish-images`
 * and returns the public URL of the uploaded image.
 * 
 * @param file The image file selected by the user
 * @returns The public access URL of the uploaded image
 */
export const uploadDishImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;

  // Upload file to 'dish-images' bucket
  const { error: uploadError } = await supabase.storage
    .from('dish-images')
    .upload(fileName, file);

  if (uploadError) {
    throw new Error('Error uploading file to storage: ' + uploadError.message);
  }

  // Retrieve public URL
  const { data: urlData } = supabase.storage
    .from('dish-images')
    .getPublicUrl(fileName);

  if (!urlData || !urlData.publicUrl) {
    throw new Error('Error retrieving public URL for uploaded file.');
  }

  return urlData.publicUrl;
};
