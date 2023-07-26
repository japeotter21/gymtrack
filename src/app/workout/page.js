"use client"
import React, { useState, useEffect, use } from 'react'
import { BsPause, BsPauseBtn, BsPlay } from 'react-icons/bs'
import axios from 'axios'
import { useRouter } from 'next/navigation';

export default function Workout() {
    const [profile, setProfile] = useState({})
    const [loading, setLoading] = useState(true)
    const [currentProgram, setCurrentProgram] = useState(null)
    const [currentWorkout, setCurrentWorkout] = useState(null)
    const [currentWorkoutIndex, setCurrentWorkoutIndex] = useState(0)
    const [currentDay, setCurrentDay] = useState(0)
    const [exercises, setExercises] = useState([])
    const [editNotes, setEditNotes] = useState('')
    const [complete, setComplete] = useState([])
    const [workoutComplete, setWorkoutComplete] = useState(false)
    const [pause, setPause] = useState(false)
    const router = useRouter()

    useEffect(()=>{
        axios.get('/api/user')
        .then(res=>{
        setProfile(res.data.documents[0].profile)
        setLoading(false)
        const currentIndex = res.data.documents[0].currentProgram
        setCurrentProgram(res.data.documents[0].programs[currentIndex])
        const dayIndex = res.data.documents[0].currentDay
        const workoutIndex = res.data.documents[0].programs[currentIndex].schedule[dayIndex]
        setCurrentWorkout(res.data.documents[0].workouts[workoutIndex])
        setCurrentWorkoutIndex(workoutIndex)
        setCurrentDay(dayIndex)
        setExercises(res.data.documents[0].exercises)
        })
        .catch(err=>{
        console.error(err.message)
        })
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


    function SubmitSetForm(e) {
        e.preventDefault()
        const exerciseIndex = e.target.id.split('-')[1]
        const currentExercise = currentWorkout.exercises[exerciseIndex]
        const postLength = currentExercise.target.sets.length
        const formLength = currentExercise.target.sets.flat()
        let postArr = Array.from({length: postLength},(x)=>0)
        formLength.forEach((item,id)=>{
            if(id % 2 === 1)
            {
                const newResult = [parseInt(e.target[id-1].value),parseInt(e.target[id].value)]
                postArr[Math.floor(id/2)] = newResult
            }
        })
        const postObj = {
            sets: postArr,
            notes: editNotes,
            reminder: "",
            date: new Date().getTime()
        }
        const allExercisesIndex = exercises.findIndex(ex=>ex.name === currentExercise.name)

        axios.post('/api/exercise',postObj,{ params: {id: exerciseIndex, user:profile.username, workout:currentWorkoutIndex, log:1, exercise: allExercisesIndex}})
        .then(res=>{
            const storeComplete = [...complete]
            storeComplete.push(exerciseIndex)
            setComplete(storeComplete)
        })
    }

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
            <div className='flex justify-between w-11/12'>
                <button className='rounded-full shadow-md bg-gradient-to-r from-red-600 to-red-500 px-5 py-2'
                    onClick={Cancel}
                >Cancel</button>
                { pause ? 
                    <button className='rounded-full shadow-md bg-gradient-to-r from-green-600 to-green-500 px-5 py-2'
                        onClick={()=>setPause(false)}
                    >Resume</button>
                :
                    <button className='rounded-full shadow-md bg-gradient-to-r from-green-600 to-green-500 px-5 py-2'
                        onClick={()=>setPause(true)}
                    >Pause</button>
                }
            </div>
            { currentWorkout.exercises.map((lift,id)=>
                <>
                { complete.includes(id.toString()) ?
                    <></>
                :
                    <div className='w-full lg:w-1/2 flex-col gap-3 items-center border border-gray-300 rounded-lg bg-stone-50 px-4 py-1' key={id}>
                        <p className='text-lg font-semibold text-center'>{lift.name}</p>
                        <div className='grid grid-cols-3 mt-2 gap-2 items-center'>
                            <p className='text-xs text-gray-400'>Set</p>
                            <p className='text-xs text-gray-400'>Reps</p>
                            <p className='text-xs text-gray-400'>Weight</p>
                        </div>
                        <form id={`lift-${id}`} onSubmit={(e)=>SubmitSetForm(e)}>
                            {lift.target.sets.map((set,index)=>
                                <div key={index} className='grid grid-cols-3 my-1 gap-2 items-center'>
                                <p className='text-sm'>{index+1}</p>
                                <input type="number" id={`${lift.name}set${index+1}`} name={`${lift.name}set${index+1}`} defaultValue={set[0]}
                                    className='border border-gray-400 rounded-md px-2'
                                />
                                <input type="number" id={`${lift.name}set${index+1}`} name={`${lift.name}set${index+1}`} defaultValue={set[1]}
                                    className='border border-gray-400 rounded-md px-2'
                                />
                                </div>
                            )}
                            <button type="submit" className='bg-gradient-to-r to-slate-400 from-slate-700 rounded-full px-5 py-1 w-3/4 block mx-auto mt-4 mb-2 text-white'>Complete</button>
                        </form>
                    </div>
                }
                </>
            )}
        </main>
    )
}
