import React, { useState , useEffect, useRef} from 'react'
import { toast } from 'react-hot-toast';
import { db } from '../services/database';
import { useAuth } from '../context/UseAuth';

const AddProp = () => {
  const [title , setTitle] = useState('')
  const [price , setPrice] = useState("")
  const [location , setLocation] = useState("")
  const [description , setDescription] = useState("")
  const [images , setImages] = useState([])
  const [previewUrls , setPreviewUrls] = useState([])
  const [status , setStatus] = useState('')
  const [uploading , setUploading] = useState(false)
  const {user} = useAuth()
  const fileInputRef = useRef(null)

  //HANDLE IMAGE UPLOAD
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error("You can upload a maximum of 5 images.");
      return;
    }
    const validFiles = files.filter(file => file.type.startsWith('image/'));

    setImages(validFiles);

    const previewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(previewUrls);
  }

  //CLEANUP PREVIEW URLS TO AVOID MEMORY LEAKS
  useEffect(() => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
  } , [previewUrls])

  //UPLOAD IMAGES
  const uploadImages = async () => {
    const uploadPromises = images.map(async (image) => {
      const fileName = `${Date.now()}-${image.name}`;
      const {error} = await db.storage.from('property-images').upload(fileName , image);
      if (error) {
        toast.error(`Failed to upload ${image.name}`);
        return null;
      }
      const {data} = db.storage.from('listing-images').getPublicUrl(fileName);
      return data.publicUrl;
    })

    const results = await Promise.all(uploadPromises);
    return results.filter(url => url !== null);
  }

  //IMAGE SUBMISSION LOGIC
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !price || !location || !description || !status) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (images.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }
    if(!user) {
      toast.error("You must be logged in to add a property.");
      return;
    }
      console.log("user" , user)
    setUploading(true);

    //listing creation logic
    const {data: listingsData , error: listingsError} = await db.from('listings').insert([{
      title,
      price: parseFloat(price),
      location,
      description,
      status,
      user_id: user.id
    }]).select();

    if (listingsError) {
      console.error("Error creating listing:", listingsError);
      setUploading(false);
      return;
    }

    const listingId = listingsData[0].id;

    //upload images and get URLs
    const imageUrls = await uploadImages();

    //save images
    if (imageUrls.length > 0) {
      const imageRecords = imageUrls.map(url => ({ listing_id: listingId, image_url: url }));
      const {error: imagesError} = await db.from('listing_images').insert(imageRecords);
      if (imagesError) {
        console.error("Error saving image URLs:", imagesError);
      }
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-white overflow-y-auto pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className='text-3xl font-bold text-gray-900'>Add New Property</h1>
          <p className='text-gray-600 mt-1'>Fill in the details below to list your property</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Image Upload & Preview */}
          <div className='lg:col-span-1'>
            <div className='sticky top-24 space-y-6'>
              {/* Upload Card */}
              <div onClick={() => fileInputRef.current?.click()} className='bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer group'>
                <input ref={fileInputRef} type="file" accept='image/*' multiple onChange={handleImageChange} className='hidden' />
                <div className='text-center'>
                  <div className='inline-block p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors mb-4'>
                    <p className='text-4xl'>📸</p>
                  </div>
                  <h3 className='font-semibold text-gray-900 mb-1'>Upload Photo</h3>
                  <p className='text-sm text-gray-600'>Drag and drop or click to browse</p>
                </div>
              </div>

              {/* Property Preview */}
              <div className='bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm'>
                <div className='bg-linear-to-br from-gray-200 to-gray-300 h-40 flex items-center justify-center'>
                  <p className='text-gray-400 text-5xl'>🏠</p>
                </div>
                <div className='p-5 space-y-3'>
                  <div>
                    <p className='text-xs text-gray-500 uppercase tracking-wide'>Status</p>
                    <p className='text-sm font-semibold text-gray-900'>For Sale</p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500 uppercase tracking-wide'>Location</p>
                    <p className='text-sm font-semibold text-gray-900'>Your Location</p>
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-blue-600'>${price}</p>
                    <p className='text-xs text-gray-500'>{status === "rent" ? "per month" : ""}</p>
                  </div>
                </div>
              </div>

              {/* Info Boxes */}
              <div className='space-y-3'>
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <p className='text-sm font-semibold text-gray-900'>✓ High Quality Images</p>
                  <p className='text-xs text-gray-600 mt-1'>Clear, well-lit photos attract more buyers</p>
                </div>
                <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                  <p className='text-sm font-semibold text-gray-900'>✓ Detailed Description</p>
                  <p className='text-xs text-gray-600 mt-1'>More details = more inquiries</p>
                </div>
                <div className='bg-purple-50 border border-purple-200 rounded-lg p-4'>
                  <p className='text-sm font-semibold text-gray-900'>✓ Accurate Pricing</p>
                  <p className='text-xs text-gray-600 mt-1'>Competitive prices get faster results</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className='lg:col-span-2'>
            <form className='space-y-6' onSubmit={handleSubmit}>
              {/* Property Status Toggle */}
              <div>
                <label className='block text-sm font-semibold text-gray-900 mb-3'>Property Status *</label>
                <div className='flex gap-3'>
                  <button 
                  type="button"
                  onClick={() => setStatus("sale")}
                    className={` ${status === "sale" ? 'bg-blue-400' : 'bg-white'} flex-1 px-4 py-3 rounded-lg border border-blue-500  text-blue-700 font-semibold transition-all`}
                  >
                    🏷️ For Sale
                  </button>
                  <button 
                  type="button"
                  onClick={() => setStatus("rent")}
                    className={` ${status === "rent" ? 'bg-blue-400' : 'bg-white'} flex-1 px-4 py-3 rounded-lg border-2 border-gray-200  text-gray-700 font-semibold hover:border-gray-300 transition-all`}
                  >
                    📅 For Rent
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className='block text-sm font-semibold text-gray-900 mb-2'>Property Title *</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='Modern 3-Bedroom Apartment' 
                  className='w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                />
              </div>

              {/* Location and Price */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-semibold text-gray-900 mb-2'>Location *</label>
                  <input 
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder='Downtown, City' 
                    className='w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                  />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-gray-900 mb-2'>Price *</label>
                  <div className='relative gap-3 flex'>
                    <span className='absolute left-4 top-3 text-gray-600 font-semibold'>F</span>
                    <input 
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder='250000' 
                      className='w-full flex-1 pl-8 pr-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className='block text-sm font-semibold text-gray-900 mb-2'>Description *</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Describe your property in detail including amenities, features, condition...' 
                  className='w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none'
                  rows={6}
                />
              </div>

              {/* Divider */}
              <hr className='border-gray-200' />

              {/* Action Buttons */}
              <div className='flex gap-3 pt-4'>
                <button 
                disabled = {uploading}
                  type='submit' 
                  className='flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm'
                >
                  {uploading ? "Uploading..." : "Submit Listing"}
                </button>
                <button 
                  type='reset' 
                  className='px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors'
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}

export default AddProp