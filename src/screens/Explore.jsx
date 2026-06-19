import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchbarProps } from "../components/Searchbar";
import toast from "react-hot-toast";
import { Card } from "../components/Cards";
import { db } from "../services/database";
import brandPlaceholder from "../assets/brand.png";

const normalizeImageUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("http")) return url;

  const { data } = db.storage.from("listing-images").getPublicUrl(url);
  return data?.publicUrl || null;
};

const Explore = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);

  const fetchListings = async () => {
    const { data, error } = await db
      .from("property")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return [];
    }

    const listings = data || [];
    const propertyIds = listings.map((listing) => listing.id);

    console.log("Explore fetched listings:", listings);
    console.log("Explore property IDs to load images for:", propertyIds);

    if (propertyIds.length > 0) {
      const { data: imageRows, error: imageError } = await db
        .from("property_images")
        .select("storage_key,prop_id")
        .in("prop_id", propertyIds)
        .order("id", { ascending: true });

      if (imageError) {
        console.error("Explore property_images lookup failed:", imageError);
      } else {
        console.log("Explore property_images rows:", imageRows);
        const imagesByPropId = (imageRows || []).reduce((acc, row) => {
          acc[row.prop_id] = acc[row.prop_id] || [];
          acc[row.prop_id].push(row.storage_key);
          return acc;
        }, {});

        return listings.map((listing) => {
          const firstImage = imagesByPropId[listing.id]?.[0];
          return {
            ...listing,
            firstImageUrl: normalizeImageUrl(firstImage),
          };
        });
      }
    }

    return listings.map((listing) => ({
      ...listing,
      firstImageUrl: null,
    }));
  };
  useEffect(() => {
    const loadingListings = async () => {
      const data = await fetchListings();
      setListings(data);
    };
    loadingListings();
  }, []);
  return (
    <main className="min-h-screen w-full p-2 flex flex-col pb-20">
      <h1 className="text-2xl text-gray-500 capitalize text-left w-full p-2 font-medium">
        discover <br />
        <span className="text-blue-500">properties</span>
      </h1>
      <SearchbarProps />
      <div className="w-full flex gap-2 items-start justify-start p-4">
        <button
          className="rounded-2xl bg-blue-400 p-1.5 w-20 text-white"
          onClick={() => {
            toast.error("coming soon...");
          }}
        >
          All
        </button>
        <button
          className="rounded-2xl bg-blue-400 p-1.5 w-20 text-white"
          onClick={() => {
            toast.error("coming soon...");
          }}
        >
          For Sale
        </button>
        <button
          className="rounded-2xl bg-blue-400 p-1.5 w-20 text-white"
          onClick={() => {
            toast.error("coming soon...");
          }}
        >
          For Rent
        </button>
      </div>
      <section className="w-full p-1 flex-1 flex flex-col">
        <h2 className="text-xl text-gray-500 capitalize text-left w-full p-2 font-medium">
          listed Properties ({listings.length})
        </h2>
        <div
          className={`w-full h-full flex items-start overflow-y-auto flex-col gap-5 p-2 ${listings.length === 0 && "justify-center"}`}
        >
          {listings.length === 0
            ? "There's nothing to show now "
            : listings.map((listing) => (
                <Card
                  key={listing.id}
                  onClick={() => navigate(`/dashboard/property/${listing.id}`)}
                  imgsrc={
                    listing.firstImageUrl ||
                    brandPlaceholder
                  }
                  price={listing.price}
                  title={listing.title}
                  description={listing.description}
                  status={listing.status}
                />
              ))}
        </div>
      </section>
    </main>
  );
};

export default Explore;
