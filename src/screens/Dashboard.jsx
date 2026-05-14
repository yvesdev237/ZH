import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/Navbar'

const Dashboard = () => {
  return (
    <div className='w-full min-h-screen'>
        <main>
            <Outlet/>
        </main>
        <Navbar />
    </div>
  )
}

export default Dashboard