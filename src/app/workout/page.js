"use client"
import React, { useState, useEffect, useContext } from 'react'
import { BsChevronLeft, BsChevronRight, BsCircle, BsCircleFill, BsPause, BsPauseBtn, BsPlay } from 'react-icons/bs'
import axios from 'axios'
import { useRouter } from 'next/navigation';
import LiveExerciseLog from '../components/LiveExerciseLog';
import AppContext from '../AppContext'
import { redirect } from 'next/navigation'
import { FinishWorkout } from '@/services/services';
import { Dialog } from '@mui/material';
import DialogButton from '../components/DialogButton';
import Pagenav from '../components/Pagenav';

export default function Workout() {
    const [profile, setProfile] = useState({})
    const [loading, setLoading] = useState(true)
    const [currentProgram, setCurrentProgram] = useState(null)
    const [currentWorkout, setCurrentWorkout] = useState(null)
    const [currentWorkoutIndex, setCurrentWorkoutIndex] = useState(0)
    const [currentDay, setCurrentDay] = useState(0)
    const [exercises, setExercises] = useState([])
    const [complete, setComplete] = useState(null)
    const [workoutComplete, setWorkoutComplete] = useState(false)
    const [finishing, setFinishing] = useState(false)
    const [activeSlide, setActiveSlide] = useState(0)
    const [supersets, setSupersets] = useState([])
    const [finishObj, setFinishObj] = useState({})
    const router = useRouter()
    const {activeUser, Refresh} = useContext(AppContext)


    useEffect(()=>{
        if(activeUser)
        {
            const endpoints = ['/api/user', '/api/exercise', '/api/workouts']
            axios.all(endpoints.map((endpoint) => axios.get(endpoint, {params: {user:activeUser}}))).then(
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
                setComplete(workout.data.inProgress.results)
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
        if(workoutComplete)
        {
            axios.get('api/workouts')
            .then(res=>{
                setFinishObj(res.data.inProgress)
            })
        }
    },[workoutComplete])

    useEffect(()=>{
        router.prefetch('/')
    },[router])

    function Cancel() {
        router.push('/')
    }

    function SaveWorkout() {
        let dayNum = 0 
        setFinishing(true)
        if (currentDay !== currentProgram.schedule.length - 1)
        {
            dayNum = currentDay + 1
        }
        const endTime = new Date().getTime()
        const finishObjFull = Object.assign({ end: endTime },  finishObj)
        const postObj = {
            day: dayNum,
            workout: finishObjFull
        }
        axios.post('api/finished',postObj,{ params: {user: activeUser}})
        .then(res=>{
            setFinishing(false)
            router.push('/history')
        })
        .catch(err=>{
            console.error(err.message)
        })
    }

    if(loading)
    {
        return (
            <></>
        )
    }

    return (
        <main className="grid min-h-screen place-items-center pt-6 pb-12 px-2 lg:p-12">
            <div className='flex justify-between w-5/6 mx-auto my-4'>
                <button className='rounded-lg border border-red-400 shadow-md bg-stone-50 text-red-600 px-7 py-2'
                    onClick={Cancel}
                >Cancel</button>
                {/* { pause ? 
                    <button className='rounded-lg shadow-md bg-stone-50 border border-green-500 text-green-600 px-7 py-2'
                        onClick={()=>setPause(false)}
                    >Resume</button>
                :
                    <button className='rounded-lg shadow-md bg-stone-50 border border-green-500 text-green-600 px-7 py-2'
                        onClick={()=>setPause(true)}
                    >Pause</button>
                } */}
                { complete.length > 0 ? 
                    <button className='rounded-lg shadow-md bg-stone-50 border border-green-500 text-green-600 px-7 py-2'
                        onClick={()=>setWorkoutComplete(true)}
                    >Finish</button>
                :
                    <button className='rounded-lg shadow-md bg-stone-50 border border-neutral-300 text-neutral-400 px-7 py-2'
                        disabled
                    >Finish</button>
                }
            </div>
            <div className='flex flex-col items-center gap-4 w-5/6'>
                { currentWorkout.exercises.map((lift,id)=>
                <>
                    <LiveExerciseLog key={`exercise${id}`} lift={lift} id={id} complete={complete} setComplete={setComplete} currentWorkout={currentWorkout} currentWorkoutIndex={currentWorkoutIndex}
                        profile={profile} exercises={exercises} username={activeUser} setExercises={setExercises} setCurrentWorkout={setCurrentWorkout}
                        setActiveSlide={setActiveSlide} activeSlide={activeSlide}
                    />
                </>
                )}
            </div>
            <Dialog open={workoutComplete} onClose={()=>setWorkoutComplete(false)}>
                <div className='px-4 py-3'>
                    <p className='font-semibold mb-2'>Workout Complete!</p>
                    <p className='text-sm'>This will record all saved exercise data.</p>
                    <p className='text-sm'>Any unsaved data will be lost.</p>
                    <div className='flex justify-between mt-4'>
                        <button className='border border-neutral-300 shadow-md rounded-md px-3 py-1'
                            onClick={()=>setWorkoutComplete(false)}
                        >Cancel</button>
                        <DialogButton text='Finish Workout' loading={finishing} loadingText='Saving...' type='button' action={SaveWorkout} />
                    </div>
                </div>
            </Dialog>
        </main>
    )
}
