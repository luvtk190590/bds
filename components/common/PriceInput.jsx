"use client";

/**
 * PriceInput — input giá với tự động phân cách hàng nghìn (kiểu Việt Nam: dấu chấm)
 * value / onChange nhận/trả string số thuần (không có dấu chấm) để tương thích parseFloat
 * Ví dụ: value="5000000000" → hiển thị "5.000.000.000"
 */

function formatThousands(raw) {
    if (raw === "" || raw === null || raw === undefined) return "";
    const digits = raw.toString().replace(/\D/g, "");
    if (!digits) return "";
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function stripFormatting(str) {
    return str.replace(/\./g, "").replace(/[^\d]/g, "");
}

export default function PriceInput({ value = "", onChange, className = "form-control", ...rest }) {
    const display = formatThousands(value);

    function handleChange(e) {
        const raw = stripFormatting(e.target.value);
        onChange?.(raw);
    }

    return (
        <input
            type="text"
            inputMode="numeric"
            className={className}
            value={display}
            onChange={handleChange}
            {...rest}
        />
    );
}
