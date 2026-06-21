import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../services/database";
import brandPlaceholder from "../assets/brand.png";
import { useAuth } from "../context/UseAuth";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaHeart,
  FaFlag,
  FaInfo,
  FaMapPin,
  FaWhatsapp,
  FaUser,
} from "react-icons/fa6";

const normalizeImageUrl = (key) => {
  if (!key || typeof key !== "string") return brandPlaceholder;
  if (key.startsWith("http")) return key;

  const { data } = db.storage.from("listing-images").getPublicUrl(key);
  return data?.publicUrl || brandPlaceholder;
};

const PropertyDetails = () => {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const { user, isFavorite: isFavoriteListing, toggleFavorite } = useAuth();
  const [property, setProperty] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isTenant = user?.user_metadata?.role === "tenant";
  const favorite = listingId ? isFavoriteListing(listingId) : false;

  const handleToggleFavorite = () => {
    if (!listingId) return;
    const nextFavoriteState = !favorite;
    toggleFavorite(listingId);
    toast.success(
      nextFavoriteState ? "Added to favorites" : "Removed from favorites",
    );
  };

  const loadOwnerInfo = async (ownerId) => {
    if (!ownerId) return;
    try {
      const { data: ownerData, error: ownerError } = await db
        .from("profiles")
        .select("username, phone, avatar_url")
        .eq("id", ownerId)
        .single();

      if (ownerError) {
        console.warn("Unable to load owner profile", ownerError);
        return;
      }

      if (ownerData) {
        setOwner({
          username: ownerData.username || "Owner",
          phone: ownerData.phone || null,
          avatar_url: ownerData.avatar_url || null,
        });
      }
    } catch (ownerFetchError) {
      console.warn("Unable to load owner profile", ownerFetchError);
    }
  };

  useEffect(() => {
    const loadProperty = async () => {
      setLoading(true);
      setError("");

      try {
        const { data: propertyData, error: propertyError } = await db
          .from("property")
          .select("*")
          .eq("id", listingId)
          .single();

        if (propertyError) {
          throw propertyError;
        }

        if (!propertyData) {
          setError("Property not found.");
          return;
        }

        setProperty(propertyData);
        setSelectedImageIndex(0);

        // Prefer explicit owner fields on the property record first
        if (
          propertyData.owner_name ||
          propertyData.contact_number ||
          propertyData.avatar_url
        ) {
          setOwner({
            username: propertyData.owner_name,
            phone: propertyData.contact_number || propertyData.phone || null,
            avatar_url: propertyData.avatar_url || null,
          });
        } else if (propertyData.user_id) {
          // Fallback to profiles table if available
          loadOwnerInfo(propertyData.user_id);
        }

        const { data: imageRows, error: imageError } = await db
          .from("property_images")
          .select("storage_key")
          .eq("prop_id", listingId)
          .order("id", { ascending: true });

        if (imageError) {
          console.error("PropertyDetails image load error", imageError);
          setImages([]);
        } else {
          setImages(imageRows || []);
        }
      } catch (fetchError) {
        console.error("PropertyDetails fetch error", fetchError);
        setError("Unable to load property details.");
      } finally {
        setLoading(false);
      }
    };

    if (listingId) {
      loadProperty();
    }
  }, [listingId]);

  const ownerAvatar = owner?.avatar_url
    ? normalizeImageUrl(owner.avatar_url)
    : brandPlaceholder;
  const ownerName = property?.owner_name || owner?.username || "Owner";
  const ownerPhone =
    owner?.phone || property?.contact_number || property?.phone || null;
  const hasWhatsapp = Boolean(ownerPhone);
  const whatsappUrl = hasWhatsapp
    ? `https://wa.me/${ownerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        `Hello, I am interested in ${property?.title || "this property"}. Could you share more details?`,
      )}`
    : "#";
  const isOwnerView =
    user?.id &&
    (property?.user_id === user.id ||
      (property?.owner_email && ownerEmail && user.email === ownerEmail));
  const firstImageUrl =
    images.length > 0
      ? normalizeImageUrl(images[selectedImageIndex]?.storage_key)
      : brandPlaceholder;

  if (loading) {
    return (
      <main className="min-h-screen w-full p-4 flex items-center justify-center">
        <p className="text-slate-600">Loading property details...</p>
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="min-h-screen w-full p-4 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">
          {error || "Property details are unavailable."}
        </p>
        <button
          type="button"
          onClick={() => navigate("/dashboard/home")}
          className="rounded-2xl bg-blue-500 px-5 py-3 text-white hover:bg-blue-600"
        >
          Back to listings
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full p-4 pb-24 flex flex-col gap-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
      >
        <FaArrowLeft /> Back
      </button>

      <section className="w-full rounded-3xl overflow-hidden bg-white shadow-sm">
        <div className="relative w-full h-80 overflow-hidden">
          <img
            src={firstImageUrl}
            alt={property.title || "Property"}
            onError={(e) => {
              e.currentTarget.src = brandPlaceholder;
            }}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black/70 to-transparent">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full overflow-hidden border border-white/30">
                <img
                  src={ownerAvatar}
                  alt={ownerName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = brandPlaceholder;
                  }}
                />
              </div>
              <div className="flex-1 text-white">
                <p className="font-semibold">{ownerName}</p>
                <p className="text-sm text-slate-200">
                  {ownerPhone || owner?.email || "Not available"}
                </p>
              </div>
              {isOwnerView && (
                <span className="rounded-full bg-blue-500 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white">
                  Your listing
                </span>
              )}
            </div>
          </div>

          <div className="absolute top-4 left-4 rounded-full bg-blue-500 px-4 py-2 text-white text-sm font-semibold">
            {property.status || "Status unavailable"}
          </div>
        </div>
        {images.length > 0 && (
          <div className="flex gap-3 overflow-x-auto p-4">
            {images.map((image, index) => (
              <button
                key={image.storage_key}
                type="button"
                onClick={() => setSelectedImageIndex(index)}
                className={`min-w-35 overflow-hidden rounded-3xl border-2 transition-all ${
                  selectedImageIndex === index
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
              >
                <img
                  src={normalizeImageUrl(image.storage_key)}
                  alt={`${property.title} ${index + 1}`}
                  onError={(e) => {
                    e.currentTarget.src = brandPlaceholder;
                  }}
                  className="h-24 w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">
                {property.title || "Untitled Property"}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <FaMapPin /> {property.location || "Location not set"}
              </p>
            </div>
            <p className="rounded-3xl bg-slate-100 px-5 py-3 text-2xl font-semibold text-blue-600">
              {property.price ? `FCFA ${property.price}` : "Price not set"}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Description
              </p>
              <p className="mt-2 text-slate-700">
                {property.description || "No description available."}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Property type
              </p>
              <p className="mt-2 text-slate-700">
                {property.type || "Not specified"}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Bedrooms
              </p>
              <p className="mt-2 text-slate-700">
                {property.bedrooms ?? "N/A"}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Bathrooms
              </p>
              <p className="mt-2 text-slate-700">
                {property.bathrooms ?? "N/A"}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-4 flex items-center gap-2 text-slate-500">
              <FaInfo />
              <h2 className="text-lg font-semibold text-slate-900">
                More information
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-1">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                  Listed on
                </p>
                <p className="mt-2 text-slate-700">
                  {property.created_at
                    ? new Date(property.created_at).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        className={`fixed bottom-4 left-4 right-4 z-50 flex flex-wrap gap-3 sm:left-6 sm:right-6 ${isTenant ? "sm:flex-nowrap" : "sm:flex-nowrap"}`}
      >
        {isTenant && !isOwnerView && (
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`flex-1 min-w-30 sm:flex-1 inline-flex items-center justify-center gap-2 rounded-3xl border px-4 py-3 text-xs sm:text-sm font-semibold transition ${
              favorite
                ? "border-red-500 bg-red-500 text-white"
                : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
            }`}
          >
            <FaHeart className="hidden sm:inline" />{" "}
            <span className="hidden sm:inline">
              {favorite ? "Saved" : "Save"}
            </span>
            <span className="sm:hidden">
              {favorite ? <FaHeart /> : <FaHeart className="text-slate-300" />}
            </span>
          </button>
        )}

        {!isOwnerView && (
          <button
            type="button"
            onClick={() => {
              if (hasWhatsapp) {
                window.open(whatsappUrl, "_blank");
              } else {
                toast.error("Owner WhatsApp number is not available.");
              }
            }}
            className={`${isTenant ? "flex-1 min-w-30" : "flex-1 min-w-37.5"} sm:flex-1 inline-flex items-center justify-center gap-2 rounded-3xl bg-green-500 px-4 py-3 text-xs sm:text-sm font-semibold text-white shadow-lg hover:bg-green-600 transition-all`}
          >
            <FaWhatsapp /> <span className="hidden sm:inline">WhatsApp</span>
          </button>
        )}

        {!isOwnerView && (
          <button
            type="button"
            onClick={() => {
              navigate(`/dashboard/property/report/${listingId}`);
            }}
            className="flex-1 min-w-25 sm:flex-none inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-300 bg-white px-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-all"
          >
            <FaFlag /> <span className="hidden sm:inline">Report</span>
          </button>
        )}
      </div>
    </main>
  );
};

export default PropertyDetails;
