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
import { BiDumbbell, BiListUl, BiSolidEditAlt } from 'react-icons/bi'
import GroupExercises from './components/GroupExercises'
import CreateNewProgram from './components/CreateNewProgram'

export default function Home() {
    const [day, setDay] = useState(0)
    const [profile, setProfile] = useState({})
    const [loading, setLoading] = useState(true)
    const [currentProgram, setCurrentProgram] = useState(null)
    const [currentWorkout, setCurrentWorkout] = useState(null)
    const [programs, setPrograms] = useState([])
    const [programIndex, setProgramIndex] = useState(0)
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
    const { activeUser, Refresh, paused, setPaused } = useContext(AppContext)
    const router = useRouter()

    useEffect(()=>{
        if (activeUser)
        {
            setDay(new Date().getDay())
            const endpoints = ['/api/user', '/api/exercise', '/api/programs']
            axios.all(endpoints.map((endpoint) => axios.get(endpoint, { params: {user:activeUser}}))).then(
                axios.spread((user, exercise, programs) => {
                    setProfile(user.data?.profile)
                    setExercises(exercise.data?.exercises)
                    const currentIndex = user.data?.currentProgram
                    if(programs?.data)
                    {
                        setCurrentProgram(programs.data?.programs[currentIndex])
                        const dayIndex = user.data.currentDay
                        const workoutIndex = programs.data.programs[currentIndex].schedule[dayIndex]
                        setCurrentWorkout(workoutIndex)
                        setProgramIndex(currentIndex)
                        setCurrentDay(dayIndex)
                    }
                    if(programs.data?.programs)
                    {
                        setPrograms(programs.data.programs)
                    }
                    setLoading(false)
                })
            )
            if(localStorage.getItem('startTime') && localStorage.getItem('startTime') !== undefined)
            {
                setPaused(true)
            }
        }
        else
        {
            Refresh()
        }
    },[activeUser])
    
    useEffect(()=>{
        if(editing !== null)
        {
            setEditSets(editing.target?.sets?.length || 0)
            setEditReps(editing.target?.sets[0]?.reps || 0)
            setEditWeight(editing.target?.sets[0]?.weight || 0)
            setEditNotes(editing.target?.notes)
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
        const exIndex = currentWorkout.exercises.findIndex((item)=>item.name === editing.name)
        axios.put(`/api/program/${programIndex}/${currentDay}/${exIndex}`,postObj, { params: {user: activeUser } })
        .then(res=>{
            axios.get('/api/programs',{ params: { user:activeUser }})
            .then(r=>{
                const workoutIndex = r.data.programs[programIndex].schedule[currentDay]
                setCurrentWorkout(workoutIndex)
                HandleClose()
                setUpdating(false)
            })
        })
    }

    function UpdateCurrentDay(newDay) {
        setUpdating(true)
        const postObj = {newDay: parseInt(newDay)}
        localStorage.removeItem('startTime')
        axios.delete('api/history',{params: {user:activeUser}})
        axios.put('/api/workouts', postObj, { params: {user:activeUser}})
        .then(r=>{
            setCurrentDay(newDay)
            setCurrentWorkout(currentProgram.schedule[newDay])
            setChangeDay(false)
            setUpdating(false)
        })
    }

    // function CompleteWorkout() {
    //     let dayNum = 0 
    //     if (currentDay !== currentProgram.schedule.length - 1)
    //     {
    //         dayNum = currentDay + 1
    //     }
    //     FinishWorkout(dayNum, activeUser, true, null)
    //     .then(r=>{
    //         axios.get('/api/workouts', { params: {user:activeUser}})
    //         .then(res=>{
    //             const dayIndex = res.data.currentDay
    //             const currentIndex = res.data.currentProgram
    //             const workoutIndex = res.data.programs[currentIndex].schedule[dayIndex]
    //             setCurrentDay(dayIndex)
    //             setCurrentWorkout(workoutIndex)
    //         })
    //     })
    // }

    function Navigate(destination)
    {
        router.push(destination)
    }

    function StartWorkout() {
        setStarting(true)
        localStorage.setItem('startTime', new Date().getTime())
        router.prefetch('workout')
        if(paused)
        {
            router.push('/workout')
        }
        else
        {
            let postArr = []
            currentWorkout.exercises.forEach((item,id)=>{
                item.target.sets.forEach((set,ind)=>postArr.push({reps:0, weight:set.weight, name:`${item.name}-${ind}`}))
            })
            axios.post('api/start', postArr, {params: {user:activeUser, name:currentWorkout.name}})
            .then(res=>{
                router.push('/workout')
            })
        }
    }

    function AddProgram(e, defaultTemplate) {
        e.preventDefault()
        setUpdating(true)
        if(!!defaultTemplate)
        {
            const templateValues = JSON.parse(defaultTemplate)
            console.log(templateValues)
            axios.post('/api/routine', templateValues, {params:{user:activeUser, program: 0, newProgram: true, newUser: true }})
            .then(res=>{
                router.push('/workouts')
            })
        }
        else
        {
            const postObj = {
                name: e.target[0].value,
                description: e.target[1].value,
                schedule: []
            }
            axios.post('/api/routine', postObj, {params:{user:activeUser, program: 0, newProgram: true, newUser: true }})
            .then(res=>{
                router.push('/workouts')
            })
        }
    }

    if(loading)
    {
        return (
        <></>
        )
    }

    if(programs.length === 0)
    {
        return (
            <main className="flex min-h-screen flex-col items-center py-12 px-2 gap-1">
                <CreateNewProgram AddProgram={AddProgram} updating={updating} />
            </main>
        )
    }

    return (
        <main className="flex min-h-screen flex-col items-center py-12 px-2 gap-1">
            <div className='w-full lg:w-1/2 flex-col gap-2 items-center border border-gray-300 rounded-md bg-stone-50 shadow-lg cursor-pointer px-3 pt-1'>
                <div className='flex items-center'>
                <p className='text-gray-600 text-lg my-2'>Today's Workout:&nbsp;</p>
                <p className='font-semibold text-lg my-2'>{currentWorkout?.name}</p>
                
                <button className='px-2 py-0.5 rounded-md ml-auto mr-0 block text-neutral-500'
                    onClick={()=>setShowInfo(!showInfo)}
                ><BsInfoCircle size={20} /></button>
                </div>
                <p className='text-sm text-gray-600'>from {currentProgram?.name}</p>
                { showInfo ? 
                    <div className='mt-4 mb-4 border border-gray-300 rounded-md'>
                        <div className='text-sm font-semibold grid grid-cols-6 border-b-[1px]'>
                            <div className='px-2 py-1 col-span-3'>Exercise</div>
                            <div className='px-2 py-1'>Sets</div>
                            <div className='px-2 py-1'>Reps</div>
                            <div className='px-2 py-1'>Weight</div>
                        </div>
                        <div className='divide-y'>
                            { currentWorkout.exercises.map((item,id)=>
                                <div className={`text-sm grid grid-cols-6 items-center`} key={item.name} onClick={()=>setEditing(item)}
                                >
                                    <p className='px-2 py-1 col-span-3'>{item.name}</p>
                                    <p className='px-2 py-1'>{item.target?.sets.length}</p>
                                    <p className='px-2 py-1'>{item.target?.sets[0]?.reps}</p>
                                    <p className='px-2 py-1'>{item.target?.sets[0]?.weight}</p>
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
                    <StartButton text={'Complete Workout'} loading={starting} loadingText={'Completing Workout...'} />
                :
                <></>
                }
                <div className='flex justify-center gap-12 mb-2'>
                    <button className='text-sm py-2 px-4 rounded-md text-neutral-500 flex flex-col items-center gap-1.5 bg-sky-100 bg-opacity-20'
                        onClick={()=>setChangeDay(true)}
                    >
                        <BiListUl size={18} />
                        Switch Workout</button>
                    <button className='text-sm py-2 px-4 rounded-md text-neutral-500 flex flex-col items-center gap-1.5 bg-sky-100 bg-opacity-20'
                                        onClick={()=>Navigate('/workouts')}
                    >
                        <BiDumbbell size={18} />
                        Change Exercises
                    </button>
                </div>
            </div>
            <div className='w-full lg:w-1/2 grid grid-cols-2 gap-4 mt-4 focus:bg-green-200'>
                <Link className='flex flex-col col-span-2 gap-1 items-center bg-stone-50 rounded-md shadow-md cursor-pointer px-3 py-3'
                        href='/history'
                >
                    <div className=' text-sky-600'>
                        <BsCalendar size={20} />
                    </div>
                    <p className='text-sm mt-1'>History</p>
                    <p className='text-xs mt-1'>View past workouts</p>
                </Link>
                <Link className='flex flex-col col-span-2 gap-1 items-center rounded-md bg-stone-50 shadow-md cursor-pointer px-3 py-3 focus:bg-green-200'
                        href='/stats'
                >
                    <BsGraphUp size={20} />
                    <p className='text-sm mt-1'>Stats</p>
                    <p className='text-xs mt-1 text-gray-500'>Track Your Progress</p>
                </Link>
                <Link className='flex flex-col gap-1 items-center justify-center bg-stone-50 rounded-md shadow-md cursor-pointer px-3 py-3 focus:bg-green-200'
                        href='/workouts'
                >
                    <div className='flex gap-6 items-center'>
                        <BiDumbbell size={20} />
                        <p className='text-sm mt-1'>Workouts</p>
                    </div>
                    <p className='text-xs mt-1 text-gray-500 text-center'>Edit programs or exercises</p>
                </Link>
                <Link className='flex flex-col gap-1 items-center justify-center rounded-md bg-stone-50 shadow-md cursor-pointer px-3 py-3 focus:bg-green-200'
                        href='/profile'
                >
                    <div className='flex gap-6 items-center'>
                        <BsPerson size={20} />
                        <p className='text-sm mt-1'>Profile</p>
                    </div>
                    <p className='text-xs text-gray-500 mt-1 text-center'>Settings and Personal Info</p>
                </Link>
            </div>
            
            {/* <Pagenav page='home' /> */}
            { exercises?.length > 0 && editing !== null ? 
                <Dialog open={editing !== null} onClose={HandleClose} maxWidth="lg" fullWidth>
                    <p className='font-semibold text-lg px-3 py-3'>{editing.name}</p>
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
                <p className='font-semibold text-lg py-2'>Switch Workout</p>
                    { currentProgram ? 
                    <>
                        <p>Name</p>
                        <select defaultValue={currentDay} className='text-md border rounded-lg w-full py-1 px-2' onChange={(e)=>UpdateCurrentDay(e.target.value)}>
                            { currentProgram.schedule.map((index,i)=>
                                <option key={i} value={i}>{index.name}</option>
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
