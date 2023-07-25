"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Avatar, Paper } from '@mui/material'
import { BsCalendar, BsGraphUp, BsPencil } from 'react-icons/bs'
import { BiDumbbell} from 'react-icons/bi'
import axios from 'axios'
import Pagenav from '../components/Pagenav'

export default function Home() {
    const [loading, setLoading] = useState(true)
    const [current, setCurrent] = useState(null)
    const [programs, setPrograms] = useState([])

    useEffect(()=>{
        axios.get('/api/user')
        .then(res=>{
          setLoading(false)
          setPrograms(res.data.documents[0].programs)
          const currentIndex = res.data.documents[0].currentProgram
          setCurrent(res.data.documents[0].programs[currentIndex])
        })
        .catch(err=>{
          console.error(err.message)
        })
    },[])

    if(loading)
    {
        return (
            <></>
        )
    }

    return (
        <main className="flex min-h-screen flex-col items-center py-6 lg:pt-12 px-2 lg:p-12 gap-4">
        <p>Current Program: {current.names}</p>
            <div className='w-full lg:w-1/2 flex-col gap-2 items-center border border-gray-300 rounded-lg bg-stone-50 px-4 py-1'>
            <div className='flex justify-between items-center'>
                <p className='font-semibold text-lg'>Today's Workout</p>
                <button className='border border-gray-300 py-1 px-3 rounded-full mr-0 ml-auto my-2 flex items-center text-gray-500'>Edit &nbsp;<BsPencil /></button>    
            </div>
            <hr className='my-1' />
            <div>Back</div>
            <div className='text-sm border border-gray-300 rounded-md px-2 py-1 mt-2'>
            </div>   
            </div>
            <Pagenav page='workouts' />
        </main>
    )
}
