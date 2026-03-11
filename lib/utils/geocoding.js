/**
 * Geocode bằng Nominatim (OpenStreetMap) — miễn phí, không cần API key
 * Dùng cho bản đồ form đăng tin và các tính năng nội bộ
 */
export async function geocodeAddress(address) {
    if (!address?.trim()) return null;
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=vn&accept-language=vi`;
        const res = await fetch(url, {
            headers: { "User-Agent": "Homelengo/1.0 (real-estate-app)" },
        });
        const data = await res.json();
        if (data?.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                formattedAddress: data[0].display_name,
            };
        }
        return null;
    } catch (error) {
        console.error("Geocoding error:", error);
        return null;
    }
}

/**
 * Geocode bằng Google Maps (cần API key) — dùng khi cần độ chính xác cao hơn
 */
export async function geocodeWithGoogle(address) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === "your-google-maps-api-key") return null;
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&language=vi&region=vn`
        );
        const data = await response.json();
        if (data.status === "OK" && data.results.length > 0) {
            const { lat, lng } = data.results[0].geometry.location;
            return { lat, lng, formattedAddress: data.results[0].formatted_address };
        }
        return null;
    } catch (error) {
        console.error("Google geocoding error:", error);
        return null;
    }
}

/**
 * Reverse geocode: Chuyển tọa độ thành địa chỉ
 */
export async function reverseGeocode(lat, lng) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return null;

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=vi&region=vn`
        );
        const data = await response.json();

        if (data.status === "OK" && data.results.length > 0) {
            return data.results[0].formatted_address;
        }

        return null;
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        return null;
    }
}

/**
 * Lấy vị trí hiện tại của user
 */
export function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // Cache 5 phút
            }
        );
    });
}
