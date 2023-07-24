"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Avatar, Paper } from '@mui/material'
import { BsCalendar, BsGraphUp, BsPencil } from 'react-icons/bs'
import { BiDumbbell} from 'react-icons/bi'

export default function Home() {
  const [streak, setStreak] = useState(0)
  const [day, setDay] = useState(0)
  const [week, setWeek] = useState(['S', 'M', 'T', 'W', 'R', 'F', 'S'])

  useEffect(()=>{
    setDay(new Date().getDay())
  },[])

  useEffect(()=>{
    if(day > 0)
    {
      const weekTemp = [...week]
      const reorderWeek = [weekTemp.slice(day), weekTemp.slice(0,day)]
      const newWeek = reorderWeek[0].concat(reorderWeek[1])
      setWeek(newWeek)
    }
  },[day])

  return (
    <main className="flex min-h-screen flex-col items-center py-6 lg:pt-12 px-2 lg:p-12 gap-4">
      <div className='flex items-center justify-between w-full gap-3 lg:w-1/2'>
        <Avatar>JP</Avatar>
        <div className='w-full border border-gray-300 rounded-lg bg-stone-50 px-4 py-2'>
          <div className='text-sm'>Name</div>
          <hr className='my-1'/>
          <div className='text-sm'>Goal: 160 lbs, 10.5% BF</div>
        </div>
      </div>
      <div className='w-full lg:w-1/2 flex gap-5 items-center'>
        <div className={streak > 0 ? `text-green-500` : `text-red-500`}>🔥&nbsp;{streak}</div>
        <div className='text-sm'>Best: 12</div>
      </div>
      <div className='flex lg:gap-3'>
          {week.map((day,id)=>
            <div className='border border-gray-300 rounded-lg bg-stone-50 p-2 lg:px-5' key={id}>
                <div className='text-sm text-gray-400'>
                {day}
                </div>
                <div className='text-sm'>
                  { id % 4 === 0 ?
                    <>Rest</>
                  : id % 2 === 0 ?
                    <>Back</>
                  : id % 3 === 0 ?
                    <>Legs</>
                  : 
                    <>Chest</>
                  }
                </div>
            </div>
          )}
        </div>
        <div className='w-full lg:w-1/2 flex-col gap-2 items-center border border-gray-300 rounded-lg bg-stone-50 px-4 py-1'>
          <div className='flex justify-between items-center'>
            <p className='font-semibold text-lg'>Today's Workout</p>
            <button className='border border-gray-300 py-1 px-3 rounded-full mr-0 ml-auto my-2 flex items-center text-gray-500'>Edit &nbsp;<BsPencil /></button>    
          </div>
          <hr className='my-1' />
          <div>Back</div>
          <div className='text-sm border border-gray-300 rounded-md px-2 py-1 mt-2'>
            <table className='w-full'>
              <thead>
                <tr className='text-left'>
                  <th className='p-1'>Exercise</th>
                  <th className='p-1'>Weight</th>
                  <th className='p-1'>Info</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                <tr>
                  <td className='p-1'>Weighted Pullups</td>
                  <td className='p-1'>6x35</td>
                  <td className='p-1 text-gray-400'></td>
                </tr>
                <tr>
                  <td className='p-1'>T-bar Row</td>
                  <td className='p-1'>8x90</td>
                  <td className='p-1 text-gray-500'></td>
                </tr>
                <tr>
                  <td className='p-1'>Lat Pulldown</td>
                  <td className='p-1'>10x120</td>
                  <td className='p-1 text-gray-500'>Slow up</td>
                </tr>
                <tr>
                  <td className='p-1'>DB Shrug</td>
                  <td className='p-1'>12x65</td>
                  <td className='p-1 text-gray-500'>10 sec hold</td>
                </tr>
                <tr>
                  <td className='p-1'>Preacher Curl</td>
                  <td className='p-1'>6x65</td>
                  <td className='p-1 text-gray-500'></td>
                </tr>
                <tr>
                  <td className='p-1'>Incline DB Curl</td>
                  <td className='p-1'>12x20</td>
                  <td className='p-1 text-gray-500'></td>
                </tr>
              </tbody>
            </table>
          </div>
          <button className='block shadow-md py-2 px-5 rounded-full bg-green-700 hover:bg-opacity-70 text-white mr-0 ml-auto my-2'>Start Workout</button>    
        </div>
        <div className='w-full lg:w-1/2 flex justify-between items-center gap-3 px-2'>
          <div className='shadow-md rounded-lg w-full bg-zinc-500 px-4 py-2 text-white'>
            <BsGraphUp />
            <p className='text-sm mt-2'>Stats</p>
          </div>
          <div className='shadow-md rounded-lg w-full bg-zinc-500 px-4 py-2 text-white'>
            <BiDumbbell />
            <p className='text-sm mt-2'>Workouts</p>
          </div>
          <div className='shadow-md rounded-lg w-full bg-zinc-500 px-4 py-2 text-white'>
            <BsCalendar />
            <p className='text-sm mt-2'>Schedule</p>
          </div>
        </div>
    </main>
  )
}
