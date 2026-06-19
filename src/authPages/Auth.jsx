import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { db } from "../services/database";
import { Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/UseAuth";
import logo from "../images/zilohomewb.png";

const Auth = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState("signin");

  // shared states
  const [isLoading, setIsLoading] = useState(false);

  // sign-in states
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siShow, setSiShow] = useState(false);

  // sign-up states
  const [suEmail, setSuEmail] = useState("");
  const [suName, setSuName] = useState("");
  const [suPhone, setSuPhone] = useState("");
  const [suRole, setSuRole] = useState("tenant");
  const [suPassword, setSuPassword] = useState("");
  const [suConfirmPassword, setSuConfirmPassword] = useState("");
  const [suShow, setSuShow] = useState(false);
  const [suShowConfirm, setSuShowConfirm] = useState(false);

  if (user && user.user_metadata?.role) {
    return <Navigate to="/dashboard/home" replace={true} />;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const signIn = async () => {
    if (typeof siEmail !== "string" || !emailRegex.test(siEmail) || !siEmail) {
      toast.error("Invalid Email !");
      return;
    }
    if (!siPassword) {
      toast.error("No password provided");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await db.auth.signInWithPassword({
        email: siEmail,
        password: siPassword,
      });
      if (error) {
        toast.error("Failed to sign in");
        console.error("login error :", error);
      } else {
        toast.success("Successfully signed in");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async () => {
    if (typeof suEmail !== "string" || !emailRegex.test(suEmail) || !suEmail) {
      toast.error("Invalid Email !");
      return;
    }
    if (!suPassword) {
      toast.error("No password provided");
      return;
    }
    if (!suName) {
      toast.error("Please provide your name");
      return;
    }
    if (suPassword !== suConfirmPassword) {
      toast.error("Passwords are different!");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await db.auth.signUp({
        email: suEmail,
        password: suPassword,
        options: {
          data: {
            username: suName.toLowerCase().trim(),
            phone: suPhone,
            role: suRole,
          },
        },
      });

      if (error) {
        toast.error("Failed to sign up");
        console.error("sign up error :", error);
        return;
      }

      toast.success("Successfully signed up !");
      console.log(data);
      setMode("signin");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen overflow-hidden text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_28%)]" />
      <div className="absolute inset-0 bg-[url('/src/assets/hero.png')] bg-cover bg-center opacity-20" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="relative w-full overflow-hidden rounded-4xl border border-white/10 bg-slate-950/80 shadow-2xl shadow-slate-950/30 backdrop-blur-xl lg:flex lg:gap-8">
          <aside className="hidden w-1/2 flex-col justify-between bg-slate-900/80 p-8 text-white lg:flex">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-200 shadow-sm shadow-cyan-500/10">
                <img
                  src={logo}
                  alt="Zilo Home logo"
                  className="h-8 w-8 rounded-xl object-cover"
                />
                <span>Zilo Home</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-white">
                  Find the perfect home
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                  One account for tenants and agents. Manage listings, view
                  favorites, and book properties with confidence.
                </p>
              </div>
            </div>
            <div className="mt-10 space-y-4 text-sm text-slate-400">
              <p className="text-slate-300 font-semibold">Why choose Zilo?</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-cyan-300">•</span>
                  <span>Responsive access across all devices</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-cyan-300">•</span>
                  <span>Tailored onboarding for tenants and agents</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 text-cyan-300">•</span>
                  <span>Secure authentication with modern UX</span>
                </li>
              </ul>
            </div>
          </aside>

          <section className="w-full p-6 sm:p-8 lg:w-1/2">
            <div className="mb-6 flex flex-col gap-4 rounded-[2rem] bg-slate-900/90 p-5 shadow-lg shadow-slate-950/40 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex items-center gap-3">
                  <img
                    src={logo}
                    alt="Zilo Home logo"
                    className="h-12 w-12 rounded-3xl border border-white/10 object-cover"
                  />
                  <div>
                    <p className="text-xs uppercase tracking-[0.30em] text-cyan-300">
                      Zilo Home
                    </p>
                    <h2 className="text-xl font-semibold text-white">
                      Your modern rental hub
                    </h2>
                  </div>
                </div>
                <div className="inline-flex rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300 ring-1 ring-white/10">
                  {mode === "signin" ? "Sign in flow" : "Create an account"}
                </div>
              </div>
              <div className="grid gap-3 rounded-3xl bg-slate-950/95 p-4 text-sm text-slate-300 shadow-inner shadow-slate-950/20">
                <p className="font-semibold text-slate-100">
                  Fast, friendly, and secure
                </p>
                <p className="text-slate-400">
                  Sign in or create an account to access listings, save
                  favorites, and book viewings from one sleek dashboard.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-full bg-slate-950/90 p-1 text-sm shadow-inner shadow-slate-950/20 sm:flex-row">
              <button
                onClick={() => setMode("signin")}
                className={`w-full rounded-full px-4 py-3 font-semibold transition ${mode === "signin" ? "bg-cyan-400 text-slate-950 shadow shadow-cyan-400/30" : "bg-slate-900 text-slate-300 hover:bg-slate-800"}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`w-full rounded-full px-4 py-3 font-semibold transition ${mode === "signup" ? "bg-cyan-400 text-slate-950 shadow shadow-cyan-400/30" : "bg-slate-900 text-slate-300 hover:bg-slate-800"}`}
              >
                Sign Up
              </button>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/40 sm:p-8">
              {mode === "signin" ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">
                      Welcome back
                    </h3>
                    <p className="text-sm text-slate-400">
                      Sign in to continue exploring available properties.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Email</span>
                      <input
                        type="email"
                        placeholder="hello@domain.com"
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/95 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                        value={siEmail}
                        onChange={(e) => setSiEmail(e.target.value)}
                      />
                    </label>

                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Password</span>
                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/95 px-4 py-3">
                        <input
                          type={siShow ? "text" : "password"}
                          placeholder="Enter your password"
                          className="w-full bg-transparent text-sm text-white outline-none"
                          value={siPassword}
                          onChange={(e) => setSiPassword(e.target.value)}
                        />
                        <button
                          className="text-cyan-300"
                          onClick={() => setSiShow(!siShow)}
                        >
                          {siShow ? <FaEye /> : <FaEyeSlash />}
                        </button>
                      </div>
                    </label>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                      to="/reset"
                      className="text-sm text-cyan-300 hover:text-cyan-200"
                    >
                      Forgot password?
                    </Link>
                    <button
                      onClick={signIn}
                      className="inline-flex justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={isLoading}
                    >
                      {isLoading ? "Loading..." : "Sign In"}
                    </button>
                  </div>

                  <div className="border-t border-white/10 pt-4 text-center text-sm text-slate-400">
                    Don&apos;t have an account?{" "}
                    <button
                      onClick={() => setMode("signup")}
                      className="font-semibold text-cyan-300 hover:text-cyan-200"
                    >
                      Sign up
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">
                      Create your account
                    </h3>
                    <p className="text-sm text-slate-400">
                      Sign up and start exploring properties with full access.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Name</span>
                      <input
                        type="text"
                        placeholder="Your name"
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/95 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                        value={suName}
                        onChange={(e) => setSuName(e.target.value)}
                      />
                    </label>

                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Email</span>
                      <input
                        type="email"
                        placeholder="hello@domain.com"
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/95 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                        value={suEmail}
                        onChange={(e) => setSuEmail(e.target.value)}
                      />
                    </label>

                    {suRole === "agent" && (
                      <label className="space-y-2 text-sm text-slate-300">
                        <span>WhatsApp number</span>
                        <input
                          type="tel"
                          placeholder="+237699959447"
                          className="w-full rounded-2xl border border-white/10 bg-slate-950/95 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                          value={suPhone}
                          onChange={(e) => setSuPhone(e.target.value)}
                        />
                      </label>
                    )}

                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Password</span>
                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/95 px-4 py-3">
                        <input
                          type={suShow ? "text" : "password"}
                          placeholder="Create a password"
                          className="w-full bg-transparent text-sm text-white outline-none"
                          value={suPassword}
                          onChange={(e) => setSuPassword(e.target.value)}
                        />
                        <button
                          className="text-cyan-300"
                          onClick={() => setSuShow(!suShow)}
                        >
                          {suShow ? <FaEye /> : <FaEyeSlash />}
                        </button>
                      </div>
                    </label>

                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Confirm Password</span>
                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/95 px-4 py-3">
                        <input
                          type={suShowConfirm ? "text" : "password"}
                          placeholder="Confirm password"
                          className="w-full bg-transparent text-sm text-white outline-none"
                          value={suConfirmPassword}
                          onChange={(e) => setSuConfirmPassword(e.target.value)}
                        />
                        <button
                          className="text-cyan-300"
                          onClick={() => setSuShowConfirm(!suShowConfirm)}
                        >
                          {suShowConfirm ? <FaEye /> : <FaEyeSlash />}
                        </button>
                      </div>
                    </label>
                  </div>

                  <div className="grid gap-2 rounded-3xl bg-slate-950/95 p-4 text-sm text-slate-300 shadow-inner shadow-slate-950/20">
                    <p className="font-semibold text-slate-100">I am</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSuRole("tenant")}
                        className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${suRole === "tenant" ? "bg-cyan-400 text-slate-950" : "bg-slate-900 text-slate-300 hover:bg-slate-800"}`}
                      >
                        Tenant
                      </button>
                      <button
                        onClick={() => setSuRole("agent")}
                        className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${suRole === "agent" ? "bg-cyan-400 text-slate-950" : "bg-slate-900 text-slate-300 hover:bg-slate-800"}`}
                      >
                        Agent
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={signUp}
                    className="w-full rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Create account"}
                  </button>

                  <div className="border-t border-white/10 pt-4 text-center text-sm text-slate-400">
                    Already have an account?{" "}
                    <button
                      onClick={() => setMode("signin")}
                      className="font-semibold text-cyan-300 hover:text-cyan-200"
                    >
                      Sign in
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Auth;
