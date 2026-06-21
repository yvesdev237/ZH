import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaFilter, FaSearchengin, FaTimeline } from "react-icons/fa6";
import { db } from "../services/database";

export const Searchbar = ({ onSearch }) => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const handleSearch = async (searchText) => {
    const normalized = searchText.trim();
    if (!normalized) {
      toast.error("Enter a city, location, or keyword to search.");
      setResults([]);
      return;
    }

    setLoading(true);
    const filter = `%${normalized}%`;
    const { data, error } = await db
      .from("property")
      .select("id,title,location,price,status,description")
      .or(
        `title.ilike.${filter},location.ilike.${filter},description.ilike.${filter}`,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Searchbar: property search failed", error);
      toast.error("Could not fetch search results.");
      setResults([]);
    } else {
      setResults(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await handleSearch(query);
    if (onSearch) onSearch(query);
  };

  const openAndSearch = async () => {
    openModal();
    if (query.trim()) {
      await handleSearch(query);
      if (onSearch) onSearch(query);
    }
  };

  const goToProperty = (propertyId) => {
    closeModal();
    navigate(`/dashboard/property/${propertyId}`);
  };

  return (
    <>
      <div
        onClick={openAndSearch}
        className="w-full flex items-center justify-center gap-2 p-2 outline outline-gray-300 rounded-lg shadow-sm cursor-pointer hover:bg-slate-50"
      >
        <FaSearchengin className="size-7 text-gray-400" />
        <input
          type="text"
          className="flex-1 outline-none p-1 text-gray-500 bg-transparent"
          placeholder="Search city, area..."
          value={query}
          readOnly
        />
        <button className="bg-black p-2 w-10 rounded-lg flex items-center justify-center">
          <FaFilter className="size-5 text-gray-300" />
        </button>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <FaSearchengin className="text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Search properties
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
              >
                <FaTimeline />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search by title, location, or description
              </label>
              <div className="flex gap-2">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  type="search"
                  className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g. Buea, apartment, pool"
                  autoFocus
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
                >
                  <FaSearchengin /> Search
                </button>
              </div>
            </form>

            <div className="max-h-[60vh] overflow-y-auto px-6 pb-6">
              {loading ? (
                <p className="text-slate-600">Loading results...</p>
              ) : results.length === 0 ? (
                <p className="text-slate-600">
                  No results yet. Enter a search term and press Search.
                </p>
              ) : (
                <div className="space-y-4">
                  {results.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => goToProperty(item.id)}
                      className="w-full rounded-3xl border border-slate-200 p-4 text-left hover:border-blue-400 hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {item.title}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {item.location || "No location"}
                          </p>
                        </div>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                          {item.status || "Unknown"}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">
                        {item.description || "No description"}
                      </p>
                      <p className="mt-3 text-sm font-semibold text-slate-900">
                        {item.price ? `FCFA ${item.price}` : "Price not set"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const SearchbarProps = () => {
  return (
    <div
      onClick={() => {
        toast.error("coming soon...");
      }}
      className="w-full flex items-center justify-center gap-2 px-4 p-1 outline outline-gray-300 rounded-3xl shadow-sm"
    >
      <FaSearchengin className="size-7 text-gray-400" />
      <input
        type="text"
        className="flex-1 outline-none p-1 text-gray-500"
        placeholder="what are you looking for ?"
        readOnly
      />
    </div>
  );
};
