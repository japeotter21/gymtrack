"use client"
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Pagenav from '../components/Pagenav'
import { BsCheck2, BsCheck2Circle, BsChevronLeft, BsChevronRight, BsCircle } from 'react-icons/bs'
import { Checkbox } from '@mui/material'

export default function Workouts() {
    const [loading, setLoading] = useState(true)
    const [currentProgram, setCurrentProgram] = useState(null)
    const [programIndex, setProgramIndex] = useState(0)
    const [programs, setPrograms] = useState([])
    const [workouts, setWorkouts] = useState([])
    const [exercises, setExercises] = useState([])

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
        })
        .catch(err=>{
          console.error(err.message)
        })
    },[])

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
                <div className='flex justify-between gap-8 items-center'>
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
                        <div key={`${i}-${day}`} className='p-2 border border-gray-400 bg-stone-50 rounded-md shadow-sm'> 
                            <p className='border-b-2 mb-1'>{workouts[day].name}</p>
                            <div className='divide-y flex flex-col gap-4'>
                            { workouts[day].exercises.map((ex,ind)=>
                                <div key={ex.name} className='text-sm'>
                                    <p>{ex.name}</p>
                                    <div className='flex flex-col gap-1 text-sm text-gray-500'>
                                        <div className='grid grid-cols-2 gap-x-6'>
                                            <p>Sets</p>
                                            <p>Reps</p>
                                            <select defaultValue={ex.target.sets.length} className='border border-gray-400 rounded-md'>
                                                {[1,2,3,4,5,6].map((num,setNum)=>
                                                    <option value={num} key={setNum}>{num}</option>
                                                )}
                                            </select>
                                            <select defaultValue={ex.target.sets[0][0]} className='border border-gray-400 rounded-md'>
                                                {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map((num,setNum)=>
                                                    <option value={num} key={setNum}>{num}</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Pagenav page='workouts' />
        </main>
    )
}
