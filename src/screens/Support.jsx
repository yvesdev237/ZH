import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
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
        sender_id: user?.id ,
        subject,
        message,
      });

      if (error) throw error;
      toast.success("Support request sent. We'll get back to you soon.");
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
    <main className="min-h-screen bg-slate-50 p-6">
      <button
        className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 mb-6"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft /> Back
      </button>

      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Contact Support</h1>
        <p className="text-sm text-slate-500 mb-6">
          Send us a message and our support team will respond.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Subject
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 outline-none"
              placeholder="Brief summary of the issue"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 outline-none resize-none"
              placeholder="Describe the issue in detail"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 rounded-2xl border border-slate-300 bg-white text-slate-900 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-2xl bg-linear-to-r from-red-500 to-orange-500 text-white font-semibold disabled:opacity-50"
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
