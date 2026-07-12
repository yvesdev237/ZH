import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCircleQuestion,
  FaChevronDown,
  FaHouse,
  FaShieldHalved,
} from "react-icons/fa6";

const FAQ = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "How do I sign up?",
      answer:
        "Tap the “Let’s get started” button on the landing page, then complete the registration form with your email address, password, and basic profile details.",
    },
    {
      question: "How do I save favorite properties?",
      answer:
        "While browsing listings, use the heart icon to add a property to your favorites. You can revisit saved homes anytime from the Favorites section in your account.",
    },
    {
      question: "Can I list a property on Zilo Home?",
      answer:
        "Yes. Verified agents and property owners can publish listings with accurate details, photos, pricing, and availability information. All submissions are reviewed to help maintain trust and quality across the platform.",
    },
    {
      question: "How are property details verified?",
      answer:
        "Zilo Home encourages users to provide truthful and current information. Listings may be checked for completeness and compliance, but buyers and renters should still confirm important details directly.",
    },
    {
      question: "What should I do if I suspect a scam or suspicious listing?",
      answer:
        "Do not share personal or financial information until you have verified the listing. If something seems suspicious, report the property or contact support immediately so we can review the matter.",
    },
    {
      question: "How do I contact support?",
      answer:
        "Use the support form in the app to send a request about your account, listings, bookings, or any other issue. We aim to respond promptly and help resolve concerns efficiently.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl rounded-[28px] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-black/30 sm:p-8 lg:p-10">
        <div className="mb-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 sm:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-300">
            <FaCircleQuestion /> Help center
          </div>
          <h1 className="mb-3 text-3xl font-semibold text-white">
            Frequently Asked Questions
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            Find clear answers to common questions about using Zilo Home for
            property discovery, account management, and support.
          </p>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-blue-300">
              <FaHouse />{" "}
              <span className="font-semibold">Property discovery</span>
            </div>
            <p className="text-sm text-slate-400">
              Learn how to search, save, and manage the homes you love.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-emerald-300">
              <FaShieldHalved />{" "}
              <span className="font-semibold">Trust and safety</span>
            </div>
            <p className="text-sm text-slate-400">
              Get guidance on reporting issues and staying safe while using the
              platform.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-semibold text-white">
                    {item.question}
                  </span>
                  <FaChevronDown
                    className={`text-slate-400 transition ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <p className="px-5 pb-5 text-sm leading-7 text-slate-300 sm:text-base">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => navigate("/privacy")}
            className="inline-flex items-center justify-center rounded-2xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            View Privacy Policy
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

export default FAQ;
