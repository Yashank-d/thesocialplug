"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#0D0D0D] overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="orb-container">
        <div className="orb orb-accent w-[600px] h-[600px] top-[-10%] left-[-10%]"></div>
        <div className="orb orb-accent w-[400px] h-[400px] bottom-[-20%] right-[-10%] opacity-30"></div>
        <div className="orb orb-accent w-[500px] h-[500px] top-[40%] left-[30%] opacity-20" style={{ animationDelay: '-5s' }}></div>
      </div>

      {/* Glassmorphic Form Container */}
      <div className="glass-panel w-full max-w-sm rounded-[2rem] p-8 md:p-10 relative z-10">
        <div className="mb-10 flex flex-col items-center text-center">
          <Image src="/logo.svg" alt="thesocialplug." width={180} height={68} priority className="w-auto h-12 mb-4" />
          <p className="text-sm text-light/60 mt-1 font-seasons">
            Set your password to get started
          </p>
        </div>

        {verifying && (
          <p className="text-sm text-light/40 text-center animate-pulse">verifying invite...</p>
        )}

        {!verifying && error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-4 backdrop-blur-sm">
            <p className="text-sm text-red-400 text-center">{error}</p>
          </div>
        )}

        {!verifying && ready && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-bold tracking-widest text-light/50 block mb-2 uppercase pl-2">
                new password
              </label>
              <input
                type="password"
                placeholder="min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input rounded-2xl"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-widest text-light/50 block mb-2 uppercase pl-2">
                confirm password
              </label>
              <input
                type="password"
                placeholder="repeat password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSetPassword()}
                className="glass-input rounded-2xl"
              />
            </div>

            {error && <p className="text-red-400 text-xs pl-2">{error}</p>}

            <button
              onClick={handleSetPassword}
              disabled={loading}
              className="w-full py-4 mt-4 rounded-2xl border border-accent/20 bg-accent text-dark font-seasons text-base font-bold shadow-[0_0_20px_rgba(198,255,0,0.15)] hover:shadow-[0_0_30px_rgba(198,255,0,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "setting password..." : "set password & sign in"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
