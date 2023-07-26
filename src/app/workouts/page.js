"use client"
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Pagenav from '../components/Pagenav'

export default function Workouts() {
    const [loading, setLoading] = useState(true)
    const [currentProgram, setCurrentProgram] = useState(null)
    const [programs, setPrograms] = useState([])
    const [workouts, setWorkouts] = useState([])
    const [exercises, setExercises] = useState([])

    useEffect(()=>{
        axios.get('/api/user')
        .then(res=>{
          setLoading(false)
          setPrograms(res.data.documents[0].programs)
          const currentIndex = res.data.documents[0].currentProgram
          setCurrentProgram(res.data.documents[0].programs[currentIndex])
          setWorkouts(res.data.documents[0].workouts)
          setExercises(res.data.documents[0].exercises)
        })
        .catch(err=>{
          console.error(err.message)
        })
    },[])

    if(loading)
    {
        return (
            <></>
        )
    }

    return (
        <main className="flex min-h-screen flex-col items-center py-6 lg:pt-12 px-2 lg:p-12 gap-4">
            <p>Current Program: {currentProgram.name}</p>
            { workouts.map((item,id)=>
            <div className='w-full lg:w-1/2 flex-col gap-2 items-center border border-gray-300 rounded-lg bg-stone-50 px-4 py-1'
                key={item.name}
            >
                <p>{item.name}</p>
                { item.exercises.map((ex,ind)=>
                    <div key={ex.name}>
                        <p className='text-sm'>{ex.name}</p>
                        <div className='flex'>
                        { ex.target.sets.map((set,index)=>
                            <p className='text-sm' key={`${ex.name}-${index}`}>{set[0]}x{set[1]}</p>
                        )}
                        </div>
                    </div>
                )}
                <select>
                    {exercises.map((ex,id)=>
                        <option value={ex.name} key={id}>{ex.name}</option>
                    )}
                </select>
            </div>
            )}
            <Pagenav page='workouts' />
        </main>
    )
}
