/**
 * Format giá tiền VND
 * 1,000,000,000 → "1 tỷ"
 * 500,000,000 → "500 triệu"
 * 1,500,000,000 → "1.5 tỷ"
 */
export function formatPrice(price, unit = "VND") {
    if (!price && price !== 0) return "Thỏa thuận";

    const numPrice = Number(price);

    if (numPrice >= 1_000_000_000) {
        const ty = numPrice / 1_000_000_000;
        return `${ty % 1 === 0 ? ty : ty.toFixed(1)} tỷ`;
    }

    if (numPrice >= 1_000_000) {
        const trieu = numPrice / 1_000_000;
        return `${trieu % 1 === 0 ? trieu : trieu.toFixed(1)} triệu`;
    }

    if (numPrice >= 1_000) {
        const nghin = numPrice / 1_000;
        return `${nghin % 1 === 0 ? nghin : nghin.toFixed(0)} nghìn`;
    }

    return numPrice.toLocaleString("vi-VN") + " " + unit;
}

/**
 * Format giá kèm đơn vị (bán/cho thuê)
 */
export function formatPriceWithUnit(price, listingType) {
    const formatted = formatPrice(price);
    if (listingType === "rent") {
        return formatted + "/tháng";
    }
    return formatted;
}

/**
 * Format diện tích
 */
export function formatArea(area) {
    if (!area) return "N/A";
    return `${Number(area).toLocaleString("vi-VN")} m²`;
}

/**
 * Format ngày giờ tiếng Việt
 */
export function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

/**
 * Format thời gian tương đối
 */
export function formatRelativeTime(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return `${Math.floor(diffDays / 365)} năm trước`;
}
