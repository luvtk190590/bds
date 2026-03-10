import slugifyLib from "slugify";

/**
 * Tạo slug từ title tiếng Việt
 * "Căn hộ 3 phòng ngủ Quận 7" → "can-ho-3-phong-ngu-quan-7"
 */
export function createSlug(text) {
    if (!text) return "";
    return slugifyLib(text, {
        lower: true,
        strict: true,
        locale: "vi",
    });
}

/**
 * Tạo slug unique bằng cách thêm timestamp
 */
export function createUniqueSlug(text) {
    const base = createSlug(text);
    const timestamp = Date.now().toString(36);
    return `${base}-${timestamp}`;
}
