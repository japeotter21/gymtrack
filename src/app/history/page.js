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
    const {activeUser} = useContext(AppContext)

    useEffect(()=>{
        if (activeUser)
        {
            axios.get('/api/workouts')
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
                console.log(res.data)
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
            <Pagenav page='schedule' />
        </main>
    )
}
