import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaArrowRight,
  FaFilter,
  FaSearchengin,
  FaXmark,
} from "react-icons/fa6";
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
        className="flex w-full cursor-pointer items-center gap-2 rounded-[1.2rem] border border-slate-200 bg-white/90 px-3 py-2.5 shadow-sm transition hover:border-blue-300 hover:bg-slate-50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <FaSearchengin className="size-5" />
        </div>
        <input
          type="text"
          className="flex-1 bg-transparent p-1 text-sm text-slate-700 outline-none placeholder:text-slate-400"
          placeholder="Search city, area..."
          value={query}
          readOnly
        />
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-slate-100">
          <FaFilter className="size-4" />
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_24px_80px_-25px_rgba(15,23,42,0.45)]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">
                  Search
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  Find your next place
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 text-slate-600 transition hover:bg-slate-200"
              >
                <FaXmark />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-4 py-4 sm:px-6 sm:py-5">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Search by title, location, or description
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  type="search"
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g. Buea, apartment, pool"
                  autoFocus
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <FaSearchengin /> Search
                </button>
              </div>
            </form>

            <div className="max-h-[60vh] overflow-y-auto px-4 pb-5 sm:px-6 sm:pb-6">
              {loading ? (
                <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Loading results...
                </div>
              ) : results.length === 0 ? (
                <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
                  No results yet. Try a broader keyword or location.
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => goToProperty(item.id)}
                      className="w-full rounded-[1.25rem] border border-slate-200 bg-white p-4 text-left transition hover:border-blue-400 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.location || "No location"}
                          </p>
                        </div>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                          {item.status || "Unknown"}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">
                        {item.description || "No description"}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">
                          {item.price ? `FCFA ${item.price}` : "Price not set"}
                        </p>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600">
                          View <FaArrowRight />
                        </span>
                      </div>
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
