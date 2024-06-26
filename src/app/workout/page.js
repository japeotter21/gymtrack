"use client"
import React, { useState, useEffect, useContext, useRef } from 'react'
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
import PostExercise from '../components/EditWorkout';

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
    const [groups, setGroups] = useState([])
    const [supersets, setSupersets] = useState([])
    const [startTime, setStartTime] = useState(null)
    const [updating, setUpdating] = useState(false)
    const router = useRouter()
    const {activeUser, Refresh, paused, setPaused} = useContext(AppContext)
    const prevHistory = usePrevious(complete)

    useEffect(()=>{
        if(activeUser)
        {
            const endpoints = ['/api/user', '/api/exercise', '/api/programs', 'api/history']
            axios.all(endpoints.map((endpoint) => axios.get(endpoint, {params: {user:activeUser}}))).then(
            axios.spread((user, exercise, programs, history) => {
                setProfile(user.data.profile)
                setExercises(exercise.data.exercises)
                const currentIndex = user.data.currentProgram
                setCurrentProgram(programs.data.programs[currentIndex])
                const dayIndex = user.data.currentDay
                const workoutIndex = programs.data.programs[currentIndex].schedule[dayIndex]
                setCurrentWorkoutIndex(dayIndex)
                setCurrentWorkout(workoutIndex)
                setCurrentDay(dayIndex)
                if(localStorage.getItem('startTime') && localStorage.getItem('startTime') !== undefined)
                {
                    setStartTime(localStorage.getItem('startTime'))
                }
                else
                {
                    const timeNow = new Date().getTime()
                    setStartTime(timeNow)
                }
                setComplete(history.data)
                setLoading(false)
                setPaused(false)
            })
            )
        }
        else
        {
          Refresh()
        }
    },[activeUser])    

    useEffect(()=>{
        if(complete)
        {
            let groupTemp = []
            complete.forEach((ex,id)=>{
                if(id > 0)
                {
                    if(groupTemp.findIndex(group => group === ex.name.split('-')[0]) < 0)
                    {
                        groupTemp.push(ex.name.split('-')[0])
                    }
                }
                else
                {
                    groupTemp.push(ex.name.split('-')[0])
                }
            })
            setGroups(groupTemp)
            console.log(prevHistory, complete)
            if(prevHistory?.length !== complete.length && prevHistory?.length > 0)
            {
                if(complete.length > prevHistory.length)
                {
                    complete.forEach((item,index)=>{
                        if(prevHistory.findIndex(ex=>ex.name === item.name) < 0)
                        {
                            axios.put('api/history', item, { params: { user: activeUser } })
                        }
                    })
                }
                else
                {
                    prevHistory.forEach((item,index)=>{
                        if(complete.findIndex(ex=>ex.name === item.name) < 0)
                        {
                            axios.put('api/history', item, { params: { user: activeUser, delete: true } })
                        }
                    })

                }
            }
        }
    },[complete])

    useEffect(()=>{
        router.prefetch('/')
    },[router])

    function Cancel() {
        axios.delete('api/history', {params: { user: activeUser }})
        .then(res=>{
            localStorage.clear()
            router.push('/')
        })
    }

    function usePrevious(value) {
        const ref = useRef();
        useEffect(() => {
          ref.current = value; //assign the value of ref to the argument
        },[value]); //this code will run when the value of 'value' changes
        return ref.current; //in the end, return the current ref value.
    }

    function SaveWorkout() {
        let dayNum = 0 
        setFinishing(true)
        if (currentDay !== currentProgram.schedule.length - 1)
        {
            dayNum = currentDay + 1
        }
        const endTime = new Date().getTime()
        const finishObjFull = {
            title: currentWorkout.name,
            date: startTime,
            end: endTime,
            results: complete
        } 
        const postObj = {
            day: dayNum,
            workout: finishObjFull
        }
        const dayUpdate = {newDay: dayNum}
        localStorage.removeItem('startTime')
        axios.put('/api/workouts', dayUpdate, { params: {user:activeUser}})
        axios.post('api/finished',postObj, { params: { user: activeUser }})
        .then(res=>{
            axios.delete('api/history', { params: { user: activeUser }})
            .then(res=>{
                setFinishing(false)
                router.push('/history')
            })
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
        <main className="grid min-h-screen place-items-center pb-12 lg:p-12">
            <div className='w-full bg-[#f4f4f5] z-10 py-4 fixed bottom-0'>
                <div className='flex justify-between w-5/6 mx-auto px-2'>
                    <button className='rounded-md text-red-600 bg-red-100 px-4 py-2'
                        onClick={Cancel}
                    >Cancel</button>
                    <button className='rounded-md text-sky-600 bg-sky-100 px-4 py-2'
                        onClick={()=>{setPaused(true);router.push('/')}}
                    >Pause</button>
                    { complete.length > 0 ? 
                        <button className='rounded-md text-green-600 bg-green-100 px-4 py-2'
                            onClick={()=>setWorkoutComplete(true)}
                        >Finish</button>
                    :
                        <button className='rounded-md text-neutral-400 border border-neutral-200 px-4 py-2'
                            disabled
                        >Finish</button>
                    }
                </div>
            </div>
            <div className='flex flex-col items-center gap-4 w-5/6 px-2 pt-8 pb-12'>
                { groups.map((lift,id)=>
                <>
                    <LiveExerciseLog key={`exercise${id}`} lift={lift} id={id} complete={complete} setComplete={setComplete} currentWorkout={currentWorkout} currentWorkoutIndex={currentWorkoutIndex}
                        profile={profile} exercises={exercises} username={activeUser} setExercises={setExercises} setCurrentWorkout={setCurrentWorkout}
                        setActiveSlide={setActiveSlide} activeSlide={activeSlide} updating={updating} setUpdating={setUpdating}
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
                        <DialogButton text='Finish Workout' loading={updating||finishing} loadingText={updating ? 'Saving...' : 'Finishing Up...'} type='button' action={SaveWorkout} />
                    </div>
                </div>
            </Dialog>
        </main>
    )
}
