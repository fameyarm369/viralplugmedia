"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ComicButton } from "@/components/comic/ComicButton";
import { StarburstBadge } from "@/components/comic/StarburstBadge";
import { Shield, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "";
  const errorParam = searchParams.get("error");

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (errorParam === "session_expired") {
      setErrorMessage("Your session expired due to 15 minutes of inactivity. Please sign in again.");
    } else if (errorParam === "forbidden") {
      setErrorMessage("Access denied. Admin privileges are required to access that area.");
    }
  }, [errorParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await fetch("/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!data.success) {
          setErrorMessage(data.error || "Login failed");
          setLoading(false);
          return;
        }

        if (redirectPath) {
          router.push(redirectPath);
        } else if (data.user.role === "SUPER_ADMIN" || data.user.role === "ADMIN" || data.user.hasAdminAccess) {
          router.push("/admin");
        } else {
          router.push("/portal");
        }
        router.refresh();
      } else {
        const res = await fetch("/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();
        if (!data.success) {
          setErrorMessage(data.error || "Registration failed");
          setLoading(false);
          return;
        }

        setSuccessMessage("Account created successfully! Redirecting to your Client Growth Portal...");
        setTimeout(() => {
          router.push("/portal");
          router.refresh();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-comic-black text-white flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-halftone-dots opacity-30 pointer-events-none" />

      <div className="hidden sm:block absolute top-12 right-12 animate-pulse-comic">
        <StarburstBadge size="md" bgColor="#FFE600" textColor="#0A0A0C" rotate="6deg">
          <span className="text-xs">SECURE</span>
          <span className="text-sm font-black">ROLE ACCESS 🛡️</span>
        </StarburstBadge>
      </div>

      <div className="max-w-md w-full relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 bg-comic-yellow text-comic-black rounded-lg border-2 border-comic-black flex items-center justify-center font-display text-2xl font-black shadow-[3px_3px_0px_#FF0055]">
              VP
            </div>
            <span className="font-display text-3xl tracking-wider text-white">
              VIRAL PLUG<span className="text-comic-pink">.</span>
            </span>
          </Link>
          <h1 className="font-display text-3xl uppercase tracking-tight text-white mt-2">
            {mode === "login" ? "ACCOUNT SIGN IN" : "CLIENT REGISTRATION"}
          </h1>
          <p className="text-xs font-mono text-neutral-400">
            {mode === "login"
              ? "Access the Admin Cockpit or your Client Growth Portal"
              : "Create your client account to track campaigns and performance"}
          </p>
        </div>

        <div className="flex rounded-lg bg-neutral-900 border-2 border-neutral-800 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage("");
            }}
            className={`flex-1 py-2 text-xs font-heading font-black uppercase rounded transition-all ${
              mode === "login"
                ? "bg-comic-yellow text-comic-black shadow-[2px_2px_0px_#000]"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMessage("");
            }}
            className={`flex-1 py-2 text-xs font-heading font-black uppercase rounded transition-all ${
              mode === "register"
                ? "bg-comic-cyan text-comic-black shadow-[2px_2px_0px_#000]"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Register Client
          </button>
        </div>

        <div className="comic-card p-8 bg-[#12131A] border-[3.5px] border-comic-black shadow-[8px_8px_0px_#FFE600] space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-950/80 border border-red-500 rounded flex items-start gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-950/80 border border-green-500 rounded flex items-start gap-2.5 text-xs text-green-200">
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-neutral-300 mb-1">
                  Full Name / Contact Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Vikram Malhotra"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-comic-black border-2 border-neutral-700 rounded p-2.5 pl-9 text-sm text-white focus:border-comic-cyan focus:outline-none font-body"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-neutral-300 mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="admin@brand.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-comic-black border-2 border-neutral-700 rounded p-2.5 pl-9 text-sm text-white focus:border-comic-yellow focus:outline-none font-body"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-neutral-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-comic-black border-2 border-neutral-700 rounded p-2.5 pl-9 text-sm text-white focus:border-comic-yellow focus:outline-none font-body"
                />
              </div>
            </div>

            <div className="pt-2">
              <ComicButton
                type="submit"
                variant={mode === "login" ? "yellow" : "cyan"}
                size="md"
                disabled={loading}
                className="w-full"
                icon={<ArrowRight className="w-4 h-4 text-comic-black" />}
              >
                {loading ? "Verifying..." : mode === "login" ? "Sign In to Cockpit →" : "Create Account →"}
              </ComicButton>
            </div>
          </form>

          <div className="pt-2 text-center text-xs font-mono text-neutral-400 border-t border-neutral-800">
            {mode === "login" ? (
              <p>
                First time visitor?{" "}
                <button
                  onClick={() => setMode("register")}
                  className="text-comic-yellow hover:underline font-bold"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-comic-cyan hover:underline font-bold"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>

        <div className="text-center text-[11px] font-mono text-neutral-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-comic-cyan" />
          <span>Sessions auto-expire after 15 minutes of inactivity</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-comic-black text-white flex items-center justify-center font-mono text-xs">
          Loading authentication gateway...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
