/**
 * Geocode: Chuyển địa chỉ thành tọa độ
 */
export async function geocodeAddress(address) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        console.error("Google Maps API key not configured");
        return null;
    }

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
        console.error("Geocoding error:", error);
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
