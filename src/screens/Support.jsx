import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCircleInfo,
  FaEnvelopeOpenText,
  FaShieldHalved,
  FaHouse,
} from "react-icons/fa6";
import toast from "react-hot-toast";
import { db } from "../services/database";
import { useAuth } from "../context/UseAuth";

const Support = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please provide a subject and message.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await db.from("support_messages").insert({
        sender_id: user?.id,
        subject,
        message,
      });

      if (error) throw error;
      toast.success("Support request sent. We will follow up shortly.");
      setSubject("");
      setMessage("");
      setTimeout(() => navigate(-1), 2200);
    } catch (err) {
      console.error("Support submit error", err);
      toast.error("Failed to send support request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <button
        className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft /> Back
      </button>

      <div className="mx-auto max-w-5xl rounded-[28px] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="mb-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 sm:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-300">
            <FaEnvelopeOpenText /> Help center
          </div>
          <h1 className="mb-3 text-3xl font-semibold text-white">
            Contact Support
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            Need help with your account, a listing, scheduling, payments, or a
            safety concern? Share your details below and our support team will
            review your request as soon as possible.
          </p>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-blue-300">
              <FaHouse /> <span className="font-semibold">Listing help</span>
            </div>
            <p className="text-sm text-slate-400">
              Support for property visibility, edits, and listing concerns.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-amber-300">
              <FaCircleInfo />{" "}
              <span className="font-semibold">Quick guidance</span>
            </div>
            <p className="text-sm text-slate-400">
              Tell us what happened and include any screenshots or references.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-emerald-300">
              <FaShieldHalved />{" "}
              <span className="font-semibold">Safe resolution</span>
            </div>
            <p className="text-sm text-slate-400">
              We review abuse and suspicious activity as part of our support
              workflow.
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
          <p className="mb-2 font-semibold text-white">What to include</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Property address or listing reference, if applicable</li>
            <li>A short description of the issue</li>
            <li>Any screenshots or booking details you want us to review</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Subject
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              placeholder="Brief summary of the issue"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full resize-none rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              placeholder="Describe the issue in detail"
            />
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 rounded-2xl border border-slate-700 bg-slate-950/80 px-6 py-3 font-semibold text-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 px-6 py-3 font-semibold text-white disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Support;
