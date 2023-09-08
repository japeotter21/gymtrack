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
    const [finishObj, setFinishObj] = useState(null)
    const [activeSlide, setActiveSlide] = useState(0)
    const [supersets, setSupersets] = useState([])
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
                let done = false
                workout.data.inProgress.results.forEach((item,id)=>item.rpe > 0 ? done = true : <></>)
                if(done)
                {
                    setFinishObj(workout.data.inProgress)
                }
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
            axios.get('api/workouts',{ params: {user: activeUser }})
            .then(res=>{
                let done = false
                res.data.inProgress.results.forEach((item,id)=>item.name !== "" ? done = true : <></>)
                if(done)
                {
                    let currentIP = res.data.inProgress
                    setFinishObj(currentIP)
                }
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
        const postObj = Object.assign({end: endTime},finishObj)
        FinishWorkout(dayNum, activeUser, false, postObj)
        .then(r=>{
            setFinishing(false)
            router.push('/history')
        })
    }

    if(loading)
    {
        return (
            <></>
        )
    }

    return (
        <main className="flex min-h-screen flex-col items-center pt-6 pb-12 px-2 lg:p-12 gap-4">
            <div className='w-full'>
                { currentWorkout.exercises.map((lift,id)=>
                <>
                    { activeSlide === id && !currentWorkout?.superset.includes(currentWorkout.exercises[id-1]) ?
                            <LiveExerciseLog key={`exercise${id}`} lift={lift} id={id} complete={complete} setComplete={setComplete} currentWorkout={currentWorkout} currentWorkoutIndex={currentWorkoutIndex}
                                profile={profile} exercises={exercises} username={activeUser} setExercises={setExercises} setFinishObj={setFinishObj} setCurrentWorkout={setCurrentWorkout}
                                setActiveSlide={setActiveSlide} activeSlide={activeSlide}
                            />
                        :
                            <div className='h-11/12' key={id}></div>
                    }
                    { currentWorkout?.superset.includes(lift) && activeSlide === id ?
                        <LiveExerciseLog key={`exercise${id+1}`} lift={currentWorkout.exercises[id+1]} id={id+1} complete={complete} setComplete={setComplete}
                                currentWorkout={currentWorkout} currentWorkoutIndex={currentWorkoutIndex} profile={profile} exercises={exercises} username={activeUser}
                                setExercises={setExercises} setFinishObj={setFinishObj} setCurrentWorkout={setCurrentWorkout} setActiveSlide={setActiveSlide} activeSlide={activeSlide}
                            />
                    :
                    <></>
                    }
                </>
                )}
            </div>
            <div className='w-max mx-auto flex gap-2 block justify-center text-neutral-500 items-center my-3'>
                {activeSlide > 0 ?
                    <button className='text-green-600 border rounded-sm bg-stone-50 px-2 py-1 shadow-sm mr-2'
                        onClick={()=>setActiveSlide(activeSlide-1)}
                    ><BsChevronLeft /></button>
                    :
                    <button disabled className='text-neutral-400'><BsChevronLeft /></button>
                }
                {currentWorkout.exercises.map((item,id)=>
                    <div key={id}>
                        {currentWorkout?.superset.includes(currentWorkout.exercises[id-1]) ?
                            <></>
                        : id === activeSlide ?
                            <BsCircleFill size={15} style={{color:'#16a34a'}} />
                        :
                            <BsCircle size={15} />
                        }
                    </div>
                )}
                {activeSlide < currentWorkout.exercises.length - 1 ?
                    <button className='text-green-600 border rounded-sm bg-stone-50 px-2 py-1 shadow-sm ml-2'
                    onClick={()=>setActiveSlide((activeSlide+1) % currentWorkout.exercises.length)}
                    ><BsChevronRight /></button>
                    :
                    <button disabled className='text-neutral-400'><BsChevronRight /></button>
                }
            </div>
            <div className='flex justify-between w-5/6 lg:w-1/2'>
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
                { finishObj ? 
                    <button className='rounded-lg shadow-md bg-stone-50 border border-green-500 text-green-600 px-7 py-2'
                        onClick={()=>setWorkoutComplete(true)}
                    >Finish</button>
                :
                    <button className='rounded-lg shadow-md bg-stone-50 border border-neutral-300 text-neutral-400 px-7 py-2'
                        disabled
                    >Finish</button>
                }
            </div>
            <Dialog open={finishObj !== null && workoutComplete} onClose={()=>setWorkoutComplete(false)}>
                <div className='px-4 py-3'>
                    { finishObj ? 
                    <>
                        <p className='font-semibold mb-2'>Workout Complete!</p>
                        <p className='text-sm'>This will record all saved exercise data.</p>
                        <p className='text-sm'>Any unsaved data will be lost.</p>
                        <div className='flex justify-between mt-4'>
                            <button className='border border-neutral-300 shadow-md rounded-md px-3 py-1'
                                onClick={()=>setWorkoutComplete(false)}
                            >Cancel</button>
                            <DialogButton text='Finish Workout' loading={finishing} loadingText='Saving...' type='button' action={SaveWorkout} />
                        </div>
                    </>
                    :
                    <>
                        <p className='font-semibold'>No Workout Data Entered</p>
                        <p className='text-sm'>Please save exercise results before finishing workout.</p>
                    </>
                    }
                </div>
            </Dialog>
        </main>
    )
}
