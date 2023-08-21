"use client"
import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import Pagenav from '../components/Pagenav'
import AppContext from '../AppContext'
import { redirect } from 'next/navigation'
import { ViewState } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  MonthView,
  Appointments,
  Resources,
  Toolbar,
  DateNavigator,
  TodayButton
} from '@devexpress/dx-react-scheduler-material-ui';

export default function History() {
    const [loading, setLoading] = useState(true)
    const [workouts, setWorkouts] = useState([])
    const [filter,setFilter] = useState('All')
    const [titles, setTitles] = useState([])
    const [appointments, setAppointments] = useState([])
    const [view, setView] = useState(null)
    const [displayTime, setDisplayTime] = useState('')
    const {activeUser, Refresh} = useContext(AppContext)
    const currentDate = new Date()

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
        if(view)
        {
            const viewObj = workouts.find((item,id) => new Date(parseInt(item.date)).toISOString() === view)
            const endTime = parseInt(viewObj.end)
            const startTime = parseInt(viewObj.date)
            const duration = (endTime - startTime) / 1000
            if(duration !== NaN)
            {
                const hours = Math.floor(duration / 3600)
                const minutes = Math.floor(duration / 60)
                setDisplayTime(`${hours}:${minutes.toLocaleString('en-US',{minimumIntegerDigits:2})}`)
            }
            else
            {
                setDisplayTime('')
            }
        }
    },[view])

    const Appointment = ({
        children, style, onClick, onMouseEnter, onMouseLeave, ...restProps
      }) => (
        <Appointments.Appointment
            {...restProps}
            onClick={(e)=>{ view === e.data.startDate ? setView(null) : setView(e.data.startDate)
            }}
            style={
                    {
                        ...style,
                        background: 'linear-gradient(to left,#16a34a, #22c55e)',
                        borderRadius: '8px',
                        border: 'none'
                    }
                }
        >
            {children}
        </Appointments.Appointment>
    );

    if(loading)
    {
        return (
            <></>
        )
    }

    return (
        <main className="flex min-h-screen flex-col items-center py-6 lg:pt-12 px-2 lg:p-12 gap-4">
            <select value={filter} onChange={(e)=>setFilter(e.target.value)}>
                <option value="All">All</option>
                {titles.map((item,id)=>
                    <option value={item} key={id}>{item}</option>
                )}
            </select>
            <div className='w-11/12 bg-stone-50 h-[60vh]'>
                <Scheduler
                        data={appointments}
                    >
                        <ViewState
                            defaultCurrentDate={currentDate}
                        />
                        <MonthView />
                        <Toolbar />
                        <DateNavigator />
                        <TodayButton />
                        <Appointments appointmentComponent={Appointment} />
                        <Resources resources={appointments} />
                </Scheduler>
            </div>
            <div className='w-11/12'>
                { workouts.map((item,id)=>
                    new Date(parseInt(item.date)).toISOString() === view ?
                    <div className='shadow-md bg-stone-50 rounded-md w-full p-2 my-2' key={id}>
                        <div className='flex justify-between items-center px-1 mb-1'>
                            <p className='font-semibold'>{item.title}</p>
                            <p className='text-sm'>{new Date(parseInt(item.date)).toDateString()}</p>
                        </div>
                        { item.end ? 
                        <p className='text-sm px-1 text-neutral-500 mb-1 text-right w-full'>Duration: {displayTime}</p>
                        :
                        <></>
                        }
                        <div className='border border-neutral-200 rounded-sm'>
                            { item.results.map((ex,ind)=>
                                ex.rpe > 0 ?
                                <div key={`${id}-${ind}`}>
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
                    :
                    <></>
                )}
            </div>
            <Pagenav page='history' />
        </main>
    )
}
