"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const supabase = createClient();

export default function AcceptInvitePage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function verifyInvite() {
      // Get token params from URL
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get("token_hash");
      const token = params.get("token");
      const type = params.get("type");

      // Try token_hash first (newer Supabase)
      if (tokenHash && type === "invite") {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "invite",
        });
        if (error) {
          setError("invite link is invalid or expired. ask admin to resend.");
        } else {
          setReady(true);
        }
        setVerifying(false);
        return;
      }

      // Try token (older format)
      if (token && type === "invite") {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "invite",
        });
        if (error) {
          setError("invite link is invalid or expired. ask admin to resend.");
        } else {
          setReady(true);
        }
        setVerifying(false);
        return;
      }

      // Check if already has session (hash-based old flow)
      const hashParams = new URLSearchParams(
        window.location.hash.replace("#", ""),
      );
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          setError("invite link is invalid or expired.");
        } else {
          setReady(true);
        }
        setVerifying(false);
        return;
      }

      setError("invalid invite link. ask admin to resend.");
      setVerifying(false);
    }

    verifyInvite();
  }, []);

  async function handleSetPassword() {
    if (!password || password.length < 8) {
      setError("password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">thesocialplug.</h1>
          <p className="text-sm text-gray-500 mt-1">
            set your password to get started
          </p>
        </div>

        {verifying && (
          <p className="text-sm text-gray-400">verifying invite...</p>
        )}

        {!verifying && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!verifying && ready && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                new password
              </label>
              <input
                type="password"
                placeholder="min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                confirm password
              </label>
              <input
                type="password"
                placeholder="repeat password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSetPassword()}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
              />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <button
              onClick={handleSetPassword}
              disabled={loading}
              className="w-full bg-black text-white rounded-lg py-3 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 cursor-pointer mt-1"
            >
              {loading ? "setting password..." : "set password & sign in"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
