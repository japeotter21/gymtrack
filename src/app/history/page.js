"use client"
import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import Pagenav from '../components/Pagenav'
import AppContext from '../AppContext'
import { redirect } from 'next/navigation'
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs'

export default function History() {
    const [loading, setLoading] = useState(true)
    const [workouts, setWorkouts] = useState([])
    const [filter,setFilter] = useState('All')
    const [titles, setTitles] = useState([])
    const [appointments, setAppointments] = useState([])
    const [view, setView] = useState(null)
    const [displayTime, setDisplayTime] = useState('')
    const [calendarDays, setCalendarDays] = useState([])
    const [nextWorkout, setNextWorkout] = useState({})
    const {activeUser, Refresh} = useContext(AppContext)
    const currentDate = new Date();
    const [month, setMonth] = useState(currentDate.getMonth())
    const year = currentDate.getFullYear();
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ]

    useEffect(()=>{
        const startDay = new Date(year, month, 1).getDay()
        const endDate = new Date(year, month + 1, 0).getDate()
        const endDay = new Date(year,month, endDate).getDay()
        const blankDays = Array.from({length:startDay},x=>0)
        const endDaysLength = 6 - endDay
        const endBlankDays = Array.from({length:endDaysLength},x=>0)
        const monthDays = Array.from({length:endDate},(x,i)=>new Date(`${month+1}/${i+1}/${year}`).getTime())
        const daysTemp = blankDays.length > 0 ? blankDays.concat(monthDays) : monthDays
        const newTemp = endBlankDays.length > 0 ? daysTemp.concat(endBlankDays) : daysTemp
        setCalendarDays(newTemp)
    },[month])

    useEffect(()=>{
        if (activeUser)
        {
            axios.post('api/history',null,{params:{user:activeUser}})
            .then(res=>{
                const resTemp = res.data
                const temptitles = []
                const appointstemp = []
                resTemp.forEach((item,id)=>{
                    temptitles.push(item.title)
                    const appointObj = {
                        title: item.title,
                        ind: id,
                        startDate: new Date(parseInt(item.date)).toISOString(),
                        endDate: item.end ? new Date(parseInt(item.end)).toISOString() : new Date(parseInt(item.date)+60*60*1000).toISOString()
                    }
                    appointstemp.push(appointObj)
                })
                setAppointments(appointstemp)
                const titleArr = [...new Set(temptitles)]
                setTitles(titleArr)
                setWorkouts(resTemp.reverse())
                setLoading(false)
            })
            .catch(err=>{
                console.error(err.message)
            })
            axios.get('api/workouts',{params:{user:activeUser}})
            .then(res=>{
                const workoutDay = res.data.currentDay
                const currentIndex = res.data.currentProgram
                const currentProgram = res.data.programs[currentIndex]
                const workoutIndex = currentProgram.schedule[workoutDay]
                setNextWorkout(res.data.workouts[workoutIndex])
            })
        }
        else
        {
            Refresh()
        }
    },[activeUser])

    useEffect(()=>{
        if (filter !== 'All')
        {
            const appointstemp = []
            let workoutsTemp = [...workouts]
            workoutsTemp.reverse().forEach((item,id)=>{
                if(filter === item.title)
                {
                    const appointObj = {
                        title: item.title,
                        ind: id,
                        startDate: new Date(parseInt(item.date)).toISOString(),
                        endDate: item.end ? new Date(parseInt(item.end)).toISOString() : new Date(parseInt(item.date)+60*60*1000).toISOString()
                    }
                    appointstemp.push(appointObj)
                    setAppointments(appointstemp)
                }
            })
        }
        else
        {
            const appointstemp = []
            let workoutsTemp = [...workouts]
            workoutsTemp.reverse().forEach((item,id)=>{
                {
                    const appointObj = {
                        title: item.title,
                        ind: id,
                        startDate: new Date(parseInt(item.date)).toISOString(),
                        endDate: new Date(parseInt(item.date)+60*60*1000).toISOString()
                    }
                    appointstemp.push(appointObj)
                    setAppointments(appointstemp)
                }
            })
        }

    },[filter])

    useEffect(()=>{
        if(view !== null)
        {
            const endTime = parseInt(view.end)
            const startTime = parseInt(view.date)
            const duration = (endTime - startTime) / 1000
            if(duration !== NaN)
            {
                const hours = Math.floor(duration / 3600)
                const minutes = Math.round((duration / 60)) % 60
                setDisplayTime(`${hours}:${minutes.toLocaleString('en-US',{minimumIntegerDigits:2})}`)
            }
            else
            {
                setDisplayTime('')
            }
        }
    },[view])

    if(loading)
    {
        return (
            <></>
        )
    }

    return (
        <main className="flex min-h-screen flex-col items-center py-6 lg:pt-12 px-2 lg:p-12 gap-4">
            {/* <select value={filter} onChange={(e)=>setFilter(e.target.value)}>
                <option value="All">All</option>
                {titles.map((item,id)=>
                    <option value={item} key={id}>{item}</option>
                )}
            </select> */}
            {month !== currentDate.getMonth() ? <button className='text-xs text-blue-500' onClick={()=>setMonth(currentDate.getMonth())}>Today</button> : <></>}
            <div className='flex gap-4'>
                <button className='border bg-white px-2 py-1 rounded-sm shadow-sm' onClick={()=>setMonth(month-1)}><BsChevronLeft /></button>
                <p className='font-semibold text-lg'>{months[month]}</p>
                <button className='border bg-white px-2 py-1 rounded-sm shadow-sm' onClick={()=>setMonth(month+1)}><BsChevronRight /></button>
            </div>
            <div className='grid grid-cols-7 bg-white w-full divide-x divide-y border rounded-sm shadow-md'>
                <div className='col-span-7 grid grid-cols-7 border py-1'>
                    <p className='text-sm text-center text-neutral-400'>Sun</p>
                    <p className='text-sm text-center text-neutral-400'>Mon</p>
                    <p className='text-sm text-center text-neutral-400'>Tue</p>
                    <p className='text-sm text-center text-neutral-400'>Wed</p>
                    <p className='text-sm text-center text-neutral-400'>Thur</p>
                    <p className='text-sm text-center text-neutral-400'>Fri</p>
                    <p className='text-sm text-center text-neutral-400'>Sat</p>
                </div>
                {calendarDays.map((day,index)=>
                    <div key={index} className='px-0.5 pb-10 pt-1'>
                        {day > 0 ?
                            <div>
                                <p className={`font-semibold text-sm w-max mx-auto px-1 py-1 ${currentDate > day && currentDate < calendarDays[index+1] ? 'px-1.5 bg-opacity-80 text-blue-600 bg-sky-200 shadow-lg rounded-full' : ''}`}>
                                    {new Date(day).getDate()}
                                </p>
                                <div  className='flex flex-col gap-0.5'>
                                    { workouts.map((workout,id)=>
                                        <div key={`${workout.title}-${id}`}>
                                        {parseInt(workout.date) > day && parseInt(workout.date) < calendarDays[index+1] ?
                                            <div className='text-xs cursor-pointer break-word bg-gradient-to-r from-sky-600 to-sky-400 text-white rounded-full truncate shadow-sm pl-1 py-0.5'
                                                onClick={()=> view?.date === workout.date ? setView(null) : setView(workout)}
                                            >
                                                {workout.title}
                                            </div> 
                                            :
                                            <></>
                                        }
                                        </div>
                                    )}
                                    {currentDate > day && currentDate < calendarDays[index+1] ? 
                                        <div className='text-xs cursor-pointer break-word bg-gradient-to-r text-center from-neutral-300 to-neutral-400 text-white rounded-full truncate shadow-sm pl-1 py-0.5'
                                        >
                                            {nextWorkout?.name}
                                        </div>
                                    :
                                        <></>
                                    }
                                </div>
                            </div>
                        :
                        <></>
                        }
                    </div>
                )}
            </div>
            <div className='w-11/12'>
                { view !== null ?
                    <div className='shadow-md bg-stone-50 rounded-md w-full p-2 my-2'>
                        <div className='flex justify-between items-center px-1 mb-1'>
                            <p className='font-semibold'>{view.title}</p>
                            <p className='text-sm'>{new Date(parseInt(view.date)).toDateString()}</p>
                        </div>
                        { view.end ? 
                        <p className='text-sm px-1 text-neutral-500 mb-1 text-right w-full'>Duration: {displayTime}</p>
                        :
                        <></>
                        }
                        <div className='border border-neutral-200 rounded-sm'>
                            { view.results.map((ex,ind)=>
                                ex.rpe > 0 ?
                                <div key={`${view.title}-${ind}`}>
                                    <p className='text-sm font-semibold p-1 bg-slate-100'>{ex.name}</p>
                                    <hr className='mb-2' />
                                    <div className='flex divide-x divide-gray-400'>
                                    {ex.sets.map((set,index)=>
                                        <p className='text-sm px-2 pb-1' key={`${view.title}-${ind}-${index}`}>{set.weight}&nbsp;x&nbsp;{set.reps}</p>
                                    )}
                                    </div>
                                </div>    
                                :
                                <></>
                            )}
                        </div>
                    </div>
                    :
                    <></>
                }
            </div>
            {/* <Pagenav page='history' /> */}
        </main>
    )
}
