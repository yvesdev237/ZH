import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFileContract,
  FaHouse,
  FaShieldHalved,
  FaArrowLeft,
} from "react-icons/fa6";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl rounded-[28px] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-black/30 sm:p-8 lg:p-10">
        <div className="mb-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 sm:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-300">
            <FaFileContract /> Terms and conventions
          </div>
          <h1 className="mb-3 text-3xl font-semibold text-white">
            Terms of Service
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            These terms outline the responsibilities of both users and Zilo Home
            while using our property marketplace and related services.
          </p>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-blue-300">
              <FaHouse /> <span className="font-semibold">Listings</span>
            </div>
            <p className="text-sm text-slate-400">
              Property details must be accurate, lawful, and clearly presented.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-amber-300">
              <FaShieldHalved /> <span className="font-semibold">Safety</span>
            </div>
            <p className="text-sm text-slate-400">
              Fraud, abuse, and harmful behavior are not permitted on the
              platform.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-emerald-300">
              <FaFileContract />{" "}
              <span className="font-semibold">Transactions</span>
            </div>
            <p className="text-sm text-slate-400">
              Payments and agreements are handled directly between parties
              unless otherwise stated.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-5 text-sm leading-7 text-slate-300 sm:text-base">
          <p>
            Welcome to Zilo Home. These Terms of Service govern your access to
            and use of our property discovery, listing, and communication
            platform. By creating an account or using our services, you agree to
            comply with these terms and all applicable laws.
          </p>
          <p>
            You are responsible for providing accurate account information,
            keeping your login credentials secure, and using the platform in a
            lawful and respectful manner. You may not post false listings,
            misleading property details, offensive content, spam, or any
            material that infringes on the rights of others.
          </p>
          <p>
            Property listings, pricing, availability, and images are provided by
            owners, agents, or third parties. Zilo Home acts as a platform
            facilitator and does not guarantee the accuracy, completeness, or
            availability of any property information. Users should verify
            details independently before making decisions or transactions.
          </p>
          <p>
            If you list a property, you agree to provide truthful information,
            comply with local real estate regulations, and ensure that any
            marketing content you submit is lawful and properly authorized.
            Payments, deposits, and contractual obligations, where applicable,
            are handled directly between parties and are not managed by Zilo
            Home.
          </p>
          <p>
            We reserve the right to suspend or terminate accounts that violate
            these terms, abuse the platform, or engage in fraudulent or harmful
            activity. We also reserve the right to update these terms at any
            time, with continued use of the platform constituting acceptance of
            any revised terms.
          </p>
          <p>
            For questions about these terms, please contact our support team
            through the app before you proceed with any listing, booking, or
            transaction.
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
        >
          <FaArrowLeft /> Go Back
        </button>
      </div>
    </main>
  );
};

export default Terms;
