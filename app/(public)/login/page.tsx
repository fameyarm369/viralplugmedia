"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import "./login.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "";
  const errorParam = searchParams.get("error");

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
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
          body: JSON.stringify({ email, password, remember }),
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

  const switchMode = (m: "login" | "register") => {
    setMode(m);
    setErrorMessage("");
    setSuccessMessage("");
  };

  return (
    <div className="vp-login-page">
      <div className="vp-scene">
        <div className="vp-bg-base" />
        <div className="vp-rays" />
        <div className="vp-halftone" />
        <div className="vp-grain" />

        <Link href="/" className="vp-brand-top">
          <div className="vp-logo-mark">VP</div>
          <div className="vp-logo-word">
            VIRAL PLUG<span>.</span>
          </div>
        </Link>

        {/* starburst sticker */}
        <div className="vp-sticker">
          <svg viewBox="0 0 120 120">
            <polygon
              points="60,2 71,32 100,20 82,47 118,55 82,63 100,90 71,78 60,118 49,78 20,90 38,63 2,55 38,47 20,20 49,32"
              fill="#FFE600"
              stroke="#000"
              strokeWidth="3"
            />
          </svg>
          <span>
            LIVE
            <br />
            ACCESS
          </span>
        </div>

        {/* floating event/promo motifs */}
        <svg className="vp-motif vp-m1" width="46" height="46" viewBox="0 0 46 46">
          <circle cx="23" cy="23" r="20" fill="#FF2E88" stroke="#000" strokeWidth="2.5" />
          <path d="M14 23l6 6 12-14" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <svg className="vp-motif vp-m2" width="50" height="50" viewBox="0 0 50 50">
          <rect x="6" y="18" width="24" height="16" rx="3" fill="#22E0FF" stroke="#000" strokeWidth="2.5" />
          <path d="M30 22l12-7v24l-12-7z" fill="#22E0FF" stroke="#000" strokeWidth="2.5" />
        </svg>
        <svg className="vp-motif vp-m3" width="44" height="44" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="19" fill="#FFE600" stroke="#000" strokeWidth="2.5" />
          <text x="22" y="27" textAnchor="middle" fontFamily="Baloo 2" fontWeight="800" fontSize="12" fill="#0A0A0C">
            %
          </text>
        </svg>
        <svg className="vp-motif vp-m4" width="48" height="48" viewBox="0 0 48 48">
          <rect x="8" y="6" width="32" height="36" rx="4" fill="#FF2E88" stroke="#000" strokeWidth="2.5" />
          <circle cx="24" cy="20" r="7" fill="#fff" />
          <rect x="14" y="30" width="20" height="4" rx="2" fill="#fff" />
        </svg>

        <div className="vp-card-outer">
          <div className="vp-headline-wrap">
            <div className="vp-headline">{mode === "login" ? "WELCOME BACK!" : "JOIN THE PLUG!"}</div>
            <div className="vp-subline">
              {mode === "login"
                ? "Your campaigns are waiting. Let's go live."
                : "Set up your Client Growth Portal in seconds."}
            </div>
          </div>

          <div className="vp-mode-switch">
            <button
              type="button"
              className={`vp-mode-btn ${mode === "login" ? "active" : ""}`}
              onClick={() => switchMode("login")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`vp-mode-btn ${mode === "register" ? "active" : ""}`}
              onClick={() => switchMode("register")}
            >
              Register
            </button>
          </div>

          <div className="vp-card">
            <svg className="vp-corner-flash" viewBox="0 0 44 44">
              <path d="M22 2l4 14 14 4-14 4-4 14-4-14L4 20l14-4z" fill="#22E0FF" stroke="#000" strokeWidth="2" />
            </svg>

            {errorMessage && (
              <div role="alert" className="vp-alert error">
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div role="status" className="vp-alert success">
                <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {mode === "register" && (
                <div className="vp-field">
                  <label>Full Name / Contact Name</label>
                  <div className="vp-row">
                    <span className="vp-icon">
                      <User size={15} />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Vikram Malhotra"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="vp-field">
                <label>Email address</label>
                <div className="vp-row">
                  <span className="vp-icon">
                    <Mail size={15} />
                  </span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="admin@brand.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="vp-field">
                <label>
                  Password
                  {mode === "login" && (
                    <Link href="/forgot-password" className="vp-forgot">
                      Forgot?
                    </Link>
                  )}
                </label>
                <div className="vp-row">
                  <span className="vp-icon">
                    <Lock size={15} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="vp-icon-toggle"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {mode === "login" && (
                <label className="vp-remember">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  Keep me signed in
                </label>
              )}

              <button type="submit" className="vp-submit" disabled={loading}>
                {loading ? "Verifying..." : mode === "login" ? "Enter the Cockpit" : "Create Account"}
                {!loading && <ArrowRight size={16} className="vp-arrow" />}
              </button>
            </form>

            <div className="vp-divider">
              <div className="vp-l" />
              <span>or continue with</span>
              <div className="vp-l" />
            </div>
            <div className="vp-socials">
              <button type="button" aria-label="Continue with Google">G</button>
              <button type="button" aria-label="Continue with Facebook">f</button>
              <button type="button" aria-label="Continue with Apple"></button>
            </div>

            <div className="vp-foot">
              {mode === "login" ? (
                <>
                  First time here?{" "}
                  <button type="button" onClick={() => switchMode("register")}>
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already with us?{" "}
                  <button type="button" onClick={() => switchMode("login")}>
                    Sign in here
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="vp-session-note">
            <Shield size={12} />
            <span>Sessions auto-expire after 15 minutes of inactivity</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="vp-login-page">
          <div className="vp-scene" style={{ fontFamily: "monospace", fontSize: 12 }}>
            Loading authentication gateway...
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}