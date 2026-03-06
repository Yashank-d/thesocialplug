"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError("invalid email or password.");
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--dark)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Acid green glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "480px",
          height: "480px",
          background:
            "radial-gradient(circle, rgba(198,255,0,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Form container */}
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Brand */}
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <Image
            src="/logo.svg"
            alt="thesocialplug."
            width={220}
            height={83}
            priority
          />
        </div>

        {/* Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%",
              padding: "13px 16px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.05)",
              color: "var(--light)",
              fontFamily: "var(--font-syne)",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%",
              padding: "13px 16px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.05)",
              color: "var(--light)",
              fontFamily: "var(--font-syne)",
              fontSize: "14px",
              outline: "none",
            }}
          />

          {error && (
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "#ff6b6b",
                marginTop: "2px",
              }}
            >
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              background: loading ? "rgba(198,255,0,0.5)" : "var(--accent)",
              color: "var(--dark)",
              fontFamily: "var(--font-syne)",
              fontSize: "14px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "4px",
              transition: "opacity 0.15s ease",
            }}
          >
            {loading ? "signing in..." : "sign in →"}
          </button>
        </div>
      </div>
    </div>
  );
}
