"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Avatar, Paper } from '@mui/material'
import { BsCalendar, BsGraphUp, BsPencil } from 'react-icons/bs'
import { BiDumbbell} from 'react-icons/bi'
import axios from 'axios'
import Pagenav from '../components/Pagenav'

export default function Home() {
    const [loading, setLoading] = useState(true)
    const [current, setCurrent] = useState(null)
    const [programs, setPrograms] = useState([])

    useEffect(()=>{
        axios.get('/api/user')
        .then(res=>{
          setLoading(false)
          setPrograms(res.data.documents[0].programs)
          const currentIndex = res.data.documents[0].currentProgram
          setCurrent(res.data.documents[0].programs[currentIndex])
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
            <Pagenav page='schedule' />
        </main>
    )
}
