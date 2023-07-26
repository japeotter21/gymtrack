"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Avatar, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { BsPencil } from 'react-icons/bs'
import axios from 'axios'
import Pagenav from './components/Pagenav'
import Link from 'next/link'

export default function Home() {
  const [day, setDay] = useState(0)
  const [week, setWeek] = useState(['S', 'M', 'T', 'W', 'R', 'F', 'S'])
  const [profile, setProfile] = useState({})
  const [loading, setLoading] = useState(true)
  const [currentProgram, setCurrentProgram] = useState(null)
  const [currentWorkout, setCurrentWorkout] = useState(null)
  const [currentWorkoutIndex, setCurrentWorkoutIndex] = useState(0)
  const [currentDay, setCurrentDay] = useState(0)
  const [programs, setPrograms] = useState([])
  const [exercises, setExercises] = useState([])
  const [editing, setEditing] = useState(null)
  const [editSets, setEditSets] = useState(0)
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
      setCurrentWorkoutIndex(workoutIndex)
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
        setEditSets(currentWorkout.exercises[editing].target.sets.length)
        setEditReps(currentWorkout.exercises[editing].target.sets[0][0])
        setEditWeight(currentWorkout.exercises[editing].target.sets[0][1])
        setEditNotes(currentWorkout.exercises[editing].target.notes)
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
    setEditSets(0)
    setEditReps(0)
    setEditWeight(0)
    setEditNotes('')
    setEditing(null)
  }

  function HandleEdit() {
    const newSets = parseInt(editSets)
    const newReps = parseInt(editReps)
    const newWeight = parseInt(editWeight)
    const newExObj = Array.from({length: newSets},(x)=>[newReps,newWeight])
    const postObj = {
        sets: newExObj,
        notes: editNotes,
        reminder: ""
    }
    axios.post('/api/exercise',postObj,{ params: {id: editing, user:profile.username, workout:currentWorkoutIndex}})
    .then(res=>{
      axios.get('/api/user')
      .then(r=>{
          const currentIndex = r.data.documents[0].currentProgram
          const dayIndex = r.data.documents[0].currentDay
          const workoutIndex = r.data.documents[0].programs[currentIndex].schedule[dayIndex]
          setCurrentWorkoutIndex(workoutIndex)
          setCurrentWorkout(r.data.documents[0].workouts[workoutIndex])
          HandleClose()
      })
    })
    console.log(postObj)
  }

  if(loading)
  {
    return (
      <></>
    )
  }
  
  return (
    <main className="flex min-h-screen flex-col items-center py-6 px-2 gap-1">
      <div className='w-full gap-3 lg:w-1/2'>
        <div className='flex w-full items-center gap-2 lg:gap-6'>
          <div>
            <Avatar sx={{height:60, width:60}}>{ profile.name.charAt(0)}</Avatar>
          </div>
          <div className='w-full border border-gray-300 rounded-lg bg-stone-50 px-4 py-2'>
            <div className='text-sm'>{profile.name}</div>
            <hr className='my-2'/>
            <div className='text-sm'>Goal: {profile.goal}</div>
          </div>
        </div>
      </div>
      <div className='w-full flex gap-2 items-baseline justify-start mt-1'>
        <div className={profile.streak.current > 0 ? `text-green-500` : `text-red-500`}>🔥&nbsp;{profile.streak.current}</div>
        <div className='text-sm'>Best: {profile.streak.best}</div>
      </div>
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
        <div className='w-full lg:w-1/2 flex-col gap-2 items-center'>
          <div className='flex items-baseline'>
            <p className='text-gray-600 text-lg my-2'>Today's Workout:&nbsp;</p>
            <p className='font-semibold text-lg my-2'>{currentWorkout.name}</p>
            {/* <button
              className='border border-gray-300 py-1 px-3 rounded-full mr-0 ml-auto my-2 flex items-center text-gray-500 hover:bg-gray-100 hover:scale-105 transition duration-300'>
                Edit &nbsp;<BsPencil />
            </button>     */}
          </div>
          <p className='text-sm text-gray-600'>from {currentProgram.name}</p>
          <div className='border border-gray-300 rounded-md pt-1 mt-4 bg-stone-50'>
              <div className='text-sm font-semibold grid grid-cols-6'>
                  <div className='p-2 col-span-2'>Exercise</div>
                  <div className='p-2'>Sets</div>
                  <div className='p-2'>Reps</div>
                  <div className='p-2'>Weight</div>
                  <div className='p-2'>Info</div>
              </div>
              { currentWorkout.exercises.map((item,id)=>
                  <div className='text-sm grid grid-cols-6 lg:hover:cursor-pointer lg:hover:bg-slate-200 lg:hover:bg-opacity-40 transition duration-200' key={id} onClick={()=>setEditing(id)}>
                      <div className='p-2 border-t-2 col-span-2'>{item.name}</div>
                      <div className='p-2 border-t-2'>{item.target.sets.length}</div>
                      <div className='p-2 border-t-2'>{item.target.sets[0][0]}</div>
                      <div className='p-2 border-t-2'>{item.target.sets[0][1]}</div>
                      <div className='p-2 text-gray-400 border-t-2'>{item.target.notes}</div>
                  </div>
              )}
          </div>
          <Link href="/workout">
            <button
              className='w-11/12 lg:w-[10vw] shadow-md py-3 my-4 lg:my-2 mx-auto lg:ml-auto lg:mr-0 block px-5 rounded-full bg-green-700 hover:bg-opacity-80
                text-white hover:scale-105 transition duration-300'
              
            >Start Workout</button>    
          </Link>
        </div>
        <Pagenav page='home' />
        { currentWorkout.exercises.length > 0 && editing !== null ? 
          <Dialog open={editing !== null} onClose={HandleClose} maxWidth="sm" fullWidth>
            <p className='font-semibold text-lg px-3 py-3'>{currentWorkout.exercises[editing].name}</p>
            <div className='grid grid-cols-2 px-3 py-3 gap-3'>
              <p className='text-md'>Sets</p>
              <input className='text-md border rounded-lg w-full py-1 px-2' value={editSets}
                onChange={(e)=>setEditSets(e.target.value)}
              />
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
