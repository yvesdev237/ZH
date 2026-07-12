import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { FaCamera, FaCheck, FaHouse, FaImage, FaX } from "react-icons/fa6";
import { db } from "../services/database";
import { useAuth } from "../context/UseAuth";
import { Card } from "../components/Cards";
import brandPlaceholder from "../assets/brand.png";

const AddProp = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [status, setStatus] = useState("sale");
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const isSubmitting = useRef(false);
  const fileInputRef = useRef(null);

  //HANDLE IMAGE UPLOAD
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (file) => file.type && file.type.startsWith("image/"),
    );
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const sizeFilteredFiles = validFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 5MB`);
        return;
      }
      return true;
    });

    const uniqueFiles = sizeFilteredFiles.filter(
      (newFile) =>
        !images.some((existingFile) => existingFile.name === newFile.name),
    );

    const maxAllowed = 5;
    const spaceLeft = maxAllowed - images.length;
    const filesToAdd = uniqueFiles.slice(0, spaceLeft);

    if (filesToAdd.length === 0) {
      if (uniqueFiles.length > 0)
        toast.error(`You can only upload up to ${maxAllowed} images.`);
      return;
    }

    const updatedImages = [...images, ...filesToAdd];
    setImages(updatedImages);

    const newPreviewUrls = filesToAdd.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => {
      const nextUrls = [...prev, ...newPreviewUrls];
      if (nextUrls.length > 0 && selectedImageIndex >= nextUrls.length) {
        setSelectedImageIndex(0);
      }
      return nextUrls;
    });

    if (uniqueFiles.length > filesToAdd.length) {
      toast.error(
        `Maximum of ${maxAllowed} images allowed. Extra images were ignored.`,
      );
    }
  };

  //CLEANUP PREVIEW URLS TO AVOID MEMORY LEAKS
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  //UPLOAD IMAGES
  const uploadImages = async () => {
    console.log("AddProp: starting image upload for", images.length, "images");
    const uploadPromises = images.map(async (image) => {
      const fileName = `${Date.now()}-${image.name}`;
      console.log("AddProp: uploading", fileName);
      const { error } = await db.storage
        .from("listing-images")
        .upload(fileName, image);
      if (error) {
        console.error("AddProp: upload error for", fileName, error);
        toast.error(`Failed to upload ${image.name}`);
        return null;
      }
      // Return storage key instead of public URL
      console.log("AddProp: uploaded", fileName, "to storage bucket");
      return fileName;
    });

    const results = await Promise.all(uploadPromises);
    console.log("AddProp: all uploads complete, results:", results);
    return results.filter((key) => key !== null);
  };

  //IMAGE SUBMISSION LOGIC
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    if (!title || !price || !location || !description || !status) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (images.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }
    if (!user) {
      toast.error("You must be logged in to add a property.");
      return;
    }
    console.log("user", user);

    try {
      isSubmitting.current = true;
      setUploading(true);
      //listing creation logic
      const { data: listingsData, error: listingsError } = await db
        .from("property")
        .insert([
          {
            title,
            price: parseFloat(price),
            location,
            description,
            status,
            user_id: user?.id,
          },
        ])
        .select();

      if (listingsError) {
        console.error("Error creating listing:", listingsError);
        return;
      }

      const listingId = listingsData[0].id;

      //upload images and get URLs
      const imageUrls = await uploadImages();
      console.log("AddProp: uploaded image URLs:", imageUrls);

      //save images
      if (imageUrls.length > 0) {
        const imageRecords = imageUrls.map((key, idx) => ({
          prop_id: listingId,
          storage_key: key,
          filename: key ? key.replace(/^[0-9-]+-/, "") : null,
          ordering: idx,
        }));
        console.log("AddProp: inserting image records:", imageRecords);
        const { error: imagesError } = await db
          .from("property_images")
          .insert(imageRecords);
        if (imagesError) {
          console.error("Error saving image records:", imagesError);
          toast.error(`Failed to save images: ${imagesError.message}`);
        } else {
          toast.success("Property listed successfully!");
        }
      } else {
        console.warn("AddProp: no image URLs returned from upload");
        toast.warning("Property listed but no images were uploaded.");
      }
    } catch (submittingError) {
      console.error("Submission error", submittingError);
    } finally {
      isSubmitting.current = false;
      setUploading(false);
      setDescription("");
      setPrice("");
      setTitle("");
      setLocation("");
      setStatus("sale");
      setPreviewUrls([]);
    }
  };

  const removeImage = (indexToRemove) => {
    setImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove),
    );

    setPreviewUrls((prevUrls) => {
      const urlToRevoke = prevUrls[indexToRemove];
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
      const nextUrls = prevUrls.filter((_, index) => index !== indexToRemove);
      if (selectedImageIndex >= nextUrls.length) {
        setSelectedImageIndex(Math.max(nextUrls.length - 1, 0));
      }
      return nextUrls;
    });
  };

  return (
    <main className="min-h-screen w-full overflow-y-auto bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_45%,_#fdf2f8_100%)] pb-24 text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.3)] backdrop-blur sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
                New listing
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                Add a property
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                Share your space with a polished listing that’s easy to review
                and ready to attract interest.
              </p>
            </div>
            <div className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm">
              {images.length}/5 photos ready
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-[1.5rem] border border-dashed border-blue-300 bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 p-6 transition-all hover:border-blue-500 hover:shadow-md"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                  <div className="rounded-full bg-blue-600 p-4 text-white shadow-lg">
                    <FaCamera size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Upload your property photos
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Add up to 5 clear images to show the space beautifully.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4">
                  <Card
                    imgsrc={previewUrls[selectedImageIndex] || brandPlaceholder}
                    price={price ? `FCFA ${price}` : "Price"}
                    title={title || "Untitled property"}
                    description={location || "No location"}
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {previewUrls.map((url, index) => (
                    <div
                      key={index}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                        selectedImageIndex === index
                          ? "border-blue-500 shadow-md"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="h-20 w-20 object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                        aria-label="Remove image"
                      >
                        <FaX />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 rounded-[1.25rem] bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Status
                    </p>
                    <p className="mt-1 font-semibold capitalize text-slate-900">
                      {status}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Location
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {location || "Add a location"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Price
                    </p>
                    <p className="mt-1 font-semibold text-blue-600">
                      {price ? `FCFA ${price}` : "Set a price"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <form
                className="space-y-5 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
                onSubmit={handleSubmit}
                onReset={() => {
                  setTitle("");
                  setPrice("");
                  setLocation("");
                  setDescription("");
                  setStatus("sale");
                  setImages([]);
                  previewUrls.forEach((url) => URL.revokeObjectURL(url));
                  setPreviewUrls([]);
                  setSelectedImageIndex(0);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                <div className="rounded-[1.25rem] bg-slate-50 p-4">
                  <label className="mb-3 block text-sm font-semibold text-slate-900">
                    Listing type
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setStatus("sale")}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                        status === "sale"
                          ? "border-blue-500 bg-blue-600 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      🏷️ For Sale
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("rent")}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                        status === "rent"
                          ? "border-blue-500 bg-blue-600 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      📅 For Rent
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">
                    Property title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Modern 3-bedroom apartment"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Downtown, City"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">
                      Price *
                    </label>
                    <div className="relative flex">
                      <span className="absolute left-4 top-3 text-sm font-semibold text-slate-500">
                        F
                      </span>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="250000"
                        className="w-full rounded-2xl border border-slate-200 bg-white pl-8 pr-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the space, features, and what makes it special..."
                    className="min-h-[150px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid gap-3 rounded-[1.25rem] bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <FaImage className="text-blue-500" />
                    <span>High quality images</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaHouse className="text-blue-500" />
                    <span>Clear property details</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-blue-500" />
                    <span>Faster inquiries</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    disabled={uploading}
                    type="submit"
                    className="flex-1 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {uploading ? "Uploading..." : "Submit listing"}
                  </button>
                  <button
                    type="reset"
                    className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AddProp;
