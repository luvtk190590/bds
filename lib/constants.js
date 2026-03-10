/**
 * Các constants dùng chung trong toàn bộ app
 */

// Trung tâm bản đồ mặc định (TP. Hồ Chí Minh)
export const DEFAULT_MAP_CENTER = {
    lat: 10.8231,
    lng: 106.6297,
};

export const DEFAULT_MAP_ZOOM = 12;

// Property categories (dùng cho quản lý / bộ lọc)
// ID khớp với thứ tự INSERT trong migration 015
// typeIds: IDs thực tế từ bảng property_types trong DB (range 11–48)
export const PROPERTY_CATEGORIES = [
    { id: 1, name: "Căn hộ",              slug: "can-ho",            typeIds: [14, 15, 23, 26, 27, 37, 42] },
    { id: 2, name: "Nhà phố",             slug: "nha-pho",           typeIds: [19, 31, 46] },
    { id: 3, name: "Đất nền",             slug: "dat-nen",           typeIds: [20, 21, 22] },
    { id: 4, name: "Biệt thự",            slug: "biet-thu",          typeIds: [17, 29, 45] },
    { id: 5, name: "Nhà riêng",           slug: "nha-rieng",         typeIds: [16, 28] },
    { id: 6, name: "Nhà mặt phố",         slug: "nha-mat-pho",       typeIds: [18, 30, 47] },
    { id: 7, name: "Nhà xưởng, kho bãi", slug: "nha-xuong-kho-bai", typeIds: [24, 35, 44] },
    { id: 8, name: "BĐS khác",            slug: "bds-khac",          typeIds: [11, 12, 13, 25, 32, 33, 34, 36, 38, 39, 40, 41, 43, 48] },
];

// Listing types
export const LISTING_TYPES = [
    { value: "sale", label: "Bán" },
    { value: "rent", label: "Cho thuê" },
];

// Property statuses
export const PROPERTY_STATUSES = {
    draft: { label: "Nháp", color: "#6c757d", bgColor: "#e2e3e5" },
    pending: { label: "Chờ duyệt", color: "#856404", bgColor: "#fff3cd" },
    approved: { label: "Đã duyệt", color: "#155724", bgColor: "#d4edda" },
    rejected: { label: "Từ chối", color: "#721c24", bgColor: "#f8d7da" },
    sold: { label: "Đã bán", color: "#004085", bgColor: "#cce5ff" },
    rented: { label: "Đã cho thuê", color: "#004085", bgColor: "#cce5ff" },
    expired: { label: "Hết hạn", color: "#383d41", bgColor: "#d6d8db" },
};

// Directions
export const DIRECTIONS = [
    { value: "north", label: "Bắc" },
    { value: "south", label: "Nam" },
    { value: "east", label: "Đông" },
    { value: "west", label: "Tây" },
    { value: "northeast", label: "Đông Bắc" },
    { value: "northwest", label: "Tây Bắc" },
    { value: "southeast", label: "Đông Nam" },
    { value: "southwest", label: "Tây Nam" },
];

// Price presets — BÁN (tỷ VNĐ)
export const PRICE_PRESETS = [
    { label: "1 – 3 tỷ",    min: 1_000_000_000,  max: 3_000_000_000 },
    { label: "3 – 5 tỷ",    min: 3_000_000_000,  max: 5_000_000_000 },
    { label: "5 – 10 tỷ",   min: 5_000_000_000,  max: 10_000_000_000 },
    { label: "Trên 10 tỷ",  min: 10_000_000_000, max: null },
];

// Price presets — CHO THUÊ (triệu VNĐ/tháng)
export const PRICE_PRESETS_RENT = [
    { label: "Dưới 1 triệu",    min: null,        max: 1_000_000 },
    { label: "1 – 3 triệu",     min: 1_000_000,   max: 3_000_000 },
    { label: "3 – 5 triệu",     min: 3_000_000,   max: 5_000_000 },
    { label: "5 – 10 triệu",    min: 5_000_000,   max: 10_000_000 },
    { label: "10 – 40 triệu",   min: 10_000_000,  max: 40_000_000 },
    { label: "40 – 70 triệu",   min: 40_000_000,  max: 70_000_000 },
    { label: "70 – 100 triệu",  min: 70_000_000,  max: 100_000_000 },
    { label: "Trên 100 triệu",  min: 100_000_000, max: null },
];

// Area presets for filter (bộ lọc diện tích nhanh)
export const AREA_PRESETS = [
    { label: "Dưới 30 m²",    min: null, max: 30 },
    { label: "30 – 50 m²",    min: 30,   max: 50 },
    { label: "50 – 70 m²",    min: 50,   max: 70 },
    { label: "70 – 100 m²",   min: 70,   max: 100 },
    { label: "100 – 150 m²",  min: 100,  max: 150 },
    { label: "150 – 200 m²",  min: 150,  max: 200 },
    { label: "Trên 200 m²",   min: 200,  max: null },
];

// Legal status options (tình trạng pháp lý)
export const LEGAL_STATUS_OPTIONS = [
    { value: "Sổ đỏ chính chủ",                     label: "Sổ đỏ chính chủ" },
    { value: "Sổ hồng riêng",                        label: "Sổ hồng riêng" },
    { value: "Đã có giấy phép xây dựng",             label: "Đã có GPXD" },
    { value: "Giấy tờ tay, công chứng vi bằng",      label: "Giấy tờ tay / vi bằng" },
];

