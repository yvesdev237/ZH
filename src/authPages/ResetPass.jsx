import React, { useState } from "react";
import { db } from "../services/database";
import logo from "../images/zilohomewb.png";
import toast from 'react-hot-toast'

const ResetPass = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const reset = async () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (typeof email !== "string" || !emailRegex.test(email) || !email) {
      toast.error("Invalid Email !");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await db.auth.resetPasswordForEmail({ email });
      if (error) {
        toast.error("Failed to reset");
        console.error("reset error :", error);
        return;
      }
      toast.success("Reset link sent. Check your inbox.");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen overflow-hidden  text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_28%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-10">
        <div className="relative w-full overflow-hidden rounded-4xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <div className="p-8 sm:p-10">
            <div className="flex flex-col items-center gap-4 border-b border-white/10 pb-8 text-center">
              <div className="inline-flex items-center gap-3 rounded-full bg-slate-950/90 px-4 py-3 shadow-sm shadow-cyan-500/10">
                <img
                  src={logo}
                  alt="Zilo Home logo"
                  className="h-12 w-12 rounded-3xl border border-white/10 object-cover"
                />
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                    Zilo Home
                  </p>
                  <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                    Reset Your Password
                  </h1>
                </div>
              </div>
              <p className="max-w-xl text-sm text-slate-400 sm:text-base">
                Enter the email linked to your account and we’ll send a secure
                reset link to get you back into your dashboard.
              </p>
            </div>

            <div className="mt-8 grid gap-6">
              <div className="grid gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-slate-300"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="hello@domain.com"
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/95 px-5 py-4 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                onClick={reset}
                disabled={isLoading}
                className="w-full rounded-3xl bg-cyan-400 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Sending reset link..." : "Send reset link"}
              </button>

              <div className="rounded-3xl border border-white/10 bg-slate-950/90 px-5 py-4 text-sm text-slate-400 shadow-inner shadow-slate-950/20">
                <p className="font-medium text-slate-100">Need help?</p>
                <p className="mt-2">
                  If you don't receive the email soon, check your spam folder or
                  try again with the email address you registered with.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPass;
