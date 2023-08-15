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
import { HiChevronUpDown } from 'react-icons/hi2'
import { inProgressObj, repConstant, setConstant } from '@/globals'
import AppContext from './AppContext'
import { redirect, useRouter } from 'next/navigation'
import { FinishWorkout } from '@/services/services'

export default function Home() {
  const [day, setDay] = useState(0)
  const [profile, setProfile] = useState({})
  const [loading, setLoading] = useState(true)
  const [currentProgram, setCurrentProgram] = useState(null)
  const [currentWorkout, setCurrentWorkout] = useState(null)
  const [currentWorkoutIndex, setCurrentWorkoutIndex] = useState(0)
  const [currentDay, setCurrentDay] = useState(0)
  const [workouts, setWorkouts] = useState([])
  const [exercises, setExercises] = useState([])
  const [editing, setEditing] = useState(null)
  const [editSets, setEditSets] = useState(0)
  const [editReps, setEditReps] = useState(0)
  const [editWeight, setEditWeight] = useState(0)
  const [editNotes, setEditNotes] = useState('')
  const [updating, setUpdating] = useState(false)
  const [changeDay, setChangeDay] = useState(false)
  const [inProgress, setInProgress] = useState(null)
  const {activeUser} = useContext(AppContext)
  const router = useRouter()
  useEffect(()=>{
    if (activeUser)
    {
      setDay(new Date().getDay())
      const endpoints = ['/api/user', '/api/exercise', '/api/workouts']
      axios.all(endpoints.map((endpoint) => axios.get(endpoint, { params: {user:activeUser}}))).then(
        axios.spread((user, exercise, workout) => {
          setProfile(user.data.profile)
          setExercises(exercise.data.exercises)
          const currentIndex = workout.data.currentProgram
          setCurrentProgram(workout.data.programs[currentIndex])
          const dayIndex = workout.data.currentDay
          const workoutIndex = workout.data.programs[currentIndex].schedule[dayIndex]
          setWorkouts(workout.data.workouts)
          setCurrentWorkoutIndex(workoutIndex)
          setCurrentWorkout(workout.data.workouts[workoutIndex])
          const inProgressArr = workout.data.inProgress.results
          const progressCheck = []
          inProgressArr.forEach((item,id)=>item.rpe > 0 ? progressCheck.push(true) : progressCheck.push(false))
          setInProgress(progressCheck.includes(true))
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
        setEditReps(exercises[editing].target.sets[0].reps)
        setEditWeight(exercises[editing].target.sets[0].weight)
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
    let newPostArr = Array.from({length: newSets}, x=>0)
    newPostArr.forEach((item,id)=>newPostArr[id]={reps:newReps, weight:newWeight})
    const postObj = {
        sets: newPostArr,
        notes: editNotes,
        reminder: ""
    }
    setUpdating(true)
    axios.post('/api/exercise',postObj,{ params: {exercise: editing, user:activeUser, workout:currentWorkoutIndex}})
    .then(res=>{
      axios.get('/api/exercise',{ params: { user:activeUser }})
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
      axios.post('/api/workouts',postObj, {params:{workout: currentWorkoutIndex, user:activeUser}})
      .then(res=>{
        axios.get('/api/workouts', { params: {user:activeUser}})
        .then(r=>{
            const currentIndex = r.data.currentProgram
            const dayIndex = r.data.currentDay
            const workoutIndex = r.data.programs[currentIndex].schedule[dayIndex]
            setCurrentWorkout(r.data.workouts[workoutIndex])
        })
      })
  }

  function UpdateCurrentDay() {
    const postObj = {newDay: currentDay}
    const resultsLength = Array.from({length:currentWorkout.exercises.length},x=>inProgressObj)
    axios.post('api/start',resultsLength,{params: {user:activeUser, name:currentWorkout.name}})
    axios.put('/api/workouts', postObj, { params: {user:activeUser}})
    .then(r=>{
      axios.get('/api/workouts', { params: {user:activeUser}})
        .then(res=>{
            const dayIndex = res.data.currentDay
            const currentIndex = res.data.currentProgram
            const workoutIndex = res.data.programs[currentIndex].schedule[dayIndex]
            setCurrentDay(dayIndex)
            setCurrentWorkout(res.data.workouts[workoutIndex])
            setChangeDay(false)
        })
    })
  }

  function CompleteWorkout() {
    let dayNum = 0 
    if (currentDay !== currentProgram.schedule.length - 1)
    {
        dayNum = currentDay + 1
    }
    FinishWorkout(dayNum, activeUser, true, null)
    .then(r=>{
        axios.get('/api/workouts', { params: {user:activeUser}})
        .then(res=>{
            const dayIndex = res.data.currentDay
            const currentIndex = res.data.currentProgram
            const workoutIndex = res.data.programs[currentIndex].schedule[dayIndex]
            setCurrentDay(dayIndex)
            setCurrentWorkout(res.data.workouts[workoutIndex])
        })
    })
  }

  const getListStyle = isDraggingOver => ({
      boxShadow: isDraggingOver ? '0 0 10px 2px #2997ff55' : 'none',
      padding: 0,
      width: '100%',
      minHeight: 50
  })
  const getItemStyle = (isDragging, draggableStyle) => ({
      userSelect: 'none',
      ...draggableStyle
  })

  function StartWorkout() {
      router.prefetch('workout')
      if(inProgress)
      {
        router.push('/workout')
      }
      else
      {
        const resultsLength = Array.from({length:currentWorkout.exercises.length},x=>inProgressObj)
        axios.post('api/start',resultsLength,{params: {user:activeUser, name:currentWorkout.name}})
        .then(res=>{
            router.push('/workout')
        })
      }
  }

  if(loading)
  {
    return (
      <></>
    )
  }
  
  return (
    <main className="flex min-h-screen flex-col items-center py-6 px-2 gap-1">
      
      <div className='w-full lg:w-1/2 flex-col gap-2 items-center'>
        <div className='flex items-baseline'>
          <p className='text-gray-600 text-lg my-2'>Today's Workout:&nbsp;</p>
          <p className='font-semibold text-lg my-2'>{currentWorkout.name}</p>
          <button className='text-xs px-2 py-0.5 rounded-md ml-1 text-sky-600'
            onClick={()=>setChangeDay(true)}
          >Change</button>
        </div>
        <p className='text-sm text-gray-600'>from {currentProgram.name}</p>
        <div className='border border-gray-300 rounded-md pt-1 mt-4 mb-4 bg-stone-50 shadow-lg cursor-pointer'>
            <div className='text-sm font-semibold grid grid-cols-7 border-b-2'>
                <div className='p-2 col-span-3 ml-[12px]'>Exercise</div>
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
                                ><HiChevronUpDown size={18} className='absolute ml-[-8px] text-gray-500' /><span className='ml-[12px]'>{exercises[item].name}</span></div>
                                <div className='p-2' onClick={()=>setEditing(item)}>{exercises[item].target.sets.length}</div>
                                <div className='p-2' onClick={()=>setEditing(item)}>{exercises[item].target.sets[0].reps}</div>
                                <div className='p-2' onClick={()=>setEditing(item)}>{exercises[item].target.sets[0].weight}</div>
                                <DeleteExercise currentWorkout={currentWorkout} currentWorkoutIndex={currentWorkoutIndex} setCurrentWorkout={setCurrentWorkout}
                                  username={activeUser} item={item} id={id} homepage={true} exercises={exercises}
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
              username={activeUser} exercises={exercises} homepage={true} setCurrentWorkoutIndex={setCurrentWorkoutIndex}
            />
        </div>
        { currentWorkout ?
            currentWorkout.exercises.length > 0 ?
                <button onClick={StartWorkout}
                  className='w-full lg:w-[10vw] shadow-md py-3 my-4 lg:my-2 mx-auto lg:ml-auto lg:mr-0 block px-5 rounded-full bg-green-600 lg:hover:bg-opacity-80
                    text-white lg:hover:scale-105 transition duration-300'
                  
                >Start Workout</button>    
            :
              <button onClick={CompleteWorkout}
                className='w-full lg:w-[10vw] shadow-md py-3 my-4 lg:my-2 mx-auto lg:ml-auto lg:mr-0 block px-5 rounded-full bg-green-600 lg:hover:bg-opacity-80
                  text-white lg:hover:scale-105 transition duration-300'
                
              >Complete Workout</button>  
          :
          <></>
        }
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
      <Dialog open={changeDay} onClose={()=>setChangeDay(false)} maxWidth="sm" fullWidth>
        <div className='px-4 py-2'>
          <p className='font-semibold text-lg py-2'>Change Workout</p>
            { currentProgram && workouts.length > 0 ? 
              <>
                <p>Name</p>
                <select value={currentDay} className='text-md border rounded-lg w-full py-1 px-2' onChange={(e)=>setCurrentDay(e.target.value)}>
                    { currentProgram.schedule.map((index,i)=>
                        <option key={i} value={i}>{workouts[index].name}</option>
                    )}
                </select>
              </>
              :
              <></>
            }
          <div className='flex justify-between mt-4'>
            <button className='shadow-md border border-neutral-500 rounded-md py-1 px-3'
              onClick={()=>setChangeDay(false)}
            >Cancel</button>
            { updating ?
              <button disabled className='shadow-md bg-green-600 text-white rounded-md py-1 px-4'
              >Saving...
              </button>
            :
              <button className='shadow-md bg-green-600 text-white rounded-md py-1 px-4'
                onClick={UpdateCurrentDay}
              >Save
              </button>
            }
            
          </div>
        </div>
      </Dialog>
    </main>
  )
}
