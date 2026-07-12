import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaPlus, FaHouse, FaArrowRight } from "react-icons/fa6";
import { db } from "../services/database";
import { useAuth } from "../context/UseAuth";
import brandPlaceholder from "../assets/brand.png";

const normalizeImageUrl = (key) => {
  if (!key || typeof key !== "string") return brandPlaceholder;
  if (key.startsWith("http")) return key;

  const { data } = db.storage.from("listing-images").getPublicUrl(key);
  return data?.publicUrl || brandPlaceholder;
};

const MyProperties = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageMap, setImageMap] = useState({});

  useEffect(() => {
    const loadProperties = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await db
          .from("property")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        const propertyRows = data || [];
        setProperties(propertyRows);

        const nextImageMap = {};
        for (const property of propertyRows) {
          const { data: imageRows } = await db
            .from("property_images")
            .select("storage_key")
            .eq("prop_id", property.id)
            .order("ordering", { ascending: true })
            .limit(1);

          const primaryImage = imageRows?.[0]?.storage_key;
          nextImageMap[property.id] = primaryImage
            ? normalizeImageUrl(primaryImage)
            : brandPlaceholder;
        }

        setImageMap(nextImageMap);
      } catch (error) {
        console.error("Error loading my properties:", error);
        toast.error("Unable to load your properties right now.");
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [user?.id]);

  return (
    <main className="min-h-screen w-full bg-slate-50 px-4 py-5 pb-24 text-slate-800">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-500">
              Agent workspace
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              My Properties
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage the listings you created and keep them up to date.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/add")}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <FaPlus /> Add property
          </button>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Loading your properties...
          </div>
        ) : properties.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <FaHouse size={24} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No properties yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Start by adding your first listing so it appears here.
            </p>
            <button
              type="button"
              onClick={() => navigate("/add")}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <FaPlus /> Create listing
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {properties.map((property) => (
              <div
                key={property.id}
                className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm"
              >
                <img
                  src={imageMap[property.id] || brandPlaceholder}
                  alt={property.title || "Property preview"}
                  className="h-44 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = brandPlaceholder;
                  }}
                />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {property.title || "Untitled property"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {property.location || "Location not set"}
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                      {property.status || "sale"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-base font-semibold text-slate-900">
                      {property.price
                        ? `FCFA ${property.price}`
                        : "Price not set"}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/dashboard/property/${property.id}`)
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      View <FaArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyProperties;
