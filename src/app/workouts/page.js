"use client"
import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import Pagenav from '../components/Pagenav'
import { BsTrash, BsCheck2Circle, BsChevronLeft, BsChevronRight, BsCircle, BsPlus, BsPlusCircle, BsPlusCircleFill, BsCalendar2, BsArrowLeft, BsHouse, BsPencil, BsArrowLeftRight } from 'react-icons/bs'
import { Checkbox, Dialog, Menu } from '@mui/material'
import WorkoutList from '../components/WorkoutList'
import AppContext from '../AppContext'
import DialogButton from '../components/DialogButton'
import Link from 'next/link'
import CreateNewProgram from '../components/CreateNewProgram'

export default function Workouts() {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [currentProgram, setCurrentProgram] = useState(null)
    const [programIndex, setProgramIndex] = useState(0)
    const [programs, setPrograms] = useState([])
    const [workouts, setWorkouts] = useState([])
    const [currentWorkout, setCurrentWorkout] = useState(null)
    const [exercises, setExercises] = useState([])
    const [addingWorkout, setAddingWorkout] = useState(false)
    const [workoutName, setWorkoutName] = useState('')
    const [newProgram, setNewProgram] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [editing, setEditing] = useState(false)
    const [programName, setProgramName] = useState('')
    const [programDescription, setProgramDescription] = useState('')
    const [anchorEl, setanchorEl] = useState(null)
    const {activeUser, Refresh} = useContext(AppContext)

    const open = Boolean(anchorEl)

    useEffect(()=>{
        if(activeUser)
        {
            const endpoints = ['/api/user', '/api/exercise', '/api/programs']
            axios.all(endpoints.map((endpoint) => axios.get(endpoint,{params:{user:activeUser}}))).then(
            axios.spread((user, exercise, program) => {
                setLoading(false)
                setPrograms(program.data.programs)
                const currentIndex = user.data.currentProgram
                setProgramIndex(currentIndex)
                setCurrentProgram(program.data.programs[currentIndex])
                setExercises(exercise.data.exercises)
                setProfile(user.data.profile)
            }))
        }
        else
        {
          Refresh()
        }
    },[activeUser])

    useEffect(()=>{
        if(editing)
        {
            setProgramName(programs[programIndex].name)
            setProgramDescription(programs[programIndex].description)
        }
    },[editing])

    function HandleClose() {
        setUpdating(false)
        setAddingWorkout(false)
        setEditing(false)
    }

    function AddWorkout() {
        setUpdating(true)
        const postObj = {
            name: workoutName,
            exercises: [],
            superset: []
        }
        const newWorkoutIndex = programs[programIndex].schedule.length
        axios.post('/api/routine', postObj, {params:{workout: newWorkoutIndex, user:activeUser, program: programIndex }})
        .then(res=>{
            axios.get('/api/workouts',{params:{user:activeUser}})
            .then(r=>{
                const currentIndex = r.data.currentProgram
                const dayIndex = r.data.currentDay
                const workoutIndex = r.data.programs[currentIndex].schedule[dayIndex]
                setPrograms(r.data.programs)
                HandleClose()
            })
        })
    }

    function HandleDelete(i) {
        const scheduleTemp = currentProgram.schedule
        scheduleTemp.splice(i,1)
        const postObj = {data: scheduleTemp}
        axios.put('/api/routine', postObj, {params:{user:activeUser, program: programIndex }})
        .then(res=>{
            axios.get('/api/programs',{params:{user:activeUser}})
            .then(r=>{
                setPrograms(r.data.programs)
                HandleClose()
            })
        })
    }

    function ChangeProgram() {
        const postObj = {newProgram: parseInt(programIndex)}
        axios.put('/api/workouts', postObj, {params:{user:activeUser}})
        .then(res=>{
                setCurrentProgram(programIndex)
        })
    }

    function AddProgram(e, defaultTemplate) {
        e.preventDefault()
        setUpdating(true)
        if(!!defaultTemplate)
        {
            const templateValues = JSON.parse(defaultTemplate)
            console.log(templateValues)
            const newProgramIndex = programs.length
            axios.post('/api/routine', templateValues, {params:{user:activeUser, program: newProgramIndex, newProgram: true }})
            .then(res=>{
                axios.get('/api/programs',{params:{user:activeUser}})
                .then(r=>{
                    setPrograms(r.data.programs)
                    setNewProgram(false)
                    setProgramIndex(newProgramIndex)
                    HandleClose()
                })
            })
        }
        else
        {
            const postObj = {
                name: e.target[0].value,
                description: e.target[1].value,
                schedule: []
            }
            const newProgramIndex = programs.length
            axios.post('/api/routine', postObj, {params:{user:activeUser, program: newProgramIndex, newProgram: true }})
            .then(res=>{
                axios.get('/api/programs',{params:{user:activeUser}})
                .then(r=>{
                    setPrograms(r.data.programs)
                    setProgramIndex(newProgramIndex)
                    setNewProgram(false)
                    HandleClose()
                })
            })
        }
    }

    function EditProgram() {
        setUpdating(true)
        const postObj = {
            title: programName,
            description: programDescription
        }
        axios.put('/api/routine', postObj, {params:{user:activeUser, meta: true, program: programIndex }})
        .then(res=>{
            axios.get('/api/routine',{params:{user:activeUser}})
            .then(r=>{
                setPrograms(r.data.programs)
                const currentIndex = r.data.currentProgram
                setCurrentProgram(r.data.programs[currentIndex])
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
        <main className="flex min-h-screen flex-col items-center gap-4 py-12">
            <div className='w-full lg:w-1/2 flex flex-col gap-2 items-center px-2 lg:px-12'>
                <div className='w-full text-center'>
                    <p className='font-semibold text-xl px-2 py-1'>{programs[programIndex].name}</p>
                    <p className='text-sm break-words px-2 py-1'>{programs[programIndex].description}</p>
                </div>
                <div className='flex text-sm gap-6 items-baseline'>
                    <button className='text-sky-600 flex flex-col items-center gap-2 bg-sky-50 bg-opacity-60 px-3 py-2 rounded-md'
                        onClick={()=>setEditing(true)}
                    >
                        <BsPencil />
                        <p>Edit Info</p>
                    </button>
                    <button className='text-sky-600 flex flex-col items-center gap-2 bg-sky-50 bg-opacity-60 px-3 py-2 rounded-md'
                        onClick={(e)=>setanchorEl(e.currentTarget)}
                    >
                        <BsArrowLeftRight />
                        <p>Switch Program</p>
                    </button>
                </div>
                <hr className='my-2 w-full border-gray-300' />
                <div className='flex flex-col gap-4 w-full mb-4'>
                    {currentProgram.schedule.map((lift,i)=>
                        <div key={`${i}-${lift}`} className='bg-stone-50 rounded-md shadow-md'> 
                            <WorkoutList currentWorkout={lift} exercises={exercises} setCurrentWorkout={setCurrentWorkout} setExercises={setExercises}
                                setPrograms={setPrograms} setCurrentProgram={setCurrentProgram} workouts={workouts} programIndex={programIndex}
                                profile={profile} setWorkouts={setWorkouts} day={i} i={i} activeUser={activeUser} HandleDelete={HandleDelete}
                            />
                        </div>
                    )}
                    <button className='bg-gradient-radial to-[#f4f4f5] from-white py-2 rounded-lg text-neutral-600 border border-blue-200'
                        onClick={()=>setAddingWorkout(true)}
                    > 
                        Add Workout
                    </button>
                </div>
                {/* <Pagenav page='workouts' /> */}
            </div>
            <div className='grid grid-cols-3 items-center gap-2 w-full px-2 lg:px-12'>
                <Link className='flex flex-col gap-1 items-center justify-center self-stretch px-4 py-2 shadow-sm rounded-md bg-stone-50 text-neutral-600'
                    href="/"
                >
                    <div className='px-3 py-1 rounded-full'
                    ><BsHouse size={20} /></div>
                    <p className='text-xs text-center'>Back to Home</p>
                </Link>
                { programs[programIndex].name === currentProgram.name ?
                    <button className='flex flex-col gap-1 items-center justify-center px-4 py-2 shadow-md rounded-md text-sky-600 bg-sky-100 border border-sky-300'>
                        <div className='px-3 py-1 rounded-full'>
                            <BsCheck2Circle size={20} />
                        </div>
                        <p className='text-xs text-center'>Current Program</p>
                    </button>
                    :
                    <button className='flex flex-col gap-1 items-center justify-center px-4 py-2 shadow-sm rounded-md bg-stone-50'
                        onClick={ChangeProgram}
                    >
                        <div className='px-3 py-1 rounded-full text-gray-500'
                        >
                            <BsCircle size={20}/>
                        </div>
                        <p className='text-xs text-center'>Use This Program</p>
                    </button>
                }
                <button className='flex flex-col gap-1 items-center justify-center px-4 py-2 shadow-sm rounded-md bg-stone-50'
                    onClick={()=>setNewProgram(true)}
                >
                    <div className='px-3 py-1 rounded-full text-sky-500'
                    ><BsCalendar2 size={20} /></div>
                    <p className='text-xs text-center'>Create New Program</p>
                </button>
            </div>
            <Menu anchorEl={anchorEl}
                open={open}
                onClose={()=>setanchorEl(null)}
            >
                <div className='px-2 py-1'>
                    <p className='text-sm text-center mb-1'>Program</p>
                    <select className='border rounded-md border-gray-400 px-2 h-max' value={programIndex} onChange={(e)=>{setProgramIndex(e.target.value);setanchorEl(null)}}>
                        {programs.map((prog,index)=>
                            <option key={index} value={index}>{prog.name}</option>
                        )}
                    </select>
                </div>
            </Menu>   
            <Dialog open={addingWorkout} onClose={HandleClose} maxWidth="lg" fullWidth>
                <div className='bg-stone-50 p-2 flex flex-col gap-4'>
                    <p className='font-semibold'>Add Workout</p>
                    <input type="text" placeholder='Name' className='border border-gray-400 rounded-md p-1'
                        onChange={(e)=>setWorkoutName(e.target.value)}
                    />
                    <div className='flex justify-between'>
                        <button className='px-3 py-2 rounded-lg shadow-md bg-opacity-90 bg-gray-300'
                            onClick={HandleClose}
                        >Cancel</button>
                        <DialogButton text="Add" loading={updating} loadingText="Adding..." type="button" action={AddWorkout} disabled={false} />
                    </div>
                </div>
            </Dialog>
            <Dialog open={newProgram} onClose={()=>setNewProgram(false)} maxWidth="lg" fullWidth>
                <CreateNewProgram AddProgram={AddProgram} setNewProgram={setNewProgram} updating={updating} />
            </Dialog>
            <Dialog open={editing} onClose={()=>setEditing(false)} maxWidth="lg" fullWidth>
                <div className='bg-stone-50 p-2 flex flex-col gap-4'>
                    <p className='text-xs mt-2 text-gray-500'>Title</p>
                    <input value={programName} onChange={(e)=>setProgramName(e.target.value)}
                        className='border border-gray-400 rounded-md px-2 py-1'
                    />
                    <p className='text-xs mt-2 text-gray-500'>Description</p>
                    <textarea value={programDescription} onChange={(e)=>setProgramDescription(e.target.value)}
                        className='border border-gray-400 rounded-md px-2 py-1'
                    />
                    <div className='flex justify-between'>
                        <button className='px-3 py-2 rounded-lg shadow-md bg-opacity-90 bg-gray-300'
                            onClick={()=>setEditing(false)}
                        >Cancel</button>
                        <DialogButton text="Add" loading={updating} loadingText="Adding..." type="button" action={EditProgram} disabled={false} />
                    </div>
                </div>
            </Dialog>
        </main>
    )
}
