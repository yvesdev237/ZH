import React from 'react'
import { SearchbarProps } from '../components/Searchbar'
import toast from 'react-hot-toast'
import { CardProps } from '../components/Cards'

const Explore = () => {
  return (
    <main className='min-h-screen w-full p-2 flex flex-col pb-20'>
      <h1 className="text-2xl text-gray-500 capitalize text-left w-full p-2 font-medium">
        discover <br />
        <span className="text-blue-500">properties</span>
      </h1>
      <SearchbarProps  />
      <div className="w-full flex gap-2 items-start justify-start p-4">
        <button className='rounded-2xl bg-blue-400 p-1.5 w-20 text-white' onClick={() => {
          toast.error('coming soon...')
        }}>
          All
        </button>
        <button className='rounded-2xl bg-blue-400 p-1.5 w-20 text-white' onClick={() => {
          toast.error('coming soon...')
        }}>
          For Sale
        </button>
        <button className='rounded-2xl bg-blue-400 p-1.5 w-20 text-white' onClick={() => {
          toast.error('coming soon...')
        }}>
          For Rent
        </button>
      </div>
      <section className="w-full p-1 flex-1 flex flex-col">
        <h2 className="text-xl text-gray-500 capitalize text-left w-full p-2 font-medium">
          listed Properties (0)
        </h2>
        <div className="w-full h-full flex items-start overflow-y-auto flex-col gap-5">
          <CardProps />
          <CardProps />
          <CardProps />
          <CardProps />
          <CardProps />
        </div>
      </section>
    </main>
  )
}

export default Explore