import api from '@/lib/api';
import { API_ROUTES } from '@/constants/api';

export interface UploadImageResponse {
  message: string;
  imageUrl: string;
}

// Upload image API call
export const uploadImage = async (
  imageUri: string,
  folder: string = 'events'
): Promise<UploadImageResponse> => {
  try {
    // Create FormData for multipart/form-data
    const formData = new FormData();
    
    // Extract filename from URI or use default
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri: imageUri,
      type,
      name: filename,
    } as any);

    formData.append('folder', folder);

    const response = await api.post<UploadImageResponse>(
      API_ROUTES.UPLOAD.IMAGE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to upload image';
    throw new Error(errorMessage);
  }
};

