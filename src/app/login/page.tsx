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
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#0D0D0D] overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="orb-container">
        <div className="orb orb-accent w-[600px] h-[600px] top-[-10%] left-[-10%]"></div>
        <div className="orb orb-accent w-[400px] h-[400px] bottom-[-20%] right-[-10%] opacity-30"></div>
        <div className="orb orb-accent w-[500px] h-[500px] top-[40%] left-[30%] opacity-20" style={{ animationDelay: '-5s' }}></div>
      </div>

      {/* Glassmorphic Form Container */}
      <div className="glass-panel w-full max-w-sm rounded-[2rem] p-8 md:p-10 relative z-10">
        {/* Brand */}
        <div className="text-center mb-10 flex justify-center">
          <Image
            src="/logo.svg"
            alt="thesocialplug."
            width={180}
            height={68}
            priority
            className="w-auto h-12"
          />
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="glass-input rounded-2xl text-base"
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="glass-input rounded-2xl text-base"
          />

          {error && (
            <p className="font-inter text-xs text-red-400 mt-1 pl-2">
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3.5 mt-4 rounded-2xl border border-accent/20 bg-accent text-dark font-seasons text-base font-bold shadow-[0_0_20px_rgba(198,255,0,0.15)] hover:shadow-[0_0_30px_rgba(198,255,0,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "signing in..." : "sign in →"}
          </button>
        </div>
      </div>
    </div>
  );
}
