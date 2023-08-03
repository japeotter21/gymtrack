"use client"
import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import Pagenav from '../components/Pagenav'
import { BsTrash, BsCheck2Circle, BsChevronLeft, BsChevronRight, BsCircle } from 'react-icons/bs'
import { Checkbox, Dialog } from '@mui/material'
import WorkoutList from '../components/WorkoutList'
import AppContext from '../AppContext'
import { redirect } from 'next/navigation'

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
    const {activeUser} = useContext(AppContext)

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
            redirect('/login')
        }
    },[])

    function HandleClose() {
        setAddingWorkout(false)
    }

    function AddWorkout() {
        const postObj = {
            name: workoutName,
            exercises: []
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

    if(loading)
    {
        return (
            <></>
        )
    }
    
    return (
        <main className="flex min-h-screen flex-col items-center py-8 lg:pt-16 px-2 lg:px-12 gap-4">
            <div className='w-full lg:w-1/2 flex flex-col gap-2 items-center'>
                <div className='flex justify-center items-center gap-4 w-full'>
                    <div className='flex flex-col gap-2 items-center justify-start'>
                        <select className='border rounded-md border-gray-400 px-2 h-max' value={programIndex} onChange={(e)=>setProgramIndex(e.target.value)}>
                            {programs.map((prog,index)=>
                                <option key={index} value={index}>{prog.name}</option>
                            )}
                        </select>
                        <p className='text-xs'>Select Program</p>
                    </div>
                    { programs[programIndex].name === currentProgram.name ?
                        <div className='flex flex-col gap-1 items-center justify-start'>
                            <button className='px-3 py-1 rounded-full'>
                                <BsCheck2Circle size={20} style={{color:'#15803d'}} />
                            </button>
                            <p className='text-xs'>Current Program</p>
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
                </div>
                <div className='w-full text-center'>
                    <p className='font-semibold'>{programs[programIndex].name}</p>
                    <p className='text-sm break-words'>{programs[programIndex].description}</p>
                </div>
                <div className='flex flex-col gap-4 w-full'>
                    {programs[programIndex].schedule.map((day,i)=>
                        <div key={`${i}-${day}`} className='border border-gray-400 bg-stone-50 rounded-md shadow-sm'> 
                            <WorkoutList currentWorkout={workouts[day]} exercises={exercises} setCurrentWorkout={setCurrentWorkout}
                                setPrograms={setPrograms} setCurrentProgram={setCurrentProgram} workouts={workouts}
                                profile={profile} setWorkouts={setWorkouts} day={day} i={i}
                            />
                        </div>
                    )}
                    <button className='border border-gray-400 bg-gradient-to-r from-green-500 to-green-600 py-2 rounded-md shadow-lg'
                        onClick={()=>setAddingWorkout(true)}
                    > 
                        Add Workout
                    </button>
                </div>
            </div>
            <Pagenav page='workouts' />
            <Dialog open={addingWorkout} onClose={HandleClose}>
                <div className='bg-stone-50 p-2 flex flex-col gap-4'>
                    <p className='font-semibold'>Add Workout</p>
                    <input type="text" placeholder='Name' className='border border-gray-400 rounded-md p-1'
                        onChange={(e)=>setWorkoutName(e.target.value)}
                    />
                    <div className='flex justify-between'>
                        <button className='px-3 py-2 rounded-xl shadow-md bg-opacity-90 bg-gray-300'
                            onClick={HandleClose}
                        >Cancel</button>
                        <button className='px-3 py-2 rounded-xl shadow-md bg-opacity-90 bg-green-600'
                            onClick={AddWorkout}
                        >Add</button>
                    </div>
                </div>
            </Dialog>
        </main>
    )
}
