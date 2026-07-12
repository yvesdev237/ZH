import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import toast from "react-hot-toast";
import logo from "../images/zilohomewb.png";
import { db } from "../services/database";
import { useAuth } from "../context/UseAuth";

export const UpdatePass = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isRecoverySession } = useAuth();
  const [isRecoveryReady, setIsRecoveryReady] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const checkRecoverySession = async () => {
      setIsCheckingSession(true);

      const params = new URLSearchParams(window.location.search);
      const recoveryCode = params.get("code");
      const tokenHash = params.get("token_hash");
      const recoveryType = params.get("type");
      const hashParams = new URLSearchParams(
        window.location.hash.replace(/^#/, ""),
      );
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (recoveryCode) {
        const { data, error } =
          await db.auth.exchangeCodeForSession(recoveryCode);

        if (error) {
          console.error("Recovery code exchange failed:", error);
          setIsRecoveryReady(false);
        } else {
          setIsRecoveryReady(Boolean(data.session));
        }

        setIsCheckingSession(false);
        return;
      }

      if (tokenHash && recoveryType === "recovery") {
        const { data, error } = await db.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });

        if (error) {
          console.error("Recovery token verification failed:", error);
          setIsRecoveryReady(false);
        } else {
          setIsRecoveryReady(Boolean(data.session));
        }

        setIsCheckingSession(false);
        return;
      }

      if (accessToken && refreshToken) {
        const { data, error } = await db.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("Recovery session setup failed:", error);
          setIsRecoveryReady(false);
        } else {
          setIsRecoveryReady(Boolean(data.session));
        }

        setIsCheckingSession(false);
        return;
      }

      const {
        data: { session },
        error,
      } = await db.auth.getSession();

      if (error) {
        console.error("Session check failed:", error);
        setIsRecoveryReady(false);
      } else {
        setIsRecoveryReady(Boolean(session) || isRecoverySession);
      }

      setIsCheckingSession(false);
    };

    checkRecoverySession();
  }, [isRecoverySession]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!isRecoveryReady) {
      toast.error("Open the recovery link from your email first.");
      return;
    }

    if (!password || !confirmPassword) {
      toast.error("Please fill in both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await db.auth.updateUser({
        password,
      });

      if (error) {
        toast.error(error.message);
        console.error("Update password error:", error);
      } else {
        toast.success("Password updated successfully.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_28%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10">
        <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-4 text-center lg:text-left">
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
                    Update Password
                  </h1>
                </div>
              </div>
              <p className="max-w-xl text-sm text-slate-400 sm:text-base">
                Choose a strong new password to keep your account secure and
                continue using your dashboard without interruption.
              </p>
            </div>

            <form
              onSubmit={handleUpdate}
              className="rounded-[1.5rem] border border-white/10 bg-slate-950/90 p-6 shadow-inner shadow-slate-950/20"
            >
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <label
                    htmlFor="new-password"
                    className="text-sm font-semibold text-slate-300"
                  >
                    New Password
                  </label>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      className="w-full bg-transparent text-sm text-white outline-none"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="text-cyan-300"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="confirm-password"
                    className="text-sm font-semibold text-slate-300"
                  >
                    Confirm New Password
                  </label>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      className="w-full bg-transparent text-sm text-white outline-none"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="text-cyan-300"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                </div>

                {!isCheckingSession && !isRecoveryReady && (
                  <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                    Open the password reset link from your email before changing
                    your password.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !isRecoveryReady || isCheckingSession}
                  className="w-full rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading
                    ? "Updating password..."
                    : isCheckingSession
                      ? "Checking recovery session..."
                      : "Update password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
