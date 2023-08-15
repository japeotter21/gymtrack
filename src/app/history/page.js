"use client"
import React, { useState, useEffect, useContext } from 'react'
import Image from 'next/image'
import { Avatar, Paper } from '@mui/material'
import { BsCalendar, BsGraphUp, BsPencil } from 'react-icons/bs'
import { BiDumbbell} from 'react-icons/bi'
import axios from 'axios'
import Pagenav from '../components/Pagenav'
import AppContext from '../AppContext'
import { redirect } from 'next/navigation'

export default function Schedule() {
    const [loading, setLoading] = useState(true)
    const [current, setCurrent] = useState(null)
    const [programs, setPrograms] = useState([])
    const [workouts, setWorkouts] = useState([])
    const {activeUser} = useContext(AppContext)

    useEffect(()=>{
        if (activeUser)
        {
            axios.get('/api/workouts',{params:{user:activeUser}})
            .then(res=>{
            setLoading(false)
            setPrograms(res.data.programs)
            const currentIndex = res.data.currentProgram
            setCurrent(res.data.programs[currentIndex])
            })
            .catch(err=>{
            console.error(err.message)
            })
            axios.post('api/history',null,{params:{user:activeUser}})
            .then(res=>{
                setWorkouts(res.data)
            })
        }
        else
        {
            redirect('/login')
        }
    },[])

    if(loading)
    {
        return (
            <></>
        )
    }

    return (
        <main className="flex min-h-screen flex-col items-center py-6 lg:pt-12 px-2 lg:p-12 gap-4">
            { workouts.map((item,id)=>
                <div className='shadow-md bg-stone-50 rounded-md w-3/4 p-2' key={id}>
                    <div className='flex justify-between items-center px-1 mb-1'>
                        <p className='font-semibold'>{item.title}</p>
                        <p className='text-sm'>{new Date(parseInt(item.date)).toDateString()}</p>
                    </div>
                    <div>
                        { item.results.map((ex,ind)=>
                            ex.rpe > 0 ?
                            <div className='border border-neutral-200 border-b-0 rounded-sm' key={`${id}-${ind}`}>
                                <p className='text-sm font-semibold p-1 bg-slate-100'>{ex.name}</p>
                                <hr className='mb-2' />
                                <div className='flex divide-x divide-gray-400'>
                                {ex.sets.map((set,index)=>
                                    <p className='text-sm px-2 pb-1' key={`${id}-${ind}-${index}`}>{set.weight}&nbsp;x&nbsp;{set.reps}</p>
                                )}
                                </div>
                            </div>    
                            :
                            <></>
                        )}
                    </div>
                </div>
            )}
            <Pagenav page='history' />
        </main>
    )
}
