import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import toast from "react-hot-toast";
import { db } from "../services/database";
import { useAuth } from "../context/UseAuth";

const MyReports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const { data, error } = await db
          .from("property_reports")
          .select("*, property(*)")
          .eq("reporter_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setReports(data || []);
      } catch (err) {
        console.error("Failed to load reports", err);
        toast.error("Failed to load your reports.");
      } finally {
        setLoading(false);
      }
    };

fetchReports();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <button
        className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 mb-6"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft /> Back
      </button>

      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">My Reports</h1>
        <p className="text-sm text-slate-500 mb-6">
          View the status of the reports you've submitted.
        </p>

        {loading ? (
          <p>Loading...</p>
        ) : reports.length === 0 ? (
          <p className="text-slate-600">You have not submitted any reports.</p>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => (
              <div
                key={r.id}
                className="border rounded-2xl p-4 flex items-start justify-between"
              >
                <div>
                  <p className="font-semibold">{r.reason}</p>
                  <p className="text-sm text-slate-600 mt-1">{r.description}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    Status: {r.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Property</p>
                  <p className="font-medium">{r.property?.title || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyReports;
