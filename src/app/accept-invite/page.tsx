"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const supabase = createClient();

export default function AcceptInvitePage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else setError("invalid or expired invite link.");
    });
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

        {!ready && !error && (
          <p className="text-sm text-gray-400">verifying invite...</p>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {ready && (
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
