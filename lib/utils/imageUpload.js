/**
 * Chuyển đổi file ảnh sang WebP bằng Canvas API
 * @param {File} file - File ảnh gốc
 * @param {number} maxSize - Kích thước tối đa (px) cho cạnh dài nhất
 * @param {number} quality - Chất lượng WebP (0-1)
 * @returns {Promise<Blob>} WebP blob
 */
export async function convertToWebP(file, maxSize = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error("Canvas toBlob thất bại")),
        "image/webp",
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Không thể tải ảnh")); };
    img.src = url;
  });
}

/**
 * Upload ảnh lên Supabase Storage, tự động convert sang WebP
 * @param {File} file - File ảnh gốc
 * @param {object} supabase - Supabase client
 * @param {string} bucket - Tên bucket
 * @param {string} folder - Thư mục con trong bucket
 * @param {number} maxSize - Kích thước tối đa (px)
 * @param {number} quality - Chất lượng WebP
 * @returns {Promise<string>} Public URL
 */
export async function uploadImageAsWebP(file, supabase, bucket, folder = "", maxSize = 1200, quality = 0.85) {
  if (!file.type.startsWith("image/")) throw new Error("Vui lòng chọn file ảnh");
  if (file.size > 20 * 1024 * 1024) throw new Error("Ảnh quá lớn (tối đa 20MB)");

  const webpBlob = await convertToWebP(file, maxSize, quality);
  const fileName = `${folder ? folder + "/" : ""}${Date.now()}.webp`;

  const { error: upErr } = await supabase.storage
    .from(bucket)
    .upload(fileName, webpBlob, { contentType: "image/webp", upsert: true });

  if (upErr) throw upErr;

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return publicUrl;
}
