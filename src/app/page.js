"use client"
import React, { useState, useEffect, useContext } from 'react'
import Image from 'next/image'
import { Avatar, Dialog } from '@mui/material'
import { BsPencil, BsThreeDotsVertical, BsTrash } from 'react-icons/bs'
import axios from 'axios'
import Pagenav from './components/Pagenav'
import Link from 'next/link'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import PostExercise from './components/EditWorkout'
import { DeleteExercise } from './components/EditWorkout'
import { RiDraggable } from 'react-icons/ri'
import { repConstant, setConstant } from '@/globals'
import AppContext from './AppContext'
import { redirect } from 'next/navigation'

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
  const [updating, setUpdating] = useState(false)
  const {activeUser} = useContext(AppContext)

  useEffect(()=>{
    if (activeUser)
    {
      setDay(new Date().getDay())
      const endpoints = ['/api/user', '/api/exercise', '/api/workouts']
      axios.all(endpoints.map((endpoint) => axios.get(endpoint))).then(
        axios.spread((user, exercise, workout) => {
          setProfile(user.data.profile)
          setExercises(exercise.data.exercises)
          setPrograms(workout.data.programs)
          const currentIndex = workout.data.currentProgram
          setCurrentProgram(workout.data.programs[currentIndex])
          const dayIndex = workout.data.currentDay
          const workoutIndex = workout.data.programs[currentIndex].schedule[dayIndex]
          setCurrentWorkoutIndex(workoutIndex)
          setCurrentWorkout(workout.data.workouts[workoutIndex])
          setCurrentDay(dayIndex)
          setLoading(false)
        })
      )
    }
    else
    {
        redirect( '/login')
    }
  },[])
  
  useEffect(()=>{
    if(editing !== null)
    {
        setEditSets(exercises[editing].target.sets.length)
        setEditReps(exercises[editing].target.sets[0][0])
        setEditWeight(exercises[editing].target.sets[0][1])
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
    setUpdating(true)
    axios.post('/api/exercise',postObj,{ params: {exercise: editing, user:profile.username, workout:currentWorkoutIndex}})
    .then(res=>{
      axios.get('/api/exercise')
      .then(r=>{
          setExercises(r.data.exercises)
          HandleClose()
          setUpdating(false)
      })
    })
  }
  
  const reorder = (list, startIndex, endIndex) => {
    const result = list
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, parseInt(removed));
    return result;
  };

  function onDragEnd(result) {
      const { source, destination } = result;
      // dropped outside the list
      if (!destination) {
        return;
      }
      //sInd: index of source group
      const sInd = source.droppableId
      const postObj = reorder(currentWorkout.exercises, source.index, destination.index);
      axios.post('/api/workouts',postObj, {params:{workout: currentWorkoutIndex, user:profile.username}})
      .then(res=>{
        axios.get('/api/workouts')
        .then(r=>{
            const currentIndex = r.data.currentProgram
            const dayIndex = r.data.currentDay
            const workoutIndex = r.data.programs[currentIndex].schedule[dayIndex]
            setCurrentWorkout(r.data.workouts[workoutIndex])
        })
      })
  }

  const getListStyle = isDraggingOver => ({
      // background: isDraggingOver && mode === 'light' ? 'linear-gradient(#2997ff55, white)' : isDraggingOver && mode === 'dark' ? 'linear-gradient(#010304, #2997ff55)' : 'none',
      boxShadow: isDraggingOver ? '0 0 10px 2px #2997ff55' : 'none',
      padding: 0,
      width: '100%',
      minHeight: 50
  })
  const getItemStyle = (isDragging, draggableStyle) => ({
      userSelect: 'none',
      ...draggableStyle
  })

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
      <div className='w-full lg:w-1/2 flex gap-2 items-baseline justify-start mt-1'>
        <div className={profile.streak.current > 0 ? 'text-green-500' : 'text-red-500'}>🔥&nbsp;{profile.streak.current}</div>
        <div className='text-sm'>Best: {profile.streak.best}</div>
      </div>
        <div className='w-full lg:w-1/2 flex-col gap-2 items-center'>
          <div className='flex items-baseline'>
            <p className='text-gray-600 text-lg my-2'>Today's Workout:&nbsp;</p>
            <p className='font-semibold text-lg my-2'>{currentWorkout.name}</p>
          </div>
          <p className='text-sm text-gray-600'>from {currentProgram.name}</p>
          <div className='border border-gray-300 rounded-md pt-1 mt-4 mb-4 bg-stone-50 shadow-lg'>
              <div className='text-sm font-semibold grid grid-cols-7 border-b-2'>
                  <div className='p-2 col-span-3 ml-[10px]'>Exercise</div>
                  <div className='p-2'>Sets</div>
                  <div className='p-2'>Reps</div>
                  <div className='p-2'>Weight</div>
              </div>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId={'drop'} key={0}>
                  {(provided, snapshot)=>(
                      <div
                          ref={provided.innerRef}
                          style={getListStyle(snapshot.isDraggingOver)}
                          {...provided.droppableProps}
                      >
                        { currentWorkout.exercises.map((item,id)=>
                          <Draggable key={exercises[item].name} draggableId={exercises[item].name} index={id}>
                            {(provided, snapshot)=>(
                                <div className='text-sm grid grid-cols-7 border border-t-0'
                                    ref={provided.innerRef}
                                    style={getItemStyle(snapshot.isDragging,
                                        provided.draggableProps.style)}
                                    {...provided.draggableProps}
                                    
                                >
                                  <div className='p-2 col-span-3 flex items-center relative'
                                  {...provided.dragHandleProps}
                                  ><RiDraggable size={16} className='absolute ml-[-10px] text-gray-500' /><span className='ml-[10px]'>{exercises[item].name}</span></div>
                                  <div className='p-2' onClick={()=>setEditing(item)}>{exercises[item].target.sets.length}</div>
                                  <div className='p-2' onClick={()=>setEditing(item)}>{exercises[item].target.sets[0][0]}</div>
                                  <div className='p-2' onClick={()=>setEditing(item)}>{exercises[item].target.sets[0][1]}</div>
                                  <DeleteExercise currentWorkout={currentWorkout} currentWorkoutIndex={currentWorkoutIndex} setCurrentWorkout={setCurrentWorkout}
                                    username={profile.username} item={item} id={id} homepage={true} exercises={exercises}
                                  />
                            </div>
                            )}
                          </Draggable>
                        )}
                        {provided.placeholder}
                      </div>
                  )}
                </Droppable>
              </DragDropContext>
              <PostExercise currentWorkout={currentWorkout} currentWorkoutIndex={currentWorkoutIndex} setCurrentWorkout={setCurrentWorkout}
                username={profile.username} exercises={exercises} homepage={true} setCurrentWorkoutIndex={setCurrentWorkoutIndex}
              />
          </div>
          <Link href="/workout">
            <button
              className='w-11/12 lg:w-[10vw] shadow-md py-3 my-4 lg:my-2 mx-auto lg:ml-auto lg:mr-0 block px-5 rounded-full bg-green-700 hover:bg-opacity-80
                text-white hover:scale-105 transition duration-300'
              
            >Start Workout</button>    
          </Link>
        </div>
        <Pagenav page='home' />
        { exercises.length > 0 && editing !== null ? 
          <Dialog open={editing !== null} onClose={HandleClose} maxWidth="sm" fullWidth>
            <p className='font-semibold text-lg px-3 py-3'>{exercises[editing].name}</p>
            <div className='grid grid-cols-2 px-3 py-3 gap-3'>
              <p className='text-md'>Sets</p>
              <select className='text-md border rounded-lg w-full py-1 px-2' value={editSets}
                onChange={(e)=>setEditSets(e.target.value)}
              >
                {setConstant.map((num,setNum)=>
                    <option value={num} key={setNum}>{num}</option>
                )}
              </select>
              <p className='text-md'>Reps</p>
              <select className='text-md border rounded-lg w-full py-1 px-2' value={editReps}
                onChange={(e)=>setEditReps(e.target.value)}
              >
                {repConstant.map((num,setNum)=>
                    <option value={num} key={setNum}>{num}</option>
                )}
              </select>
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
                { updating ? 
                  <button className='block shadow-md py-1 px-3 rounded-xl bg-green-700 bg-opacity-60 text-gray-200 hover:scale-105 transition duration-200'
                    disabled
                  >Updating...</button>
                :
                  <button className='block shadow-md py-1 px-3 rounded-xl bg-green-700 hover:bg-opacity-80 text-white hover:scale-105 transition duration-200'
                    onClick={HandleEdit}
                  >Update</button>
                }
                
            </div>
          </Dialog>
          :
          <></>
        }
    </main>
  )
}