// Legacy price ranges (kept for backward compatibility)
export const PRICE_RANGES = [
    { label: "Dưới 500 triệu", min: 0, max: 500_000_000 },
    { label: "500 triệu - 1 tỷ", min: 500_000_000, max: 1_000_000_000 },
    { label: "1 - 2 tỷ", min: 1_000_000_000, max: 2_000_000_000 },
    { label: "2 - 5 tỷ", min: 2_000_000_000, max: 5_000_000_000 },
    { label: "5 - 10 tỷ", min: 5_000_000_000, max: 10_000_000_000 },
    { label: "10 - 20 tỷ", min: 10_000_000_000, max: 20_000_000_000 },
    { label: "Trên 20 tỷ", min: 20_000_000_000, max: null },
];

// Area ranges for filter (m²)
export const AREA_RANGES = [
    { label: "Dưới 30 m²", min: 0, max: 30 },
    { label: "30 - 50 m²", min: 30, max: 50 },
    { label: "50 - 80 m²", min: 50, max: 80 },
    { label: "80 - 100 m²", min: 80, max: 100 },
    { label: "100 - 200 m²", min: 100, max: 200 },
    { label: "200 - 500 m²", min: 200, max: 500 },
    { label: "Trên 500 m²", min: 500, max: null },
];

// Bedroom options
export const BEDROOM_OPTIONS = [
    { value: 1, label: "1 PN" },
    { value: 2, label: "2 PN" },
    { value: 3, label: "3 PN" },
    { value: 4, label: "4 PN" },
    { value: 5, label: "5+ PN" },
];

// Amenities — mỗi item: { value (lưu DB), label (hiển thị), category }
// value phải khớp với chuỗi đã lưu trong cột amenities JSONB
export const AMENITIES = [
    // Công nghệ
    { value: "WiFi",                   label: "WiFi",                   category: "Công nghệ" },
    { value: "TV / Smart TV",          label: "TV / Smart TV",          category: "Công nghệ" },
    { value: "Không gian làm việc",    label: "Không gian làm việc",    category: "Công nghệ" },
    // Bếp
    { value: "Bếp đầy đủ",            label: "Bếp đầy đủ",            category: "Bếp" },
    { value: "Tủ lạnh",               label: "Tủ lạnh",               category: "Bếp" },
    { value: "Lò vi sóng",            label: "Lò vi sóng",            category: "Bếp" },
    // Tiện nghi trong nhà
    { value: "Điều hòa",              label: "Điều hòa",              category: "Tiện nghi" },
    { value: "Máy giặt",              label: "Máy giặt",              category: "Tiện nghi" },
    { value: "Nội thất đầy đủ",       label: "Nội thất đầy đủ",       category: "Tiện nghi" },
    { value: "Nội thất cao cấp",      label: "Nội thất cao cấp",      category: "Tiện nghi" },
    // Ngoài trời
    { value: "Ban công",              label: "Ban công",              category: "Ngoài trời" },
    { value: "Sân vườn",              label: "Sân vườn",              category: "Ngoài trời" },
    { value: "Sân thượng",            label: "Sân thượng",            category: "Ngoài trời" },
    { value: "Khu BBQ",               label: "Khu BBQ",               category: "Ngoài trời" },
    // Tòa nhà
    { value: "Thang máy",             label: "Thang máy",             category: "Tòa nhà" },
    { value: "Phòng gym",             label: "Phòng gym",             category: "Tòa nhà" },
    { value: "Hồ bơi",               label: "Hồ bơi",               category: "Tòa nhà" },
    { value: "Phòng xông hơi",        label: "Phòng xông hơi",        category: "Tòa nhà" },
    { value: "Bãi đỗ xe",            label: "Bãi đỗ xe",            category: "Tòa nhà" },
    // An ninh
    { value: "Bảo vệ 24/7",          label: "Bảo vệ 24/7",          category: "An ninh" },
    { value: "Camera an ninh",        label: "Camera an ninh",        category: "An ninh" },
    // Vị trí
    { value: "Gần trường học",        label: "Gần trường học",        category: "Vị trí" },
    { value: "Gần chợ / siêu thị",   label: "Gần chợ / siêu thị",   category: "Vị trí" },
    { value: "Gần bệnh viện",        label: "Gần bệnh viện",        category: "Vị trí" },
    { value: "Gần công viên",        label: "Gần công viên",        category: "Vị trí" },
    { value: "Gần metro / xe buýt",  label: "Gần metro / xe buýt",  category: "Vị trí" },
    // View
    { value: "View sông",             label: "View sông",             category: "View" },
    { value: "View biển",             label: "View biển",             category: "View" },
    { value: "View thành phố",        label: "View thành phố",        category: "View" },
];

// User roles
export const USER_ROLES = [
    { value: "buyer", label: "Người mua", description: "Tìm kiếm và mua bất động sản" },
    { value: "seller", label: "Người bán", description: "Đăng bán bất động sản của bạn" },
    { value: "broker", label: "Môi giới", description: "Môi giới và quản lý bất động sản" },
];
