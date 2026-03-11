"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useProperty } from "@/lib/hooks/useProperties";
import { useAuth } from "@/lib/hooks/useAuth";
import { useFavorites, trackPropertyView, useRecommendations } from "@/lib/hooks/useRecommendations";
import { useNearbyProperties } from "@/lib/hooks/useMapProperties";
import Link from "next/link";
import {
    formatPrice,
    formatPriceWithUnit,
    formatArea,
    formatDate,
    formatRelativeTime,
} from "@/lib/utils/formatters";
import { DIRECTIONS, PROPERTY_STATUSES } from "@/lib/constants";
import PropertyCard from "@/components/property/PropertyCard";
import toast from "react-hot-toast";

import DetailsTitle1 from "@/components/property-details/DetailsTitle1";
import Slider1 from "@/components/property-details/Slider1";
import PropertyDetails from "@/components/property-details/PropertyDetails";

export default function PropertyDetailContent({ slug }) {
    const { property, isLoading, error } = useProperty(slug);
    const { profile } = useAuth();
    const { toggleFavorite, isFavorited } = useFavorites(profile?.id);
    const viewStartRef = useRef(Date.now());

    // Track view duration when leaving (for recommendations)
    useEffect(() => {
        if (!property || !profile) return;

        const startTime = Date.now();

        return () => {
            const duration = Math.floor((Date.now() - startTime) / 1000);
            trackPropertyView(profile.id, property.id, duration);
        };
    }, [property?.id, profile?.id]);

    // Record page view for stats (all visitors including anonymous)
    useEffect(() => {
        if (!property?.id) return;
        import("@/lib/supabase/client").then(({ createClient }) => {
            createClient().from("property_views").insert({ property_id: property.id });
        });
    }, [property?.id]);

    // Nearby properties
    const lat =
        property?.location &&
            typeof property.location === "object"
            ? property.location.coordinates?.[1]
            : null;
    const lng =
        property?.location &&
            typeof property.location === "object"
            ? property.location.coordinates?.[0]
            : null;

    const { properties: nearbyProperties } = useNearbyProperties(lat, lng, 3);

    // Recommendations for logged-in user
    const { recommendations } = useRecommendations(profile?.id, 4);

    // Contact form
    const [contactForm, setContactForm] = useState({
        name: "",
        phone: "",
        message: "",
    });

    const handleContact = async (e) => {
        e.preventDefault();
        if (!contactForm.name || !contactForm.phone) {
            toast.error("Vui lòng nhập tên và số điện thoại");
            return;
        }

        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const { error } = await supabase.from("contact_requests").insert({
            property_id: property.id,
            requester_id: profile?.id || null,
            name: contactForm.name,
            phone: contactForm.phone,
            message: contactForm.message,
        });

        if (error) {
            toast.error("Gửi yêu cầu thất bại: " + error.message);
        } else {
            toast.success("Đã gửi yêu cầu liên hệ thành công!");
            setContactForm({ name: "", phone: "", message: "" });
        }
    };

    // Chỉ show loading khi lần đầu tải (chưa có data nào)
    if (isLoading && !property) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-2 text-muted">Đang tải thông tin...</p>
            </div>
        );
    }

    // Chỉ show "không tìm thấy" khi thực sự không có data (không phải lỗi revalidation thoáng qua)
    if (!property) {
        return (
            <div className="text-center py-5">
                <h5>Không tìm thấy bất động sản</h5>
                <p className="text-muted">
                    BĐS này có thể đã bị xóa hoặc chưa được duyệt.
                </p>
            </div>
        );
    }

    const directionLabel = DIRECTIONS.find(
        (d) => d.value === property.direction
    )?.label;

    const images = property.images?.sort(
        (a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0)
    ) || [];

    return (
        <div className="property-detail-wrapper w-100 p-0 m-0">
            <DetailsTitle1
          propertyItem={property}
          onFavoriteToggle={id => {
            if (!profile) { router.push("/?login=1"); return; }
            toggleFavorite(id);
          }}
          isFavorited={isFavorited(property.id)}
        />
            <Slider1 propertyItem={property} />
            <PropertyDetails propertyItem={property} />
        </div>
    );
}