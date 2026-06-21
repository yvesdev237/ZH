import React, { useState  } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFlag } from "react-icons/fa6";
import toast from "react-hot-toast";
import { db } from "../services/database";
import {useParams} from "react-router-dom";
import { useAuth } from "../context/UseAuth";
const Report = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const [reportType, setReportType] = useState("inappropriate");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {user} = useAuth();

  const reportTypes = [
    { value: "inappropriate", label: "Inappropriate Content", icon: "⚠️" },
    { value: "fraud", label: "Fraud/Scam", icon: "🚨" },
    { value: "misleading", label: "Misleading Information", icon: "❌" },
    { value: "offensive", label: "Offensive/Abusive", icon: "😠" },
    { value: "copyright", label: "Copyright Violation", icon: "©️" },
    { value: "other", label: "Other", icon: "📝" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error("Please provide a description of the issue");
      return;
    }

    try {
      console.log("user id", user.id);
      setIsSubmitting(true);

      const { error } = await db.from("property_reports").insert({
        property_id: propertyId,
        reporter_id: user.id,
        reason: reportType,
        description,
        status: "pending",
      });
      if (error) {
        throw new Error(error.message);
      }

      toast.success(
        "Report submitted successfully. Thank you for helping us improve Zilo Home!",
      );

      // Reset form
      setReportType("inappropriate");
      setDescription("");

      // Navigate back after 2 seconds
      setTimeout(() => navigate(-1), 1500);
    } catch (error) {
      toast.error("Failed to submit report. Please try again.");
      console.error("Report submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-linear-to-br from-slate-50 to-slate-100 p-4 flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100 transition-all"
        >
          <FaArrowLeft /> Back
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        <div className="w-full bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-linear-to-r from-red-500 to-orange-500 p-8 text-white">
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-white/20 rounded-full p-4">
                <FaFlag className="text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Report an Issue</h1>
                <p className="text-red-100 mt-1">
                  Help us maintain a safe community
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Report Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-4">
                What would you like to report? *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reportTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setReportType(type.value)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                      reportType === type.value
                        ? "border-red-500 bg-red-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className="text-2xl block mb-2">{type.icon}</span>
                    <p className="font-semibold text-slate-900">{type.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide details about the issue. Include any relevant information that will help us investigate..."
                rows={5}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">
                {description.length}/500 characters
              </p>
            </div>


            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Note:</span> Please be as
                detailed as possible. False reports may result in account
                restrictions.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 rounded-2xl border border-slate-300 bg-white text-slate-900 font-semibold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 rounded-2xl bg-linear-to-r from-red-500 to-orange-500 text-white font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Report;
