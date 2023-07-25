"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Avatar, Paper } from '@mui/material'
import { BsPencil } from 'react-icons/bs'
import axios from 'axios'
import Pagenav from './components/Pagenav'

export default function Home() {
  const [day, setDay] = useState(0)
  const [week, setWeek] = useState(['S', 'M', 'T', 'W', 'R', 'F', 'S'])
  const [profile, setProfile] = useState({})
  const [loading, setLoading] = useState(true)
  const [currentProgram, setCurrentProgram] = useState(null)
  const [currentWorkout, setCurrentWorkout] = useState(null)
  const [currentDay, setCurrentDay] = useState(0)
  const [programs, setPrograms] = useState([])
  const [exercises, setExercises] = useState([])

  useEffect(()=>{
    setDay(new Date().getDay())
    axios.get('/api/user')
    .then(res=>{
      setProfile(res.data.documents[0].profile)
      setLoading(false)
      setPrograms(res.data.documents[0].programs)
      const currentIndex = res.data.documents[0].currentProgram
      setCurrentProgram(res.data.documents[0].programs[currentIndex])
      const dayIndex = res.data.documents[0].currentDay
      const workoutIndex = res.data.documents[0].programs[currentIndex].schedule[dayIndex]
      setCurrentWorkout(res.data.documents[0].workouts[workoutIndex])
      setCurrentDay(dayIndex)
      setExercises(res.data.documents[0].exercises)
    })
    .catch(err=>{
      console.error(err.message)
    })
  },[])
  console.log(exercises)
  // useEffect(()=>{
  //   if(day > 0)
  //   {
  //     const weekTemp = [...week]
  //     const reorderWeek = [weekTemp.slice(day), weekTemp.slice(0,day)]
  //     const newWeek = reorderWeek[0].concat(reorderWeek[1])
  //     setWeek(newWeek)
  //   }
  // },[day])
  
  if(loading)
  {
    return (
      <></>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-6 lg:pt-12 px-2 lg:p-12 gap-4">
      <div className='flex items-center justify-between w-full gap-3 lg:w-1/2'>
        <Avatar>{ profile.name.charAt(0)}</Avatar>
        <div className='w-full border border-gray-300 rounded-lg bg-stone-50 px-4 py-2'>
          <div className='text-sm'>{profile.name}</div>
          <hr className='my-1'/>
          <div className='text-sm'>Goal: {profile.goal}</div>
        </div>
      </div>
      <div className='w-full lg:w-1/2 flex gap-5 items-center'>
        <div className={profile.streak.current > 0 ? `text-green-500` : `text-red-500`}>🔥&nbsp;{profile.streak.current}</div>
        <div className='text-sm'>Best: {profile.streak.best}</div>
      </div>
      <p>Current Program: {currentProgram.name}</p>
      {/* <div className='flex lg:gap-3 gap-1 flex-nowrap w-11/12 lg:w-max overflow-auto'>
          {week.map((day,id)=>
            <div className={`border rounded-lg bg-stone-50 py-2 px-4 lg:px-5 ${id === 0 ? `border-green-500 ring ring-2 ring-inset ring-green-400 bg-green-200` : ` border-gray-300`}`} key={id}>
                <div className='text-sm text-gray-400'>
                {day}
                </div>
                <div className='text-sm'>
                  { id % 4 === 0 ?
                    <>Back</>
                  : id % 2 === 0 ?
                    <>Rest</>
                  : id % 3 === 0 ?
                    <>Chest</>
                  : 
                    <>Legs</>
                  }
                </div>
            </div>
          )}
        </div> */}
        <div className='w-full lg:w-1/2 flex-col gap-2 items-center border border-gray-300 rounded-lg bg-stone-50 px-4 py-1'>
          <div className='flex justify-between items-center'>
            <p className='font-semibold text-lg'>Today's Workout</p>
            <button
              className='border border-gray-300 py-1 px-3 rounded-full mr-0 ml-auto my-2 flex items-center text-gray-500 hover:bg-gray-100 hover:scale-105 transition duration-300'>
                Edit &nbsp;<BsPencil />
            </button>    
          </div>
          <hr className='my-1' />
          <div>{currentWorkout.name}</div>
          <div className='text-sm border border-gray-300 rounded-md px-2 py-1 mt-2'>
            <table className='w-full'>
              <thead>
                <tr className='text-left'>
                  <th className='p-1'>Exercise</th>
                  <th className='p-1'>Reps</th>
                  <th className='p-1'>Weight</th>
                  <th className='p-1'>Info</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                { currentWorkout.exercises.map((item,id)=>
                  <tr key={id}>
                    <td className='p-1'>{exercises[item].name}</td>
                    <td className='p-1'>{exercises[item].target.reps}</td>
                    <td className='p-1'>{exercises[item].target.weight}</td>
                    <td className='p-1 text-gray-400'>{exercises[item].target.notes}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button className='block shadow-md py-2 px-5 rounded-full bg-green-700 hover:bg-opacity-80 text-white mr-0 ml-auto my-2 hover:scale-105 transition duration-300'
            
          >Start Workout</button>    
        </div>
        <Pagenav page='home' />
    </main>
  )
}
