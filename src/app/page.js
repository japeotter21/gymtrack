"use client"
import React, { useState, useEffect, useContext } from 'react'
import Image from 'next/image'
import { Avatar, Dialog } from '@mui/material'
import { BsInfoCircle, BsMagnet, BsMagnetFill, BsPencil, BsThreeDotsVertical, BsTrash, BsCalendar, BsGraphUp, BsHouse, BsPerson, BsListColumns, BsListNested } from 'react-icons/bs'
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
import { BiDumbbell, BiSolidEditAlt } from 'react-icons/bi'
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
    const [updating, setUpdating] = useState(false)
    const [changeDay, setChangeDay] = useState(false)
    const [starting, setStarting] = useState(false)
    const [showInfo, setShowInfo] = useState(false)
    const {activeUser, Refresh, paused} = useContext(AppContext)
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
        }
    },[editing])

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
        axios.post('api/start',{params: {user:activeUser, name:workouts[currentProgram.schedule[newDay]].name}})
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

    function Navigate(destination)
    {
        router.push(destination)
    }

    function StartWorkout() {
        setStarting(true)
        router.prefetch('workout')
        if(paused)
        {
            router.push('/workout')
        }
        else
        {
            axios.post('api/start', {params: {user:activeUser, name:currentWorkout.name}})
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
        <main className="flex min-h-screen flex-col items-center py-12 px-2 gap-1">
            <div className='w-full lg:w-1/2 flex-col gap-2 items-center border border-gray-300 rounded-md bg-stone-50 shadow-lg cursor-pointer px-3 pt-1'>
                <div className='flex items-center'>
                <p className='text-gray-600 text-lg my-2'>Today's Workout:&nbsp;</p>
                <p className='font-semibold text-lg my-2'>{currentWorkout.name}</p>
                
                <button className='px-2 py-0.5 rounded-md ml-auto mr-0 block text-neutral-500'
                    onClick={()=>setShowInfo(!showInfo)}
                ><BsInfoCircle size={20} /></button>
                </div>
                <p className='text-sm text-gray-600'>from {currentProgram.name}</p>
                { showInfo ? 
                    <div className='mt-4 mb-4 border border-gray-300 rounded-md'>
                        <div className='text-sm font-semibold grid grid-cols-2 border-b-[1px]'>
                            <div className='px-2 py-1'>Exercise</div>
                            <div className='px-2 py-1'>Sets
                            </div>
                        </div>
                        <div className='divide-y'>
                            { currentWorkout.exercises.map((item,id)=>
                                <div className={`text-sm grid grid-cols-2 items-center`} key={exercises[item].name} onClick={()=>setEditing(item)}
                                >
                                    <p className='px-2 py-1'>{exercises[item].name}</p>
                                    <p className='px-2 py-1'>{exercises[item].target?.sets.length}</p>
                                </div>
                            )}
                        </div>
                    </div>
                :
                    <></>
                }
                { currentWorkout ?
                    currentWorkout.exercises.length > 0 ?
                        paused ?
                        <StartButton text={'Resume Workout'} loading={starting} loadingText={'Resuming Workout...'} action={StartWorkout} />
                        :
                        <StartButton text={'Start Workout'} loading={starting} loadingText={'Starting Workout...'} action={StartWorkout} />
                    :
                    <StartButton text={'Complete Workout'} loading={starting} loadingText={'Completing Workout...'} action={CompleteWorkout} />
                :
                <></>
                }
                <div className='flex justify-center gap-12 mb-2'>
                    <button className='text-sm py-2 px-4 rounded-md text-neutral-500 flex flex-col items-center gap-1.5 bg-sky-100 bg-opacity-20'
                        onClick={()=>setChangeDay(true)}
                    >
                        <BiDumbbell size={18} />
                        Change Workout</button>
                    <button className='text-sm py-2 px-4 rounded-md text-neutral-500 flex flex-col items-center gap-1.5 bg-sky-100 bg-opacity-20'
                                        onClick={()=>Navigate('/workouts')}
                    >
                        <BiSolidEditAlt size={18} />
                        Edit Exercises
                    </button>
                </div>
            </div>
            <div className='w-full lg:w-1/2 grid grid-cols-2 gap-4 mt-4'>
                <div className='flex flex-col col-span-2 gap-1 items-center bg-stone-50 rounded-md shadow-md cursor-pointer px-3 py-3'
                        onClick={()=>Navigate('/history')}
                >
                    <div className=' text-sky-600'>
                        <BsCalendar size={20} />
                    </div>
                    <p className='text-sm mt-1'>History</p>
                    <p className='text-xs mt-1'>View past workouts</p>
                </div>
                <div className='flex flex-col col-span-2 gap-1 items-center rounded-md bg-stone-50 shadow-md cursor-pointer px-3 py-3'
                        onClick={()=>Navigate('/stats')}
                >
                    <BsGraphUp size={20} />
                    <p className='text-sm mt-1'>Stats</p>
                    <p className='text-xs mt-1 text-gray-500'>Track Your Progress</p>
                </div>
                <div className='flex flex-col gap-1 items-center justify-center bg-stone-50 rounded-md shadow-md cursor-pointer px-3 py-3'
                        onClick={()=>Navigate('/workouts')}
                >
                    <div className='flex gap-6 items-center'>
                        <BiDumbbell size={20} />
                        <p className='text-sm mt-1'>Workouts</p>
                    </div>
                    <p className='text-xs mt-1 text-gray-500 text-center'>Edit programs or exercises</p>
                </div>
                <div className='flex flex-col gap-1 items-center justify-center rounded-md bg-stone-50 shadow-md cursor-pointer px-3 py-3'
                        onClick={()=>Navigate('/profile')}
                >
                    <div className='flex gap-6 items-center'>
                        <BsPerson size={20} />
                        <p className='text-sm mt-1'>Profile</p>
                    </div>
                    <p className='text-xs text-gray-500 mt-1 text-center'>Settings and Personal Info</p>
                </div>
            </div>
            
            {/* <Pagenav page='home' /> */}
            { exercises.length > 0 && editing !== null ? 
                <Dialog open={editing !== null} onClose={HandleClose} maxWidth="lg" fullWidth>
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
