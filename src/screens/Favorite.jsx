import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CardLists } from "../components/Cards";
import { useAuth } from "../context/UseAuth";
import { db } from "../services/database";
import brandPlaceholder from "../assets/brand.png";

const normalizeImageUrl = (key) => {
  if (!key || typeof key !== "string") return brandPlaceholder;
  if (key.startsWith("http")) return key;
  const { data } = db.storage.from("listing-images").getPublicUrl(key);
  return data?.publicUrl || brandPlaceholder;
};

const Favorite = () => {
  const navigate = useNavigate();
  const { favorites } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      try {
        if (!favorites || favorites.length === 0) {
          setProperties([]);
          return;
        }

        const { data, error } = await db
          .from("property")
          .select("*")
          .in("id", favorites)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const propertyIds = (data || []).map((property) => property.id);
        let enriched = data || [];

        if (propertyIds.length > 0) {
          const { data: imageRows, error: imageError } = await db
            .from("property_images")
            .select("storage_key,prop_id")
            .in("prop_id", propertyIds)
            .order("id", { ascending: true });

          if (imageError) {
            console.error(
              "Favorite: failed to load property images",
              imageError,
            );
          } else {
            const imagesByPropId = (imageRows || []).reduce((acc, row) => {
              if (!acc[row.prop_id]) acc[row.prop_id] = [];
              acc[row.prop_id].push(row.storage_key);
              return acc;
            }, {});

            enriched = enriched.map((property) => ({
              ...property,
              imgsrc: normalizeImageUrl(imagesByPropId[property.id]?.[0]),
            }));
          }
        }

        setProperties(enriched);
      } catch (err) {
        console.error("Favorite: failed to load favorites", err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [favorites]);

  return (
    <main className="min-h-screen w-full p-2 flex flex-col pb-20">
      <h1 className="text-2xl text-blue-500 capitalize text-left w-full p-2 font-medium">
        My Favorites
      </h1>
      <div className="w-full ring ring-gray-500 opacity-50"></div>
      <div className="w-full h-full flex flex-col gap-6 mt-6">
        {loading ? (
          <p className="text-slate-600">Loading favorite properties...</p>
        ) : properties.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center shadow">
            <h2 className="text-xl font-semibold text-slate-900">
              No favorites yet
            </h2>
            <p className="mt-2 text-slate-500">
              Save a property to see it here in real time.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {properties.map((property) => (
              <CardLists
                key={property.id}
                onClick={() => navigate(`/dashboard/property/${property.id}`)}
                imgsrc={property.imgsrc || brandPlaceholder}
                price={property.price ? `${property.price} FCFA` : "N/A"}
                title={property.title}
                location={
                  property.location || property.address || "Unknown location"
                }
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Favorite;
