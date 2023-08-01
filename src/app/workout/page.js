"use client"
import React, { useState, useEffect } from 'react'
import { BsPause, BsPauseBtn, BsPlay } from 'react-icons/bs'
import axios from 'axios'
import { useRouter } from 'next/navigation';
import LiveExerciseLog from '../components/LiveExerciseLog';

export default function Workout() {
    const [profile, setProfile] = useState({})
    const [loading, setLoading] = useState(true)
    const [currentProgram, setCurrentProgram] = useState(null)
    const [currentWorkout, setCurrentWorkout] = useState(null)
    const [currentWorkoutIndex, setCurrentWorkoutIndex] = useState(0)
    const [currentDay, setCurrentDay] = useState(0)
    const [exercises, setExercises] = useState([])
    const [complete, setComplete] = useState([])
    const [workoutComplete, setWorkoutComplete] = useState(false)
    const [pause, setPause] = useState(false)
    const router = useRouter()

    useEffect(()=>{
        const endpoints = ['/api/user', '/api/exercise', '/api/workouts']
        axios.all(endpoints.map((endpoint) => axios.get(endpoint))).then(
        axios.spread((user, exercise, workout) => {
            setProfile(user.data.profile)
            setExercises(exercise.data.exercises)
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
        if(sessionStorage.getItem('completed'))
        {
            setComplete(JSON.parse(sessionStorage.getItem('completed')))
        }
    },[])

    useEffect(()=>{
        if(complete.length > 0)
        {
            if(JSON.stringify(complete) !== sessionStorage.getItem('completed'))
            {
                sessionStorage.setItem('completed',JSON.stringify(complete))
            }
            if(currentWorkout)
            {
                if(complete.length === currentWorkout.exercises.length)
                {
                    setWorkoutComplete(true)
                }
            }
        }
    },[complete])

    useEffect(()=>{
        if(workoutComplete)
        {
            let dayNum = 0 
            if (currentDay !== currentProgram.schedule.length - 1)
            {
                dayNum = currentDay + 1
            }
            const postObj = {day: dayNum}
            axios.post('/api/finished',postObj,{ params: {user:profile.username}})
            .then(res=>{
                router.push('/')
            })
            .catch(err=>{
                console.error(err.message)
            })
        }
    },[workoutComplete])

    function Cancel() {
        sessionStorage.removeItem('completed')
        router.push('/')
    }

    if(loading)
    {
        return (
            <></>
        )
    }

    return (
        <main className="flex min-h-screen flex-col items-center pt-6 pb-12 px-2 lg:p-12 gap-4">
            <div className='flex justify-between w-full'>
                <button className='rounded-lg shadow-md border border-red-300 bg-slate-100 hover:text-red-600 px-7 py-2'
                    onClick={Cancel}
                >Cancel</button>
                { pause ? 
                    <button className='rounded-lg shadow-md border border-green-300 bg-slate-100 hover:text-green-500 px-7 py-2'
                        onClick={()=>setPause(false)}
                    >Resume</button>
                :
                    <button className='rounded-lg shadow-md border border-green-300 bg-slate-100 hover:text-green-500 px-7 py-2'
                        onClick={()=>setPause(true)}
                    >Pause</button>
                }
            </div>
            { currentWorkout.exercises.map((lift,id)=>
                <>
                { complete.includes(id.toString()) ?
                    <></>
                :
                    <LiveExerciseLog lift={lift} id={id} complete={complete} setComplete={setComplete} currentWorkout={currentWorkout} currentWorkoutIndex={currentWorkoutIndex}
                        profile={profile} exercises={exercises}
                    />
                }
                </>
            )}
        </main>
    )
}
