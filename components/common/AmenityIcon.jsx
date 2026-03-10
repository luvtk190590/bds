const ICONS = {
  "WiFi": (
    <>
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
      <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/>
    </>
  ),
  "TV / Smart TV": (
    <>
      <rect x="2" y="7" width="20" height="13" rx="2"/>
      <path d="M17 2 12 7 7 2"/>
    </>
  ),
  "Không gian làm việc": (
    <>
      <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9"/>
      <path d="M1 16h22"/>
    </>
  ),
  "Bếp đầy đủ": (
    <>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3v7"/>
    </>
  ),
  "Tủ lạnh": (
    <>
      <path d="M4 2h16a2 2 0 0 1 2 2v18H2V4a2 2 0 0 1 2-2z"/>
      <path d="M2 9h20"/>
      <path d="M10 4v5"/>
    </>
  ),
  "Lò vi sóng": (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <path d="M17 6v12"/>
      <circle cx="10.5" cy="12" r="2"/>
    </>
  ),
  "Máy giặt": (
    <>
      <rect x="2" y="2" width="20" height="20" rx="2"/>
      <path d="M2 7h20"/>
      <circle cx="12" cy="14" r="4"/>
      <path d="M10 14a3 3 0 0 0 2.5 3"/>
    </>
  ),
  "Điều hòa": (
    <>
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
    </>
  ),
  "Nội thất đầy đủ": (
    <>
      <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/>
      <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0z"/>
      <path d="M4 18v2M20 18v2"/>
    </>
  ),
  "Nội thất cao cấp": (
    <>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </>
  ),
  "Ban công": (
    <>
      <path d="M3 21h18"/>
      <path d="M5 21V8M19 21V8"/>
      <path d="M5 8h14"/>
      <path d="M9 21V12M15 21V12"/>
      <path d="M9 12h6"/>
    </>
  ),
  "Sân vườn": (
    <>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </>
  ),
  "Sân thượng": (
    <>
      <path d="M3 21h18"/>
      <path d="M4 21V11l8-7 8 7v10"/>
      <path d="M10 21v-6h4v6"/>
    </>
  ),
  "Khu BBQ": (
    <>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </>
  ),
  "Thang máy": (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2"/>
      <path d="M9 7l3-3 3 3"/>
      <path d="M9 17l3 3 3-3"/>
    </>
  ),
  "Phòng gym": (
    <>
      <circle cx="5" cy="12" r="3"/>
      <circle cx="19" cy="12" r="3"/>
      <path d="M8 12h8"/>
      <path d="M2 12h3M19 12h3"/>
    </>
  ),
  "Hồ bơi": (
    <>
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
    </>
  ),
  "Phòng xông hơi": (
    <>
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
    </>
  ),
  "Bãi đỗ xe": (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M9 17V7h5a3 3 0 0 1 0 6H9"/>
    </>
  ),
  "Bảo vệ 24/7": (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </>
  ),
  "Camera an ninh": (
    <>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </>
  ),
  "Gần trường học": (
    <>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </>
  ),
  "Gần chợ / siêu thị": (
    <>
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </>
  ),
  "Gần bệnh viện": (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M12 8v8M8 12h8"/>
    </>
  ),
  "Gần công viên": (
    <>
      <path d="M17 14l3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3A1 1 0 0 1 15.2 9H15l3 3.3a1 1 0 0 1-.7 1.7H17z"/>
      <path d="M12 22v-3"/>
    </>
  ),
  "Gần metro / xe buýt": (
    <>
      <rect x="4" y="3" width="16" height="16" rx="2"/>
      <path d="M4 11h16"/>
      <path d="M12 3v8"/>
      <circle cx="8.5" cy="15" r="1" fill="currentColor" stroke="none"/>
      <circle cx="15.5" cy="15" r="1" fill="currentColor" stroke="none"/>
      <path d="m6 19 2-2M18 19l-2-2"/>
    </>
  ),
  "View sông": (
    <>
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
    </>
  ),
  "View biển": (
    <>
      <path d="M17 12h.01M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9"/>
      <path d="M2 17c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
    </>
  ),
  "View thành phố": (
    <>
      <path d="M3 21h18"/>
      <path d="M9 21V9l-3-3V3h12v3l-3 3v12"/>
      <path d="M5 21V16h4v5"/>
      <path d="M15 21v-5h4v5"/>
      <path d="M9 9h6"/>
    </>
  ),
};

const DEFAULT_ICON = (
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
);

export default function AmenityIcon({ name, size = 22 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name] ?? DEFAULT_ICON}
    </svg>
  );
}
