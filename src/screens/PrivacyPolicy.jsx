import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShieldHalved,
  FaLock,
  FaCircleCheck,
  FaArrowRight,
} from "react-icons/fa6";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl rounded-[28px] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-black/30 sm:p-8 lg:p-10">
        <div className="mb-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 sm:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-300">
            <FaShieldHalved className="text-base" />
            Your privacy, protected
          </div>
          <h1 className="mb-3 text-3xl font-semibold text-white">
            Privacy Policy
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            Zilo Home is committed to protecting your privacy. This policy
            explains what personal information we collect, how we use it, who we
            share it with, and the choices available to you when using our real
            estate platform.
          </p>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-blue-300">
              <FaLock />{" "}
              <span className="font-semibold">Secure account access</span>
            </div>
            <p className="text-sm text-slate-400">
              We protect your login and profile details with industry-standard
              safeguards.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-emerald-300">
              <FaCircleCheck />{" "}
              <span className="font-semibold">Transparent data use</span>
            </div>
            <p className="text-sm text-slate-400">
              We explain clearly how your information supports search, support,
              and safety.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-amber-300">
              <FaShieldHalved />{" "}
              <span className="font-semibold">Your control</span>
            </div>
            <p className="text-sm text-slate-400">
              You can review, update, or request removal of your personal data.
            </p>
          </div>
        </div>

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <h2 className="mb-2 text-xl font-semibold text-white">
            Information We Collect
          </h2>
          <p className="text-sm leading-7 text-slate-300 sm:text-base">
            We collect information you provide directly, such as your name,
            email, phone number, profile details, account preferences, and
            property-related activity. We may also collect technical information
            such as device details, IP address, browser type, and usage data to
            improve service reliability and security.
          </p>
        </section>

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <h2 className="mb-2 text-xl font-semibold text-white">
            How We Use Your Data
          </h2>
          <p className="text-sm leading-7 text-slate-300 sm:text-base">
            Your information helps us create and manage your account, facilitate
            property searches, personalize recommendations, enable secure
            messaging, process requests, and improve the overall experience. We
            may also use your information to send service updates, security
            alerts, and important platform notices.
          </p>
        </section>

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <h2 className="mb-2 text-xl font-semibold text-white">
            Sharing and Disclosure
          </h2>
          <p className="text-sm leading-7 text-slate-300 sm:text-base">
            We do not sell your personal information. We may share limited
            information with trusted service providers that help us operate the
            platform, such as hosting, analytics, or support tools, and when
            legally required to comply with law enforcement or regulatory
            obligations.
          </p>
        </section>

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <h2 className="mb-2 text-xl font-semibold text-white">Security</h2>
          <p className="text-sm leading-7 text-slate-300 sm:text-base">
            We use reasonable administrative, technical, and physical safeguards
            to protect your information. However, no internet-based service can
            guarantee absolute security, so please keep your credentials private
            and report any suspicious activity immediately.
          </p>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <h2 className="mb-2 text-xl font-semibold text-white">
            Your Choices and Rights
          </h2>
          <p className="text-sm leading-7 text-slate-300 sm:text-base">
            You may review and update your profile information from your account
            settings. Depending on your location, you may also request access
            to, correction of, or deletion of your personal data. To make such a
            request, contact support through the app and we will guide you
            through the next steps.
          </p>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => navigate("/faq")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            View FAQ <FaArrowRight />
          </button>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-400 hover:text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
