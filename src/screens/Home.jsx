import React, { useEffect, useState } from "react";
import { Searchbar } from "../components/Searchbar";
import { Card, CardLists } from "../components/Cards";
import { Link, useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa6";
import { useAuth } from "../context/UseAuth";
import { db } from "../services/database";
import brandPlaceholder from "../assets/brand.png";

const normalizeImageUrl = (key) => {
  if (!key || typeof key !== "string") return brandPlaceholder;
  if (key.startsWith("http")) return key;
  const { data } = db.storage.from("listing-images").getPublicUrl(key);
  return data?.publicUrl || brandPlaceholder;
};

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState([]);

  const userName = user.user_metadata?.username || "user";

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const { data: featuredData, error: featuredError } = await db
          .from("property")
          .select("*")
          .eq("is_featured", true)
          .order("created_at", { ascending: false })
          .limit(4);

        if (featuredError) throw featuredError;

        setFeatured(featuredData);
      } catch (error) {
        console.error("Home: fetch featured properties failed", error);
      }
    };

    loadFeatured();
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data: listingsData, error: listingsError } = await db
          .from("property")
          .select("id,title,location,price,status,description")
          .order("created_at", { ascending: false })
          .limit(8);

        if (listingsError) throw listingsError;

        if (!listingsData || listingsData.length === 0) {
          setProperties([]);
          setLoading(false);
          return;
        }

        const propertyIds = listingsData.map((p) => p.id);
        const { data: imagesData, error: imagesError } = await db
          .from("property_images")
          .select("storage_key,prop_id")
          .in("prop_id", propertyIds)
          .order("id", { ascending: true });

        if (imagesError) throw imagesError;

        const imagesByPropId = (imagesData || []).reduce((acc, row) => {
          if (!acc[row.prop_id]) acc[row.prop_id] = [];
          acc[row.prop_id].push(row.storage_key);
          return acc;
        }, {});

        const enriched = listingsData.map((listing) => ({
          ...listing,
          imgsrc: normalizeImageUrl(imagesByPropId[listing.id]?.[0]),
        }));

        setProperties(enriched);
      } catch (error) {
        console.error("Home: fetch properties failed", error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const items = properties;
  const featuredItems = featured;

  if (loading) {
    return (
      <main className="min-h-screen w-full p-3 flex flex-col items-center justify-center">
        <p className="text-slate-600">Loading properties...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full p-3 flex flex-col items-start overflow-y-auto pb-20">
      <h1 className="text-2xl text-gray-500 capitalize text-left w-full p-2 font-medium">
        welcome ! <br />
        <span className="text-blue-500">{userName}</span>
      </h1>
      <Searchbar />
      <section className="w-full mt-5">
        <h2 className="text-xl text-gray-500 capitalize text-left w-full p-2 font-medium">
          Featured Properties 
        </h2>
        {featuredItems.length === 0 ? (
          <p className="p-2 text-slate-500">No properties available yet.</p>
        ) : (
          <div className="w-full flex gap-4 p-2 overflow-x-auto scrollbar-hide">
            {featuredItems.map((item) => (
              <div
                key={item.id}
                className="shrink-0 w-72 cursor-pointer"
                onClick={() => navigate(`/dashboard/property/${item.id}`)}
              >
                <Card
                  imgsrc={item.imgsrc}
                  price={item.price ? `FCFA ${item.price}` : "Price not set"}
                  title={item.title}
                  description={item.description}
                  status={item.status}
                />
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="w-full p-2">
        <h2 className="text-xl text-gray-500 capitalize text-left w-full p-2 font-medium">
          Latest Listings
        </h2>
        {items.length === 0 ? (
          <p className="p-2 text-slate-500">No properties available yet.</p>
        ) : (
          <div className="h-auto w-full">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/dashboard/property/${item.id}`)}
                className="cursor-pointer"
              >
                <CardLists
                  imgsrc={item.imgsrc}
                  price={item.price ? `${item.price} FCFA` : "Price not set"}
                  location={item.location || item.address || "Unknown location"}
                  title={item.title}
                  description={item.description}
                />
              </div>
            ))}
          </div>
        )}
      </section>
      {user.user_metadata?.role === "agent" && (
        <Link
          to={"/add"}
          className="fixed bottom-20 right-7 text-3xl z-10 bg-blue-500 text-white p-2 rounded-full"
        >
          <FaPlus />
        </Link>
      )}
    </main>
  );
};

export default Home;
