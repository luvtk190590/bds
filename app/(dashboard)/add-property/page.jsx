"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import PropertyForm from "@/components/property/PropertyForm";
import SidebarMenu from "@/components/dashboard/SidebarMenu";
import Header2 from "@/components/headers/Header2";
import VerificationModal, { getModalStep } from "@/components/modals/VerificationModal";

export default function AddPropertyPage() {
  const { isAuthenticated, loading, profile } = useAuth();
  const router = useRouter();
  const [verModalOpen, setVerModalOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/?login=1");
      return;
    }
    const step = getModalStep(profile);
    if (step !== "can_post") {
      setVerModalOpen(true);
    }
  }, [loading, isAuthenticated, profile]);

  if (loading) return null;
  if (!isAuthenticated) return null;

  const canPost = getModalStep(profile) === "can_post";

  return (
    <div className="layout-wrap">
      <Header2 />
      <SidebarMenu />
      {canPost ? (
        <PropertyForm />
      ) : (
        // Nền mờ khi chưa xác minh (modal sẽ hiện đè lên)
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <p style={{ color: "#94a3b8" }}>Đang tải...</p>
        </div>
      )}
      <div className="overlay-dashboard" />

      <VerificationModal
        open={verModalOpen}
        onClose={() => { setVerModalOpen(false); router.replace("/dashboard"); }}
        profile={profile}
      />
    </div>
  );
}
