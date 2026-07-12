import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../services/database";
import { getAvatarUrlFromKey } from "../services/avatarService";
import brandPlaceholder from "../assets/brand.png";
import { useAuth } from "../context/UseAuth";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
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

const normalizeAvatarUrl = (value) => {
  if (!value || typeof value !== "string") return brandPlaceholder;

  const trimmed = value.trim();
  if (!trimmed) return brandPlaceholder;
  if (trimmed.startsWith("http")) return trimmed;

  return getAvatarUrlFromKey(trimmed) || brandPlaceholder;
};

const buildOwnerInfo = (record) => ({
  username:
    record?.owner_name ||
    record?.owner ||
    record?.full_name ||
    record?.name ||
    "Owner",
  phone: record?.contact_number || record?.phone || record?.owner_phone || null,
  avatar_url: record?.avatar_url || null,
});

const resolveOwnerProfile = async ({ ownerId, fallbackOwner }) => {
  if (!ownerId) {
    return fallbackOwner;
  }

  try {
    const { data, error } = await db.rpc("get_public_profile", {
      profile_id: ownerId,
    });

    console.log("resolveOwnerProfile data:", data, "error:", error);
    if (error) {
      return fallbackOwner;
    }

    const ownerProfile = Array.isArray(data) ? data[0] : data;

    if (
      ownerProfile?.username ||
      ownerProfile?.phone ||
      ownerProfile?.avatar_url
    ) {
      return {
        username:
          ownerProfile.username ||
          ownerProfile.full_name ||
          fallbackOwner?.username ||
          "Owner",
        phone: ownerProfile.phone || fallbackOwner?.phone || null,
        avatar_url:
          ownerProfile.avatar_url || fallbackOwner?.avatar_url || null,
      };
    }
  } catch (error) {
    return fallbackOwner;
  }

  return fallbackOwner;
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

  const loadOwnerInfo = async (ownerId, fallbackOwner) => {
    const resolvedOwner = await resolveOwnerProfile({
      ownerId,
      fallbackOwner,
    });
    setOwner(resolvedOwner);
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

        const fallbackOwner = buildOwnerInfo(propertyData);
        setOwner(fallbackOwner);

        const hasExplicitOwnerInfo = Boolean(
          propertyData.owner_name ||
          propertyData.contact_number ||
          propertyData.phone ||
          propertyData.owner_phone ||
          propertyData.avatar_url ||
          propertyData.owner_email ||
          propertyData.email,
        );

        if (!hasExplicitOwnerInfo) {
          loadOwnerInfo(
            propertyData.user_id ||
              propertyData.owner_id ||
              propertyData.owner_user_id,
            fallbackOwner,
          );
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
    ? normalizeAvatarUrl(owner.avatar_url)
    : brandPlaceholder;
  const ownerName = property?.owner_name || owner?.username || "Owner";
  const ownerPhone =
    owner?.phone || property?.contact_number || property?.phone || null;
  const hasWhatsapp = Boolean(ownerPhone);
  const whatsappUrl = hasWhatsapp
    ? `https://wa.me/${ownerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        `Hello, I am interested in ${property?.title || "this property"} I found in ZILO HOME's platform. Could you share more details?`,
      )}`
    : "#";
  const isOwnerView =
    user?.id &&
    (property?.user_id === user.id ||
      (property?.owner_email && user.email === property.owner_email));
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
    <main className="min-h-screen w-full bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_45%,_#fdf2f8_100%)] p-3 pb-24 text-slate-800 sm:p-4 lg:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
        >
          <FaArrowLeft /> Back
        </button>

        <section className="overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_20px_60px_-25px_rgba(15,23,42,0.35)]">
          <div className="relative h-[20rem] overflow-hidden sm:h-[28rem] lg:h-[34rem] xl:h-[38rem]">
            <img
              src={firstImageUrl}
              alt={property.title || "Property"}
              onError={(e) => {
                e.currentTarget.src = brandPlaceholder;
              }}
              className="h-full w-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-6">
              <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm">
                {property.status || "Status unavailable"}
              </span>
              <div className="rounded-full bg-slate-950/60 px-3 py-1 text-sm font-medium text-white backdrop-blur">
                {property.location || "Location not set"}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 bg-white/80 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-3 rounded-[1.25rem] border border-slate-100 bg-slate-50/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-200 shadow-sm">
                  <img
                    src={ownerAvatar}
                    alt={ownerName}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = brandPlaceholder;
                    }}
                  />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {ownerName}
                  </p>
                  <p className="text-sm text-slate-600">
                    {ownerPhone || "No contact info"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isOwnerView && (
                  <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                    Your listing
                  </span>
                )}
                <div className="rounded-full bg-blue-600 px-3 py-1 text-lg font-semibold text-white shadow-sm">
                  {property.price ? ` ${property.price} FCFA` : "Price not set"}
                </div>
              </div>
            </div>
          </div>

          {images.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50/90 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {images.map((image, index) => (
                    <button
                      key={image.storage_key}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition-all sm:h-20 sm:w-20 ${
                        selectedImageIndex === index
                          ? "border-blue-500 shadow-md"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={normalizeImageUrl(image.storage_key)}
                        alt={`${property.title} ${index + 1}`}
                        onError={(e) => {
                          e.currentTarget.src = brandPlaceholder;
                        }}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImageIndex((current) =>
                        current === 0 ? images.length - 1 : current - 1,
                      )
                    }
                    className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:bg-slate-100"
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImageIndex((current) =>
                        current === images.length - 1 ? 0 : current + 1,
                      )
                    }
                    className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:bg-slate-100"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.3fr_0.7fr] lg:p-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  {property.title || "Untitled Property"}
                </h1>
                <p className="mt-3 flex items-center gap-2 text-sm text-slate-500 sm:text-base">
                  <FaMapPin className="text-blue-500" />
                  {property.location || "Location not set"}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-slate-500">
                  <FaInfo className="text-blue-500" />
                  <h2 className="text-lg font-semibold text-slate-900">
                    Description
                  </h2>
                </div>
                <p className="leading-7 text-slate-700">
                  {property.description || "No description available."}
                </p>
              </div>
            </div>

            <div className="space-y-4 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 shadow-sm">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Listing details
                </p>
                <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Listed on
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {property.created_at
                      ? new Date(property.created_at).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Contact
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {ownerPhone || owner?.email || "No contact info"}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

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
