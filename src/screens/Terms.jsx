import React from "react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-gray-700 leading-7 mb-4">
          Welcome to Zilo Home. These Terms of Service govern your use of our
          application and describe your rights and responsibilities while using
          our service.
        </p>
        <p className="text-gray-700 leading-7 mb-4">
          By using the platform, you agree to follow all applicable laws and to
          act fairly and respectfully toward other users. You may not post
          fraudulent, abusive, or offensive content, and you agree to abide by
          our community guidelines.
        </p>
        <p className="text-gray-700 leading-7 mb-6">
          For a complete overview, please contact support or review the full
          policy when it becomes available.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 rounded-2xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
        >
          Go Back
        </button>
      </div>
    </main>
  );
};

export default Terms;
