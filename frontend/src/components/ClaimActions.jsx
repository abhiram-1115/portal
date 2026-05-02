import { useState } from "react";
import { requestClaim } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ClaimActions({ item, onUpdated }) {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const ownerId = String(item.user || item.createdBy || item.reportedBy || "");
  const currentUserId = String(user?._id || user?.id || "");
  const isOwner = ownerId && ownerId === currentUserId;

  const status = item.claim?.status || "none";
  const canRequest = isAuthenticated && !isOwner && status === "none";

  const submitClaim = async () => {
    try {
      setLoading(true);
      await requestClaim(item._id, message.trim());
      setMessage("");
      onUpdated?.();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to submit claim");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  if (status === "pending") {
    return <p className="text-sm text-amber-600 font-medium">Claim pending review</p>;
  }

  if (status === "approved") {
    return <p className="text-sm text-green-600 font-medium">Claim approved</p>;
  }

  if (status === "rejected") {
    return <p className="text-sm text-red-600 font-medium">Claim rejected</p>;
  }

  if (!canRequest) return null;

  return (
    <div className="mt-3 flex flex-col gap-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Optional message (where/when you lost it)"
        className="w-full rounded-lg border border-gray-300 p-2 text-sm"
        rows={2}
      />
      <button
        type="button"
        disabled={loading}
        onClick={submitClaim}
        className="w-fit rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Request Claim"}
      </button>
    </div>
  );
}