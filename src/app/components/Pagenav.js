import React, { useState, useEffect } from 'react'
import { BsCalendar, BsGraphUp, BsHouse, BsPencil, BsPerson } from 'react-icons/bs'
import { BiDumbbell} from 'react-icons/bi'
import { useRouter } from 'next/navigation';

export default function Pagenav({page}) {
        const router = useRouter()

        useEffect(()=>{
            router.prefetch('/')
            router.prefetch('/stats')
            router.prefetch('/workouts')
        },[router])

        function Navigate(destination)
        {
            router.push(destination)
        }

        return (
            <div
                className='w-full lg:w-1/2 flex justify-between items-center gap-3 px-2'>
                {page === 'stats' ?
                    <div
                        className='cursor-pointer hover:scale-105 hover:bg-opacity-80 transition duration-300 shadow-md rounded-lg w-full bg-green-700 px-4 py-3 text-white'
                        onClick={()=>Navigate('/')}
                    >
                        <BsHouse />
                        <p className='text-sm mt-2'>Home</p>
                    </div>
                :
                    <div
                        className='cursor-pointer hover:scale-105 hover:bg-opacity-80 transition duration-300 shadow-md rounded-lg w-full bg-zinc-500 px-4 py-3 text-white'
                        onClick={()=>Navigate('/stats')}
                    >
                        <BsGraphUp />
                        <p className='text-sm mt-2'>Stats</p>
                    </div>
                }
                {page === 'workouts' ?
                    <div
                        className='cursor-pointer hover:scale-105 hover:bg-opacity-80 transition duration-300 shadow-md rounded-lg w-full bg-green-700 px-4 py-3 text-white'
                        onClick={()=>Navigate('/')}
                    >
                        <BsHouse />
                        <p className='text-sm mt-2'>Home</p>
                    </div>
                :
                    <div
                        className='cursor-pointer hover:scale-105 hover:bg-opacity-80 transition duration-300 shadow-md rounded-lg w-full bg-zinc-500 px-4 py-3 text-white'
                        onClick={()=>Navigate('/workouts')}
                    >
                        <BiDumbbell />
                        <p className='text-sm mt-2'>Workouts</p>
                    </div>
                }
                {page === 'history' ?
                    <div
                        className='cursor-pointer hover:scale-105 hover:bg-opacity-80 transition duration-300 shadow-md rounded-lg w-full bg-green-700 px-4 py-3 text-white'
                        onClick={()=>Navigate('/')}
                    >
                        <BsHouse />
                        <p className='text-sm mt-2'>Home</p>
                    </div>
                :
                    <div
                        className='cursor-pointer hover:scale-105 hover:bg-opacity-80 transition duration-300 shadow-md rounded-lg w-full bg-zinc-500 px-4 py-3 text-white'
                        onClick={()=>Navigate('/history')}
                    >
                        <BsCalendar />
                        <p className='text-sm mt-2'>History</p>
                    </div>
                }
                {page === 'profile' ?
                    <div
                        className='cursor-pointer hover:scale-105 hover:bg-opacity-80 transition duration-300 shadow-md rounded-lg w-full bg-green-700 px-4 py-3 text-white'
                        onClick={()=>Navigate('/')}
                    >
                        <BsHouse />
                        <p className='text-sm mt-2'>Home</p>
                    </div>
                :
                    <div
                        className='cursor-pointer hover:scale-105 hover:bg-opacity-80 transition duration-300 shadow-md rounded-lg w-full bg-zinc-500 px-4 py-3 text-white'
                        onClick={()=>Navigate('/profile')}
                    >
                        <BsPerson />
                        <p className='text-sm mt-2'>Profile</p>
                    </div>
                }
            </div>
        )
}