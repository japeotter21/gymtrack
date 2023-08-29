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
import { HiChevronUpDown, HiLink } from 'react-icons/hi2'
import { CiDumbbell } from 'react-icons/ci'
import { inProgressObj, repConstant, setConstant } from '@/globals'
import AppContext from './AppContext'
import { redirect, useRouter } from 'next/navigation'
import { FinishWorkout } from '@/services/services'
import LiveButton from './components/LiveButton'
import StartButton from './components/StartButton'
import DialogButton from './components/DialogButton'
import { BiDumbbell } from 'react-icons/bi'
import GroupExercises from './components/GroupExercises'

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
  const [editSS, setEditSS] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [changeDay, setChangeDay] = useState(false)
  const [inProgress, setInProgress] = useState(null)
  const [starting, setStarting] = useState(false)
  const [superset, setSuperset] = useState('')
  const [currentSS, setCurrentSS] = useState([])

  const {activeUser, Refresh} = useContext(AppContext)
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
      Refresh()
    }
  },[activeUser])
  
  useEffect(()=>{
    if(editing !== null)
    {
        setEditSets(exercises[editing].target?.sets?.length || 0)
        setEditReps(exercises[editing].target?.sets[0]?.reps || 0)
        setEditWeight(exercises[editing].target?.sets[0]?.weight || 0)
        setEditNotes(exercises[editing].target?.notes)
        if(currentSS.length > 0)
        {
          setSuperset(currentSS[0])
        }
    }
  },[editing])

  useEffect(()=>{
    if(editing !== null && superset !== '')
    {
        const wTemp = currentWorkout
        const exIndex = wTemp.exercises.findIndex((item,id)=>editing == item.exercise)
        if(parseInt(superset) !== wTemp.exercises[exIndex].superset[0])
        {
          setUpdating(true)
          wTemp.exercises[exIndex].superset = [parseInt(superset)]
          axios.post('/api/workouts',wTemp.exercises,{params:{workout: currentWorkoutIndex, user:activeUser}})
          .then(res=>{
            axios.get('/api/workouts', { params: {user:activeUser}})
            .then(r=>{
                const currentIndex = r.data.currentProgram
                const dayIndex = r.data.currentDay
                const workoutIndex = r.data.programs[currentIndex].schedule[dayIndex]
                setCurrentWorkout(r.data.workouts[workoutIndex])
                setUpdating(false)
            })
          })
        }
    }
  },[superset])

  function DeleteSS() {
      const wTemp = currentWorkout
      const exIndex = wTemp.exercises.findIndex((item,id)=> editing == item.exercise)
      wTemp.exercises[exIndex].superset = []
      axios.post('/api/workouts',wTemp.exercises,{params:{workout: currentWorkoutIndex, user:activeUser}})
      .then(res=>{
        axios.get('/api/workouts', { params: {user:activeUser}})
        .then(r=>{
            const currentIndex = r.data.currentProgram
            const dayIndex = r.data.currentDay
            const workoutIndex = r.data.programs[currentIndex].schedule[dayIndex]
            setCurrentWorkout(r.data.workouts[workoutIndex])
            setSuperset('')
            setCurrentSS([])
        })
      })
  }

  function HandleClose() {
    setEditSets(0)
    setEditReps(0)
    setEditWeight(0)
    setCurrentSS([])
    setSuperset('')
    setEditNotes('')
    setEditing(null)
    setEditSS(false)
  }

  function HandleEdit() {
    const newSets = parseInt(editSets)
    const newReps = parseInt(editReps)
    const newWeight = editWeight
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
    result.splice(endIndex, 0, removed);
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

  function UpdateCurrentDay(newDay) {
    setUpdating(true)
    const postObj = {newDay: parseInt(newDay)}
    const resultsLength = Array.from({length:workouts[currentProgram.schedule[newDay]].exercises.length},x=>inProgressObj)
    axios.post('api/start',resultsLength,{params: {user:activeUser, name:workouts[currentProgram.schedule[newDay]].name}})
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
            setUpdating(false)
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
      setStarting(true)
      router.prefetch('workout')
      if(inProgress)
      {
        router.push('/workout')
      }
      else
      {
        const resultsLength = Array.from({length:currentWorkout.exercises.length},x=>Object.assign({},inProgressObj))
        let resultsTemp = [...resultsLength]
        currentWorkout.exercises.forEach((item,id)=>{
            item.superset.length > 0 ? resultsTemp[id].superset = item.superset : <></>         
        })
        axios.post('api/start', resultsTemp, {params: {user:activeUser, name:currentWorkout.name}})
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
            <div className='text-sm font-semibold grid grid-cols-9 border-b-2'>
                <div className='p-1 col-span-5 ml-[12px]'>Exercise</div>
                <div className='p-1'>Sets</div>
                <div className='p-1'>Reps</div>
                <div className='p-1'>Weight</div>
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
                        <Draggable key={exercises[item.exercise].name} draggableId={exercises[item.exercise].name} index={id}>
                          {(provided, snapshot)=>(
                              <div className={`text-sm grid grid-cols-9 border border-t-0 items-center`}
                                  ref={provided.innerRef}
                                  style={getItemStyle(snapshot.isDragging,
                                      provided.draggableProps.style)}
                                  {...provided.draggableProps}
                                  
                              >
                                <div className='p-1 col-span-5 flex items-center relative'
                                {...provided.dragHandleProps}
                                >
                                  <HiChevronUpDown size={18} className='absolute ml-[-8px] text-gray-500' />
                                  <span className='ml-[12px]'>{exercises[item.exercise].name}</span>
                                </div>
                                <div className='py-2 px-1' onClick={()=>{setEditing(item.exercise);setCurrentSS(item.superset)}}>{exercises[item.exercise].target?.sets?.length || 0}</div>
                                <div className='py-2 px-1' onClick={()=>{setEditing(item.exercise);setCurrentSS(item.superset)}}>{exercises[item.exercise].target?.sets[0]?.reps || 0}</div>
                                <div className='py-2 px-1' onClick={()=>{setEditing(item.exercise);setCurrentSS(item.superset)}}>{exercises[item.exercise].target?.sets[0]?.weight || "0"}</div>
                                <DeleteExercise currentWorkout={currentWorkout} currentWorkoutIndex={currentWorkoutIndex} setCurrentWorkout={setCurrentWorkout}
                                  username={activeUser} item={item.exercise} id={id} homepage={true} exercises={exercises}
                                />
                                {item.superset.length > 0 ?
                                <>
                                  {item.superset.map((ex,index)=>
                                    <div className='flex items-center col-span-9 grid grid-cols-9 bg-sky-100 bg-opacity-40' key={`supserset-${index}`}>
                                      <div className='col-span-5 ml-4 gap-2 flex items-center text-blue-500'> <HiLink /> <p className='text-neutral-800'>{exercises[ex].name}</p></div>
                                      <div className='py-2 px-1' onClick={()=>{setEditing(ex);setEditSS(true)}}>{exercises[ex].target?.sets?.length || 0}</div>
                                      <div className='py-2 px-1' onClick={()=>{setEditing(ex);setEditSS(true)}}>{exercises[ex].target?.sets[0]?.reps || 0}</div>
                                      <div className='py-2 px-1' onClick={()=>{setEditing(ex);setEditSS(true)}}>{exercises[ex].target?.sets[0]?.weight || "0"}</div>
                                    </div>
                                  )}
                                </>
                                :
                                <></>
                                }
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
              username={activeUser} exercises={exercises} homepage={true} setCurrentWorkoutIndex={setCurrentWorkoutIndex} setExercises={setExercises}
            />
        </div>
        { currentWorkout ?
            currentWorkout.exercises.length > 0 ?
              <StartButton text={'Start Workout'} loading={starting} loadingText={'Starting Workout...'} action={StartWorkout} />
            :
              <StartButton text={'Complete Workout'} loading={starting} loadingText={'Completing Workout...'} action={CompleteWorkout} />
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
            { editSS ? 
                <></>
            :
                <>
                    <p className='text-md'>Superset?</p>
                    <div className='flex items-center gap-4 col-span-2 lg:col-span-1'>
                        <GroupExercises exercises={exercises} choice={superset} setChoice={setSuperset} ss={true} disabled={updating} />
                        { currentSS.length > 0 ?
                        <div className='p-2 text-red-500 block ml-auto cursor-pointer'>
                          <BsTrash size={15} onClick={DeleteSS} />
                        </div>
                        :
                          <></>
                        }
                    </div>
                </>
            }
          </div>
          <div className='flex justify-end px-3 py-3 gap-3'>
              <button className='border border-gray-400 py-1 px-3 rounded-xl lg:hover:bg-red-100 lg:hover:border-red-200 lg:hover:text-red-500 lg:hover:scale-105 transition duration-200'
                onClick={HandleClose}
              >Cancel</button>
              <DialogButton disabled={updating} loading={updating} action={HandleEdit} text={'Update'} loadingText={'Updating...'} type="button"/>
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
                <select defaultValue={currentDay} className='text-md border rounded-lg w-full py-1 px-2' onChange={(e)=>UpdateCurrentDay(e.target.value)}>
                    { currentProgram.schedule.map((index,i)=>
                        <option key={i} value={i}>{workouts[index].name}</option>
                    )}
                </select>
              </>
              :
              <></>
            }
          <div className='flex justify-between mt-8'>
            <button className={`shadow-md border ${updating ? 'text-gray-200 border-gray-200' : ' border-neutral-500'} rounded-md py-1 px-3`} disabled={updating}
              onClick={()=>setChangeDay(false)}
            >Cancel</button>
          </div>
        </div>
      </Dialog>
    </main>
  )
}
