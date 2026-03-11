"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import toast from "react-hot-toast";

function getSessionId() {
  if (typeof window === "undefined") return null;
  let sid = localStorage.getItem("rv_session");
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem("rv_session", sid);
  }
  return sid;
}

const ThumbUp = ({ color = "currentColor" }) => (
  <svg width={18} height={18} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.375 6.75H10.6875M4.66949 14.0625C4.66124 14.025 4.64849 13.9875 4.63049 13.9515C4.18724 13.0515 3.93749 12.039 3.93749 10.9687C3.93587 9.89238 4.19282 8.83136 4.68674 7.875M4.66949 14.0625C4.72649 14.3362 4.53224 14.625 4.23824 14.625H3.55724C2.89049 14.625 2.27249 14.2365 2.07824 13.599C1.82399 12.7665 1.68749 11.8837 1.68749 10.9687C1.68749 9.804 1.90874 8.69175 2.31074 7.67025C2.54024 7.08975 3.12524 6.75 3.74999 6.75H4.53974C4.89374 6.75 5.09849 7.167 4.91474 7.47C4.83434 7.60234 4.7578 7.73742 4.68674 7.875M4.66949 14.0625H5.63999C6.0027 14.0623 6.36307 14.1205 6.70724 14.235L9.04274 15.015C9.38691 15.1295 9.74728 15.1877 10.11 15.1875H13.122C13.5855 15.1875 14.0347 15.0022 14.3257 14.6407C15.6143 13.0434 16.3156 11.0523 16.3125 9C16.3125 8.6745 16.2952 8.35275 16.2615 8.03625C16.1797 7.2705 15.4905 6.75 14.721 6.75H12.3765C11.913 6.75 11.6332 6.207 11.8327 5.7885C12.191 5.03444 12.3763 4.20985 12.375 3.375C12.375 2.92745 12.1972 2.49823 11.8807 2.18176C11.5643 1.86529 11.135 1.6875 10.6875 1.6875C10.5383 1.6875 10.3952 1.74676 10.2897 1.85225C10.1843 1.95774 10.125 2.10082 10.125 2.25V2.72475C10.125 3.1545 10.0425 3.57975 9.88349 3.97875C9.65549 4.54875 9.18599 4.97625 8.64374 5.265C7.81128 5.7092 7.0807 6.32228 6.49874 7.065C6.12524 7.5405 5.57924 7.875 4.97474 7.875H4.68674"
      stroke={color} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ThumbDown = ({ color = "currentColor" }) => (
  <svg width={18} height={18} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.62501 11.25H7.31251M13.3305 3.9375C13.3388 3.975 13.3515 4.0125 13.3695 4.0485C13.8128 4.9485 14.0625 5.961 14.0625 7.03125C14.0641 8.10762 13.8072 9.16864 13.3133 10.125M13.3305 3.9375C13.2735 3.66375 13.4678 3.375 13.7618 3.375H14.4428C15.1095 3.375 15.7275 3.7635 15.9218 4.401C16.176 5.2335 16.3125 6.11625 16.3125 7.03125C16.3125 8.196 16.0913 9.30825 15.6893 10.3298C15.4598 10.9103 14.8748 11.25 14.25 11.25H13.4603C13.1063 11.25 12.9015 10.833 13.0853 10.53C13.1657 10.3977 13.2422 10.2626 13.3133 10.125M13.3305 3.9375H12.36C11.9973 3.93772 11.6369 3.87948 11.2928 3.765L8.95726 2.985C8.61309 2.87053 8.25272 2.81228 7.89001 2.8125H4.87801C4.41451 2.8125 3.96526 2.99775 3.67426 3.35925C2.38572 4.95658 1.68441 6.94774 1.68751 9C1.68751 9.3255 1.70476 9.64725 1.73851 9.96375C1.82026 10.7295 2.50951 11.25 3.27901 11.25H5.62351C6.08701 11.25 6.36676 11.793 6.16726 12.2115C5.80897 12.9656 5.6237 13.7902 5.62501 14.625C5.62501 15.0726 5.8028 15.5018 6.11927 15.8182C6.43574 16.1347 6.86496 16.3125 7.31251 16.3125C7.46169 16.3125 7.60477 16.2532 7.71026 16.1477C7.81575 16.0423 7.87501 15.8992 7.87501 15.75V15.2753C7.87501 14.8455 7.95751 14.4203 8.11651 14.0213C8.34451 13.4513 8.81401 13.0238 9.35626 12.735C10.1887 12.2908 10.9193 11.6777 11.5013 10.935C11.8748 10.4595 12.4208 10.125 13.0253 10.125H13.3133"
      stroke={color} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function GuestReview({ propertyItem }) {
  const { profile, isAuthenticated } = useAuth();
  const supabase = createClient();
  const propertyId = propertyItem?.id;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voteCounts, setVoteCounts] = useState({});
  const [myVotes, setMyVotes] = useState({});

  const [myReviewStatus, setMyReviewStatus] = useState(null); // null | 'pending' | 'approved' | 'rejected'
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);

    const [{ data: reviewData }, { data: voteData }] = await Promise.all([
      supabase
        .from("property_reviews")
        .select("id, content, author_name, created_at, profiles!author_id(full_name, avatar_url)")
        .eq("property_id", propertyId)
        .eq("status", "approved")
        .order("created_at", { ascending: false }),
      supabase
        .from("review_votes")
        .select("review_id, vote"),
    ]);

    const reviews = reviewData || [];
    setReviews(reviews);

    // Tính vote counts
    const counts = {};
    (voteData || []).forEach(v => {
      if (!counts[v.review_id]) counts[v.review_id] = { helpful: 0, not_helpful: 0 };
      counts[v.review_id][v.vote] = (counts[v.review_id][v.vote] || 0) + 1;
    });
    setVoteCounts(counts);

    // Vote của người dùng hiện tại
    const sid = getSessionId();
    const voterKey = isAuthenticated && profile?.id
      ? `user:${profile.id}`
      : `anon:${sid}`;

    const reviewIds = reviews.map(r => r.id);
    if (reviewIds.length > 0) {
      const { data: myVoteData } = await supabase
        .from("review_votes")
        .select("review_id, vote")
        .eq("voter_key", voterKey)
        .in("review_id", reviewIds);

      const mv = {};
      (myVoteData || []).forEach(v => { mv[v.review_id] = v.vote; });
      setMyVotes(mv);
    }

    setLoading(false);
  }, [propertyId, isAuthenticated, profile?.id]);

  useEffect(() => { load(); }, [load]);

  // Kiểm tra user đã review chưa
  useEffect(() => {
    if (!isAuthenticated || !profile?.id || !propertyId) return;
    supabase
      .from("property_reviews")
      .select("status")
      .eq("property_id", propertyId)
      .eq("author_id", profile.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setMyReviewStatus(data.status);
      });
  }, [isAuthenticated, profile?.id, propertyId]);

  async function handleVote(reviewId, vote) {
    const sid = getSessionId();
    const voterKey = isAuthenticated && profile?.id
      ? `user:${profile.id}`
      : `anon:${sid}`;

    const existingVote = myVotes[reviewId];

    if (existingVote === vote) {
      // Toggle off: xóa vote
      await supabase.from("review_votes")
        .delete()
        .eq("review_id", reviewId)
        .eq("voter_key", voterKey);

      setMyVotes(prev => { const n = { ...prev }; delete n[reviewId]; return n; });
      setVoteCounts(prev => ({
        ...prev,
        [reviewId]: {
          ...prev[reviewId],
          [vote]: Math.max(0, (prev[reviewId]?.[vote] || 0) - 1),
        },
      }));
      return;
    }

    // Upsert vote
    const { error } = await supabase.from("review_votes").upsert(
      {
        review_id: reviewId,
        voter_key: voterKey,
        voter_id: (isAuthenticated && profile?.id) ? profile.id : null,
        vote,
      },
      { onConflict: "review_id,voter_key" }
    );

    if (error) return;

    const oldVote = existingVote;
    setMyVotes(prev => ({ ...prev, [reviewId]: vote }));
    setVoteCounts(prev => {
      const cur = { helpful: 0, not_helpful: 0, ...(prev[reviewId] || {}) };
      if (oldVote) cur[oldVote] = Math.max(0, cur[oldVote] - 1);
      cur[vote] = cur[vote] + 1;
      return { ...prev, [reviewId]: cur };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from("property_reviews").insert({
      property_id: propertyId,
      author_id: profile.id,
      author_name: profile.full_name || "Người dùng",
      content: content.trim(),
      status: "pending",
    });

    if (error) {
      if (error.code === "23505") {
        toast.error("Bạn đã gửi đánh giá cho tin đăng này rồi.");
      } else {
        toast.error("Lỗi: " + error.message);
      }
    } else {
      toast.success("Đã gửi! Đánh giá sẽ hiển thị sau khi admin duyệt.");
      setMyReviewStatus("pending");
      setContent("");
    }
    setSubmitting(false);
  }

  if (loading) return null;

  return (
    <>
      <h5 className="title fw-6">Đánh giá</h5>

      {/* Danh sách đánh giá */}
      {reviews.length > 0 ? (
        <div className="wrap-review">
          <ul className="box-review">
            {reviews.map(review => {
              const counts = voteCounts[review.id] || { helpful: 0, not_helpful: 0 };
              const myVote = myVotes[review.id];
              const name = review.profiles?.full_name || review.author_name || "Ẩn danh";
              const avatar = review.profiles?.avatar_url;

              return (
                <li key={review.id} className="list-review-item">
                  <div className="avatar avt-60" style={{ flexShrink: 0 }}>
                    {avatar ? (
                      <Image alt="avatar" src={avatar} width={60} height={60} style={{ borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 22, color: "#64748b" }}>
                        {name[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="content">
                    <div className="box-head">
                      <h6>{name}</h6>
                      <p className="mt-4 caption-2 text-variant-2">
                        {new Date(review.created_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </p>
                    </div>
                    <p style={{ marginTop: 8 }}>{review.content}</p>

                    {/* Vote buttons */}
                    <div className="action mt-12">
                      <button
                        type="button"
                        onClick={() => handleVote(review.id, "helpful")}
                        className="d-flex align-items-center gap-6"
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: myVote === "helpful" ? "#1563df" : "#7C818B", fontWeight: myVote === "helpful" ? 600 : 400 }}
                      >
                        <ThumbUp color={myVote === "helpful" ? "#1563df" : "#7C818B"} />
                        <span className="font-rubik">
                          Hữu ích{counts.helpful > 0 ? ` (${counts.helpful})` : ""}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleVote(review.id, "not_helpful")}
                        className="d-flex align-items-center gap-6"
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: myVote === "not_helpful" ? "#ef4444" : "#7C818B", fontWeight: myVote === "not_helpful" ? 600 : 400 }}
                      >
                        <ThumbDown color={myVote === "not_helpful" ? "#ef4444" : "#7C818B"} />
                        <span className="font-rubik">
                          Không hữu ích{counts.not_helpful > 0 ? ` (${counts.not_helpful})` : ""}
                        </span>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="text-variant-2 mb-24">Chưa có đánh giá nào cho tin đăng này.</p>
      )}

      {/* Form gửi đánh giá */}
      <div className="wrap-form-comment">
        <h5 className="text-black-2">Gửi đánh giá</h5>

        {!isAuthenticated ? (
          <p className="text-variant-1 mt-8">
            <a href="#modalLogin" data-bs-toggle="modal" className="text-primary fw-6" style={{ cursor: "pointer" }}>Đăng nhập</a>{" "}
            để gửi đánh giá của bạn.
          </p>
        ) : myReviewStatus === "pending" ? (
          <div style={{ marginTop: 12, padding: "14px 18px", background: "#fef9c3", border: "1px solid #fde047", borderRadius: 10, fontSize: 14, color: "#854d0e" }}>
            <strong>Đang chờ duyệt</strong> — Đánh giá của bạn sẽ hiển thị sau khi admin phê duyệt.
          </div>
        ) : myReviewStatus === "approved" ? (
          <div style={{ marginTop: 12, padding: "14px 18px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, fontSize: 14, color: "#166534" }}>
            Bạn đã gửi đánh giá cho tin đăng này.
          </div>
        ) : myReviewStatus === "rejected" ? (
          <div style={{ marginTop: 12, padding: "14px 18px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, fontSize: 14, color: "#991b1b" }}>
            Đánh giá của bạn không được duyệt. Vui lòng liên hệ admin nếu cần hỗ trợ.
          </div>
        ) : (
          <form className="comment-form form-submit mt-16" onSubmit={handleSubmit}>
            <fieldset className="form-wg">
              <label className="sub-ip">
                Nội dung đánh giá <span className="text-danger">*</span>
              </label>
              <textarea
                rows={4}
                className="form-control"
                placeholder="Chia sẻ trải nghiệm của bạn về bất động sản này..."
                value={content}
                onChange={e => setContent(e.target.value)}
                required
                style={{ resize: "vertical" }}
              />
            </fieldset>
            <button
              className="tf-btn primary mt-16"
              type="submit"
              disabled={submitting || !content.trim()}
            >
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
