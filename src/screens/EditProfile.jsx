import React from "react";
import { useAuth } from "../context/UseAuth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { db } from "../services/database";

const EditProfile = () => {
  const { user, refreshSession } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const role = user?.user_metadata?.role;

  React.useEffect(() => {
    setUsername(user?.user_metadata?.username || "");
    setEmail(user?.email || "");
    setPhone(user?.user_metadata?.phone || "");
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updates = { username, phone };
      const { error: authError } = await db.auth.updateUser({ data: updates });
      if (authError) throw authError;

      const { error: profileError } = await db
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
      if (profileError) throw profileError;

      toast.success("Profile updated successfully.");
      await refreshSession?.();
      navigate(-1);
    } catch (updateError) {
      console.error(updateError);
      toast.error("Unable to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email
            </label>
            <input
              value={email}
              disabled
              className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3"
            />
          </div>
          {role === "agent" && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 rounded-2xl border border-slate-300 px-6 py-3 text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-2xl bg-blue-500 px-6 py-3 text-white font-semibold hover:bg-blue-600 transition disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default EditProfile;
