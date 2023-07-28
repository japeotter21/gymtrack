"use client"
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Pagenav from '../components/Pagenav'
import { BsTrash, BsCheck2Circle, BsChevronLeft, BsChevronRight, BsCircle } from 'react-icons/bs'
import { Checkbox, Dialog } from '@mui/material'
import PostExercise from '../components/EditWorkout'
import WorkoutList from '../components/WorkoutList'


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

    useEffect(()=>{
        axios.get('/api/user')
        .then(res=>{
          setLoading(false)
          setPrograms(res.data.documents[0].programs)
          const currentIndex = res.data.documents[0].currentProgram
          setProgramIndex(currentIndex)
          setCurrentProgram(res.data.documents[0].programs[currentIndex])
          setWorkouts(res.data.documents[0].workouts)
          setExercises(res.data.documents[0].exercises)
          setProfile(res.data.documents[0].profile)
        })
        .catch(err=>{
          console.error(err.message)
        })
    },[])

    function HandleClose() {
        setAddingWorkout(false)
    }

    function AddWorkout() {
        
    }

    function ChangeProgram() {
        
    }

    if(loading)
    {
        return (
            <></>
        )
    }
    
    return (
        <main className="flex min-h-screen flex-col items-center py-6 lg:pt-12 px-2 lg:p-12 gap-4">
            <div className='w-full lg:w-1/2 flex flex-col gap-2 items-center'>
                <div className='flex justify-between items-center w-full lg:w-1/2'>
                    <div className='flex flex-col gap-2 items-center'>
                        { programs[programIndex].name === currentProgram.name ?
                            <button className='px-3 py-1 rounded-full'>
                                <BsCheck2Circle size={20} style={{color:'#15803d'}} />
                            </button>
                            :
                            <button className='px-3 py-1 rounded-full'
                                onClick={ChangeProgram}
                            >
                                <BsCircle size={20} style={{color:'#6b7280'}} />
                            </button>
                        }
                        <p className='text-sm'>Use this program</p>
                    </div>
                    <div className='flex gap-4'>
                    { programIndex > 0 ?
                        <div className='flex flex-col gap-2 items-center'>
                            <button className='shadow-md bg-blue-500 px-3 py-1 text-blue-100 rounded-lg'
                                onClick={()=>setProgramIndex(programIndex-1)}
                            ><BsChevronLeft size={20} /></button>
                            <p className='text-sm'>{programs[programIndex-1].name}</p>
                        </div>
                        :
                        <></>
                    }
                    { programIndex < programs.length - 1 ?
                        <div className='flex flex-col gap-2 items-center'>
                            <button className='shadow-md bg-blue-500 px-3 py-1 text-blue-100 rounded-lg'
                                onClick={()=>setProgramIndex(programIndex+1)}
                            ><BsChevronRight size={20} /></button>
                            <p className='text-sm'>{programs[programIndex+1].name}</p>
                        </div>
                        :
                        <></>
                    }
                    </div>
                </div>
                <div className='w-full text-center'>
                    <p className='font-semibold'>{programs[programIndex].name}</p>
                    <p className='text-sm break-words'>{programs[programIndex].description}</p>
                </div>
                <div className='flex flex-col gap-4 w-full'>
                    {programs[programIndex].schedule.map((day,i)=>
                        <div key={`${i}-${day}`} className='border border-gray-400 bg-stone-50 rounded-md shadow-sm'> 
                            <WorkoutList currentWorkout={workouts[day]} exercises={exercises}
                                setPrograms={setPrograms} setCurrentProgram={setCurrentProgram} workouts={workouts}
                                profile={profile} setWorkouts={setWorkouts} day={day} i={i}
                            />
                            <PostExercise currentWorkout={workouts[day]} currentWorkoutIndex={day} setCurrentWorkout={setCurrentWorkout}
                                username={profile.username} exercises={exercises}
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
