const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export class UploadValidationError extends Error {}

export function validateImageFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new UploadValidationError(
      "Format file harus JPG, PNG, atau WebP."
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadValidationError(
      "Ukuran file maksimal 5MB."
    );
  }
}

export interface UploadResult {
  secure_url: string;
  public_id: string;
}

/**
 * Unggah gambar ke Cloudinary lewat unsigned upload preset.
 * Cloudinary preset harus dikonfigurasi untuk auto-transform ke WebP, max width 1200px
 * (Settings > Upload > Upload presets > Incoming transformation: w_1200,c_limit,f_webp,q_auto).
 */
export function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  validateImageFile(file);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Konfigurasi Cloudinary belum lengkap. Cek environment variable."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
    );

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({ secure_url: data.secure_url, public_id: data.public_id });
      } else {
        reject(new Error("Upload ke Cloudinary gagal. Coba lagi."));
      }
    };

    xhr.onerror = () => reject(new Error("Koneksi terputus saat upload."));
    xhr.send(formData);
  });
}
