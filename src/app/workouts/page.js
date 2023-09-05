"use client"
import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import Pagenav from '../components/Pagenav'
import { BsTrash, BsCheck2Circle, BsChevronLeft, BsChevronRight, BsCircle, BsPlus, BsPlusCircle, BsPlusCircleFill } from 'react-icons/bs'
import { Checkbox, Dialog } from '@mui/material'
import WorkoutList from '../components/WorkoutList'
import AppContext from '../AppContext'
import { redirect } from 'next/navigation'
import DialogButton from '../components/DialogButton'

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
    const {activeUser, Refresh} = useContext(AppContext)

    useEffect(()=>{
        if(activeUser)
        {
            const endpoints = ['/api/user', '/api/exercise', '/api/workouts']
            axios.all(endpoints.map((endpoint) => axios.get(endpoint,{params:{user:activeUser}}))).then(
            axios.spread((user, exercise, workout) => {
                setLoading(false)
                setPrograms(workout.data.programs)
                const currentIndex = workout.data.currentProgram
                setProgramIndex(currentIndex)
                setCurrentProgram(workout.data.programs[currentIndex])
                setWorkouts(workout.data.workouts)
                setExercises(exercise.data.exercises)
                setProfile(user.data.profile)
            }))
        }
        else
        {
          Refresh()
        }
    },[activeUser])

    function HandleClose() {
        setUpdating(false)
        setAddingWorkout(false)
    }

    function AddWorkout() {
        setUpdating(true)
        const postObj = {
            name: workoutName,
            exercises: [],
            superset: []
        }
        const newWorkoutIndex = workouts.length
        axios.post('/api/routine', postObj, {params:{workout: newWorkoutIndex, user:activeUser, program: programIndex }})
        .then(res=>{
            axios.get('/api/workouts',{params:{user:activeUser}})
            .then(r=>{
                const currentIndex = r.data.currentProgram
                const dayIndex = r.data.currentDay
                const workoutIndex = r.data.programs[currentIndex].schedule[dayIndex]
                setPrograms(r.data.programs)
                setWorkouts(r.data.workouts)
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
            axios.get('/api/workouts',{params:{user:activeUser}})
            .then(r=>{
                const currentIndex = r.data.currentProgram
                const dayIndex = r.data.currentDay
                const workoutIndex = r.data.programs[currentIndex].schedule[dayIndex]
                setPrograms(r.data.programs)
                setWorkouts(r.data.workouts)
                HandleClose()
            })
        })
    }

    function ChangeProgram() {
        const postObj = {newProgram: parseInt(programIndex)}
        axios.put('/api/workouts', postObj, {params:{user:activeUser}})
        .then(res=>{
            axios.get('/api/workouts',{params:{user:activeUser}})
            .then(r=>{
                const currentIndex = r.data.currentProgram
                setCurrentProgram(r.data.programs[currentIndex])
                setWorkouts(r.data.workouts)
            })
            
        })
    }

    function AddProgram(e) {
        e.preventDefault()
        setUpdating(true)
        const postObj = {
            name: e.target[0].value,
            description: e.target[1].value,
            schedule: []
        }
        const newProgramIndex = programs.length
        axios.post('/api/routine', postObj, {params:{user:activeUser, program: newProgramIndex, newProgram: true }})
        .then(res=>{
            axios.get('/api/workouts',{params:{user:activeUser}})
            .then(r=>{
                setProgramIndex(r.data.programs.length - 1)
                setPrograms(r.data.programs)
                setWorkouts(r.data.workouts)
                setNewProgram(false)
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
        <main className="flex min-h-screen flex-col items-center gap-4">
            <div className='flex justify-between items-center gap-8 w-full bg-stone-50 pt-6 pb-3 px-2'>
                <div className='flex flex-col gap-2 items-center justify-start'>
                    <select className='border rounded-md border-gray-400 px-2 h-max' value={programIndex} onChange={(e)=>setProgramIndex(e.target.value)}>
                        {programs.map((prog,index)=>
                            <option key={index} value={index}>{prog.name}</option>
                        )}
                    </select>
                    <p className='text-xs'>Choose Program</p>
                </div>
                <div className='flex items-center gap-2'>
                    { programs[programIndex].name === currentProgram.name ?
                        <div className='flex flex-col gap-1 items-center justify-start'>
                            <button className='px-3 py-1 rounded-full'>
                                <BsCheck2Circle size={20} style={{color:'#15803d'}} />
                            </button>
                            <p className='text-xs'>Current</p>
                        </div>
                        :
                        <div className='flex flex-col gap-1 items-center justify-start'>
                            <button className='px-3 py-1 rounded-full'
                                onClick={ChangeProgram}
                            >
                                <BsCircle size={20} style={{color:'#6b7280'}} />
                            </button>
                            <p className='text-xs'>Use This Program</p>
                        </div>
                    }
                    <div className='flex flex-col gap-1 items-center justify-start'>
                        <button className='px-3 py-1 rounded-full text-sky-500'
                            onClick={()=>setNewProgram(true)}
                        ><BsPlusCircleFill size={20} /></button>
                        <p className='text-xs'>Create New</p>
                    </div>
                </div>
            </div>
            <div className='w-full lg:w-1/2 flex flex-col gap-2 items-center px-2 lg:px-12'>
                <div className='w-full text-center'>
                    <p className='font-semibold'>{programs[programIndex].name}</p>
                    <p className='text-sm break-words'>{programs[programIndex].description}</p>
                </div>
                <div className='flex flex-col gap-4 w-full mb-4'>
                    {programs[programIndex].schedule.map((day,i)=>
                        <div key={`${i}-${day}`} className='border border-gray-400 bg-stone-50 rounded-md shadow-sm'> 
                            <WorkoutList currentWorkout={workouts[day]} exercises={exercises} setCurrentWorkout={setCurrentWorkout} setExercises={setExercises}
                                setPrograms={setPrograms} setCurrentProgram={setCurrentProgram} workouts={workouts} currentProgram={currentProgram}
                                profile={profile} setWorkouts={setWorkouts} day={day} i={i} activeUser={activeUser} HandleDelete={HandleDelete}
                            />
                        </div>
                    )}
                    <button className='bg-gradient-to-r from-green-500 to-green-600 py-2 rounded-xl shadow-lg'
                        onClick={()=>setAddingWorkout(true)}
                    > 
                        Add Workout
                    </button>
                </div>
                <Pagenav page='workouts' />
            </div>
            <Dialog open={addingWorkout} onClose={HandleClose}>
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
            <Dialog open={newProgram} onClose={()=>setNewProgram(false)}>
                <div className='bg-stone-50 px-4 py-3'>
                    <p className='font-semibold mb-4'>Add New Program</p>
                    <form id='newProgram' onSubmit={(e)=>AddProgram(e)} className='w-full flex flex-col items-center gap-2'>
                        <input id="name" name="name" type="text" placeholder='Name' className='border border-gray-400 rounded-md p-1'
                        />
                        <textarea id="description" name="description" type="text" placeholder='Description' className='w-full border border-gray-400 rounded-md p-1'
                        />
                        <p className='text-xs'>Choose from Template</p>
                        <select disabled id="template" name="template" className='border border-gray-400 rounded-md p-1'>
                            <option value={0}>Custom</option>
                            <option value={1}>Push/Pull/Legs</option>
                            <option value={2}>Arnold Split</option>
                            <option value={3}>5-Day Split</option>
                        </select>
                        <div className='flex justify-between mt-4 w-full'>
                            <button className='px-3 py-2 rounded-lg shadow-md bg-opacity-90 bg-gray-300' type='button'
                                onClick={()=>setNewProgram(false)}
                            >Cancel</button>
                            <DialogButton text="Add" loading={updating} loadingText="Adding..." type="submit" action={null} disabled={false} />
                        </div>
                    </form>
                </div>
            </Dialog>
        </main>
    )
}
