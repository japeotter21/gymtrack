"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Avatar, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
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
  const [editing, setEditing] = useState(null)
  const [editReps, setEditReps] = useState(0)
  const [editWeight, setEditWeight] = useState(0)
  const [editNotes, setEditNotes] = useState('')

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
  
  useEffect(()=>{
    if(editing !== null)
    {
        setEditReps(exercises[editing].target.reps)
        setEditWeight(exercises[editing].target.weight)
        setEditNotes(exercises[editing].target.notes)
    }
  },[editing])

  // useEffect(()=>{
  //   if(day > 0)
  //   {
  //     const weekTemp = [...week]
  //     const reorderWeek = [weekTemp.slice(day), weekTemp.slice(0,day)]
  //     const newWeek = reorderWeek[0].concat(reorderWeek[1])
  //     setWeek(newWeek)
  //   }
  // },[day])
  
  function HandleClose() {
    setEditReps(0)
    setEditWeight(0)
    setEditNotes('')
    setEditing(null)
  }

  function HandleEdit() {
    const postObj = {
        reps: parseInt(editReps),
        weight: parseInt(editWeight),
        notes: editNotes,
        reminder: ""
    }
    axios.post('/api/exercise',postObj,{ params: {id: editing, user:profile.username}})
    .then(res=>{
      axios.get('/api/user')
      .then(r=>{
          setExercises(r.data.documents[0].exercises)
          HandleClose()
      })
    })
  }

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
      <p className='text-xl font-semibold'>Current Program: {currentProgram.name}</p>
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
          <div className='flex items-baseline'>
            <p className='text-gray-600 text-lg my-2'>Today's Workout: &nbsp;</p>
            <p className='font-semibold text-lg my-2'>{currentWorkout.name}</p>
            {/* <button
              className='border border-gray-300 py-1 px-3 rounded-full mr-0 ml-auto my-2 flex items-center text-gray-500 hover:bg-gray-100 hover:scale-105 transition duration-300'>
                Edit &nbsp;<BsPencil />
            </button>     */}
          </div>
          <div className='border border-gray-300 rounded-md pt-1 mt-2'>
              <div className='text-sm font-semibold grid grid-cols-4'>
                  <div className='p-2'>Exercise</div>
                  <div className='p-2'>Reps</div>
                  <div className='p-2'>Weight</div>
                  <div className='p-2'>Info</div>
              </div>
              { currentWorkout.exercises.map((item,id)=>
                  <div className='text-sm grid grid-cols-4 hover:cursor-pointer hover:bg-slate-200 hover:bg-opacity-40 transition duration-200' key={id} onClick={()=>setEditing(item)}>
                      <div className='p-2 border-t-2'>{exercises[item].name}</div>
                      <div className='p-2 border-t-2'>{exercises[item].target.reps}</div>
                      <div className='p-2 border-t-2'>{exercises[item].target.weight}</div>
                      <div className='p-2 text-gray-400 border-t-2'>{exercises[item].target.notes}</div>
                  </div>
              )}
          </div>
          <button className='block shadow-md py-2 px-5 rounded-full bg-green-700 hover:bg-opacity-80 text-white mr-0 ml-auto my-2 hover:scale-105 transition duration-300'
            
          >Start Workout</button>    
        </div>
        <Pagenav page='home' />
        { exercises.length > 0 && editing !== null ? 
          <Dialog open={editing !== null} onClose={HandleClose} maxWidth="sm" fullWidth>
            <p className='font-semibold text-lg px-3 py-3'>{exercises[editing].name}</p>
            <div className='grid grid-cols-2 px-3 py-3 gap-3'>
              <p className='text-md'>Reps</p>
              <input className='text-md border rounded-lg w-full py-1 px-2' value={editReps}
                onChange={(e)=>setEditReps(e.target.value)}
              />
              <p className='text-md'>Weight (lbs)</p>
              <input className='text-md border rounded-lg w-full py-1 px-2' value={editWeight}
                onChange={(e)=>setEditWeight(e.target.value)}
              />
              <p className='text-md'>Notes</p>
              <input className='text-md border rounded-lg w-full py-1 px-2' value={editNotes}
                onChange={(e)=>setEditNotes(e.target.value)}
              />
            </div>
            <div className='flex justify-end px-3 py-3 gap-3'>
                <button className='border border-gray-400 py-1 px-3 rounded-xl hover:bg-red-100 hover:border-red-200 hover:text-red-500 hover:scale-105 transition duration-200'
                  onClick={HandleClose}
                >Cancel</button>
                <button className='block shadow-md py-1 px-3 rounded-xl bg-green-700 hover:bg-opacity-80 text-white hover:scale-105 transition duration-200'
                  onClick={HandleEdit}
                >Update</button>
            </div>
          </Dialog>
          :
          <></>
        }
    </main>
  )
}
