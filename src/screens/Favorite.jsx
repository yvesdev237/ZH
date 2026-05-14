import React from 'react'
import { CardLists } from '../components/Cards'

const Favorite = () => {
  return (
    <main className='min-h-screen w-full p-2 flex flex-col pb-20'>
      <h1 className="text-2xl text-blue-500 capitalize text-left w-full p-2 font-medium">
        My Favorites 
      </h1>
      <div className="w-full ring ring-gray-500 opacity-50"></div>
      <h4 className="text-lg text-gray-600 font-semibold mt-4 text-center">Your favorite properties will appear here  </h4>
      <div className="w-full h-full flex items-start flex-col mt-10 overflow-auto">
        <CardLists />
        <CardLists />
        <CardLists /> 
      </div>
    </main>
  )
}

export default Favorite