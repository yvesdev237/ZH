import React from "react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl rounded-3xl bg-slate-900/90 border border-slate-700 p-8 shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white mb-3">
            Privacy Policy
          </h1>
          <p className="text-slate-300 leading-relaxed">
            Zilo Home values your privacy and works to keep your personal
            information safe. This policy explains what information we collect,
            how we use it, and the choices you have.
          </p>
        </div>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            Information We Collect
          </h2>
          <p className="text-slate-300 leading-relaxed">
            We may collect information you provide directly, such as your name,
            email, and profile details, as well as data generated when you
            search, save favorites, or interact with properties.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            How We Use Your Data
          </h2>
          <p className="text-slate-300 leading-relaxed">
            Your data helps us personalize your experience, manage your account,
            and improve the service. We do not sell your personal information to
            third parties.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Security</h2>
          <p className="text-slate-300 leading-relaxed">
            We use reasonable security measures to protect your information.
            However, no system is completely secure, so please keep your account
            credentials private.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-2">
            Your Choices
          </h2>
          <p className="text-slate-300 leading-relaxed">
            You can manage your profile details from the account settings page.
            If you want to delete your account or have questions about your
            data, contact support through the app.
          </p>
        </section>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={() => navigate("/faq")}
            className="inline-block rounded-2xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white text-center transition hover:bg-blue-600"
          >
            View FAQ
          </button>
          <button
            onClick={() => navigate(-1)}
            className="inline-block rounded-2xl border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-200 text-center transition hover:border-slate-400"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
