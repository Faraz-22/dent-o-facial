export interface CompressOptions {
  maxWidth?: number;
  targetWidth?: number;
  targetHeight?: number;
  quality?: number;
  crop?: boolean;
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const { maxWidth = 1200, targetWidth, targetHeight, quality = 0.7, crop = false } = options;

  // If it's not an image (e.g., PDF), return the original file
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        let finalWidth = img.width;
        let finalHeight = img.height;
        let srcX = 0, srcY = 0, srcWidth = img.width, srcHeight = img.height;

        if (targetWidth && targetHeight && crop) {
          finalWidth = targetWidth;
          finalHeight = targetHeight;
          const imgRatio = img.width / img.height;
          const targetRatio = targetWidth / targetHeight;

          if (imgRatio > targetRatio) {
            // Image is wider than target: crop horizontally
            srcHeight = img.height;
            srcWidth = img.height * targetRatio;
            srcX = (img.width - srcWidth) / 2;
          } else {
            // Image is taller than target: crop vertically
            srcWidth = img.width;
            srcHeight = img.width / targetRatio;
            srcY = (img.height - srcHeight) / 2;
          }
        } else if (targetWidth && targetHeight && !crop) {
            finalWidth = targetWidth;
            finalHeight = targetHeight;
        } else {
          // Standard max width scaling
          if (finalWidth > maxWidth) {
            finalHeight = (maxWidth / finalWidth) * finalHeight;
            finalWidth = maxWidth;
          }
        }

        canvas.width = finalWidth;
        canvas.height = finalHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, finalWidth, finalHeight);
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // fallback
            }
          }, 'image/jpeg', quality);
        } else {
          resolve(file); // fallback if no context
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}
