import React, { useState, useEffect } from "react";
import {
  FaDoorOpen,
  FaFlag,
  FaPagelines,
  FaPaperclip,
  FaPencil,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { db } from "../services/database";
import { useAuth } from "../context/UseAuth";
import { TailSpin } from "react-loader-spinner";
import toast from "react-hot-toast";
import AvatarUploader from "../components/AvatarUploader";
import { getUserAvatar, getAvatarUrlFromKey } from "../services/avatarService";

const Profile = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatarUploader, setShowAvatarUploader] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadUserAvatar = async () => {
      if (user?.id) {
        const { url } = await getUserAvatar(user.id);
        setAvatarUrl(url);
      }
    };
    loadUserAvatar();
  }, [user?.id]);
  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await db.auth.signOut();
      if (error) {
        toast.error(error);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="min-h-screen w-full p-2 flex flex-col pb-20">
      <h1 className="text-2xl text-blue-500 capitalize text-left w-full p-2 font-medium">
        My Profile
      </h1>
      <div className="w-full ring ring-gray-500 opacity-50"></div>
      <section className=" w-full p-2 flex flex-col justify-center items-center gap-4">
        <div className="relative w-[90%] flex flex-col justify-center items-center gap-2 rounded-2xl shadow-lg p-4">
          <div className="relative w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl text-gray-500">👤</span>
            )}
            <button
              onClick={() => setShowAvatarUploader(true)}
              className="absolute bottom-0 right-2 text-white bg-blue-500 rounded-full p-2 size-8 hover:bg-blue-600 transition"
            >
              <FaPencil />
            </button>
          </div>
          <h2 className="text-xl text-gray-700 font-semibold">
            {user.user_metadata?.username}
          </h2>
          <p className="text-gray-600">{user.user_metadata?.email}</p>
          {user.user_metadata?.phone && (
            <p className="text-gray-600">{user.user_metadata.phone}</p>
          )}
          <p className="italic text-sm text-green-500">
            Member since:{" "}
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString()
              : "N/A"}
          </p>
          <span className="absolute top-3 right-3 text-sm text-white bg-amber-500 px-2 py-1 rounded-lg">
            Not verified
          </span>
        </div>
        {user.user_metadata?.role === "agent" && (
          <div className="w-full p-2 flex gap-2">
            <div className="w-full p-2 bg-gray-200 rounded-lg flex flex-col justify-around items-center">
              <span>12</span>
              <p className="text-sm text-gray-500">Listings</p>
            </div>
            <div className="w-full p-2 bg-gray-200 rounded-lg flex flex-col justify-around items-center">
              <span>5</span>
              <p className="text-sm text-gray-500">Clicks</p>
            </div>
            <div className="w-full p-2 bg-gray-200 rounded-lg flex flex-col justify-around items-center">
              <span>3</span>
              <p className="text-sm text-gray-500">Enquiries</p>
            </div>
          </div>
        )}
      </section>
      <section className="w-full p-2 flex flex-col justify-center items-start gap-4">
        <h2 className="text-xl text-gray-700 font-semibold">Account</h2>
        <div className="w-full flex flex-col justify-center items-start text-lg">
          <button className="flex items-start gap-4 w-full p-2 " onClick={() => navigate("/dashboard/edit-profile")}>
            <FaPencil className="text-gray-500" />
            <span className="text-gray-600">Edit Profile</span>
          </button>
          <button className="flex items-start gap-4 w-full p-2 " onClick={() => navigate("/dashboard/reports")}>
            <FaFlag className="text-gray-500" />
            <span className="text-gray-600">Reports</span>
          </button>
          <button className="flex items-start gap-4 w-full p-2 " onClick={() => navigate("/privacy")}>
            <FaPagelines className="text-gray-500" />
            <span className="text-gray-600">Privacy Policy</span>
          </button>
          <button className="flex items-start gap-4 w-full p-2 " onClick={() => navigate("/terms")}>
            <FaPagelines className="text-gray-500" />
            <span className="text-gray-600">Terms of Service</span>
          </button>
          <button className="flex items-start gap-4 w-full p-2" onClick={() => navigate("/faq")}>
            <FaPaperclip className="text-gray-500" />
            <span className="text-gray-600">FAQ</span>
          </button>
          <button className="flex items-start gap-4 w-full p-2" onClick={() => navigate("/dashboard/support")}>
            <FaPaperclip className="text-gray-500" />
            <span className="text-gray-600">Support</span>
          </button>
          <button
            onClick={logout}
            className="flex items-start gap-4 w-full p-2 "
            disabled={isLoading}
          >
            <FaDoorOpen className="text-gray-500" />
            <span className="text-gray-600">Logout</span>
          </button>
          <p className="italic text-sm text-center w-full capitalize ">
            {" "}
            zilo home 1.0.0
          </p>
          <div
            className="inset-0 z-50 h-full bg-black/50 absolute flex justify-center items-center"
            style={{ display: isLoading ? "flex" : "none" }}
          >
            <TailSpin />
          </div>
        </div>
      </section>
      {showAvatarUploader && user && (
        <AvatarUploader
          userId={user.id}
          onAvatarChange={(url) => {
            setAvatarUrl(url);
            setShowAvatarUploader(false);
          }}
          onClose={() => setShowAvatarUploader(false)}
        />
      )}
    </main>
  );
};

export default Profile;
