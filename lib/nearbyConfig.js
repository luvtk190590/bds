// Cấu hình các loại tiện ích lân cận + utilities

export const NEARBY_CATEGORIES = [
  {
    key: "hospital",
    label: "Bệnh viện",
    color: "#e74c3c",
    iconClass: "icon-hospital",
    overpassTags: [
      `node["amenity"~"hospital|clinic"]`,
      `way["amenity"~"hospital|clinic"]`,
    ],
    matchFn: (tags) => ["hospital", "clinic"].includes(tags.amenity),
  },
  {
    key: "school",
    label: "Trường học",
    color: "#2980b9",
    iconClass: "icon-home-location",
    overpassTags: [
      `node["amenity"~"school|university|kindergarten|college"]`,
      `way["amenity"~"school|university|kindergarten|college"]`,
    ],
    matchFn: (tags) =>
      ["school", "university", "kindergarten", "college"].includes(tags.amenity),
  },
  {
    key: "market",
    label: "Siêu thị / Chợ",
    color: "#e67e22",
    iconClass: "icon-commercial2",
    overpassTags: [
      `node["shop"~"supermarket|mall|convenience"]`,
      `way["shop"~"supermarket|mall"]`,
      `node["amenity"="marketplace"]`,
      `way["amenity"="marketplace"]`,
    ],
    matchFn: (tags) =>
      ["supermarket", "mall", "convenience"].includes(tags.shop) ||
      tags.amenity === "marketplace",
  },
  {
    key: "park",
    label: "Công viên",
    color: "#27ae60",
    iconClass: "icon-farm",
    overpassTags: [
      `node["leisure"="park"]`,
      `way["leisure"="park"]`,
    ],
    matchFn: (tags) => tags.leisure === "park",
  },
  {
    key: "transport",
    label: "Giao thông",
    color: "#8e44ad",
    iconClass: "icon-mapPin",
    overpassTags: [
      `node["railway"~"station|subway_entrance|tram_stop"]`,
      `node["highway"="bus_stop"]`,
    ],
    matchFn: (tags) =>
      ["station", "subway_entrance", "tram_stop"].includes(tags.railway) ||
      tags.highway === "bus_stop",
  },
];

/** Xây query Overpass API */
export function buildOverpassQuery(lat, lng, radius) {
  const parts = NEARBY_CATEGORIES.flatMap((cat) =>
    cat.overpassTags.map((tag) => `  ${tag}(around:${radius},${lat},${lng});`)
  ).join("\n");

  return `[out:json][timeout:25];\n(\n${parts}\n);\nout center;`;
}

/** Lấy lat/lng từ element (node hoặc way) */
function getPos(el) {
  if (el.type === "node") return { lat: el.lat, lng: el.lon };
  if (el.center) return { lat: el.center.lat, lng: el.center.lon };
  return null;
}

/** Tên ưu tiên tiếng Việt */
function getName(tags) {
  return tags["name:vi"] || tags.name || tags["name:en"] || "Không rõ tên";
}

/** Khoảng cách Haversine (mét) */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/** Xử lý raw elements từ Overpass → array POIs */
export function processElements(elements, lat, lng) {
  const seen = new Set();
  return elements
    .map((el) => {
      const pos = getPos(el);
      if (!pos) return null;

      const tags = el.tags || {};
      const cat = NEARBY_CATEGORIES.find((c) => c.matchFn(tags));
      if (!cat) return null;

      const name = getName(tags);
      const key = `${cat.key}::${name}`;
      if (seen.has(key)) return null; // bỏ duplicate cùng tên + category
      seen.add(key);

      return {
        id: el.id,
        name,
        category: cat.key,
        lat: pos.lat,
        lng: pos.lng,
        dist: haversine(lat, lng, pos.lat, pos.lng),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.dist - b.dist);
}

/** Format khoảng cách */
export function formatDist(m) {
  return m < 1000 ? `${m}m` : `${(m / 1000).toFixed(1)}km`;
}
