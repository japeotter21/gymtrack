"use client"
import React, { useState, useEffect, useContext } from 'react'
import Image from 'next/image'
import { Avatar, Paper } from '@mui/material'
import { BsCalendar, BsGraphUp, BsHouse, BsPencil } from 'react-icons/bs'
import { BiDumbbell} from 'react-icons/bi'
import axios from 'axios'
import Pagenav from '../components/Pagenav'
import { ResponsiveLine } from '@nivo/line'
import AppContext from '../AppContext'
import { redirect } from 'next/navigation'
import LineChart from '../components/LineChart'
import Link from 'next/link'
import { Combobox } from '@headlessui/react';
import { HiChevronUpDown } from 'react-icons/hi2'

export default function Stats() {
    const [loading, setLoading] = useState(true)
    const [current, setCurrent] = useState(null)
    const [chartData, setChartData] = useState([])
    const [labelData, setLabelData] = useState([])
    const [data, setData] = useState(null)
    const [results, setResults] = useState([])
    const [yMax, setYMax] = useState(200)
    const [choice, setChoice] = useState('')
    const [range, setRange] = useState('all')
    const [query, setQuery] = useState('')
    const maxPercent = [0, 1, 0.95, 0.93, 0.9, 0.87, 0.85, 0.83, 0.8, 0.77, 0.75, 0.7, 0.67, 0.65]
    const {activeUser, Refresh} = useContext(AppContext)

    useEffect(()=>{
        if(activeUser)
        {
            axios.get('/api/exercise', { params: { user: activeUser } })
            .then(res=>{
              setLoading(false)
              setResults(res.data.exercises)
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
        if(current !== null)
        {
            let labelsTemp = []
            let weightsTemp = []
            current.forEach((item,id)=>{
                const dateObj = new Date(parseInt(item.date))
                const month = dateObj.getMonth() +1
                labelsTemp.push(month+'-'+dateObj.getDate())
                let maxWeightArr = []
                item.results.sets.forEach((set,index)=>{
                    if(set.reps < 1)
                    {
                        maxWeightArr.push(0)
                    }
                    else if(set.reps < maxPercent.length)
                    {
                        //max weight quantized to multiples of 5
                        const calcMax = parseFloat(set.weight)/maxPercent[set.reps]
                        maxWeightArr.push(calcMax)
                    }
                    else
                    {
                        maxWeightArr.push(set.weight*2)
                    }
                })
                const maxWeight = Math.max(...maxWeightArr)
                const calcMax = Math.round((maxWeight)/5)*5
                weightsTemp.push(calcMax)
            })
            if(weightsTemp.length > 0)
            {
                setYMax(Math.max(...weightsTemp)+40)
                setLabelData(labelsTemp)
                setChartData(weightsTemp)
            }
            else
            {
                setYMax(200)
                setLabelData([])
                setChartData([])
            }
        }
    },[current])

    useEffect(()=>{
        if(choice !== '')
        {
            axios.get('/api/exerciseHistory', { params: { user: activeUser, name: results[choice].name } })
            .then(res=>{
              setCurrent(res.data)
            })
        }
    },[choice])

    useEffect(()=>{
        if(labelData.length > 0 && chartData.length > 0)
        {
            let dataTemp = []
            labelData.forEach((item,id)=>{
                dataTemp.push({x: item,y: chartData[id]})
            })
            setData([{
                "id": 'Projected 1-Rep Max',
                "color": "hsl(309, 70%, 50%)",
                "data": dataTemp
            }])
        }
        else
        {
            setData([])
        }
    },[chartData,labelData])

    function ChartExercise(e) {
        setChoice(e.target.value)
    }
    const filteredEx =
    query === ''
      ? results
      : results.filter((ex) => {
          return ex.name.toLowerCase().includes(query.toLowerCase())
    })

    return (
        <main className="flex min-h-screen flex-col items-center py-6 lg:pt-12 px-2 lg:p-12 gap-4">
            <Combobox value={results[choice]?.name} onChange={setChoice}>
                <Combobox.Label>Exercise</Combobox.Label>
                <div className='relative'>
                    <Combobox.Input onChange={(event) => setQuery(event.target.value)} className="border mx-auto block rounded-md text-center" />
                    <Combobox.Button className='absolute inset-y-0 right-2'><HiChevronUpDown /></Combobox.Button>
                </div>
                <Combobox.Options className='bg-stone-50 fixed mt-6 z-10 p-2'>
                    {filteredEx.map((ex) => (
                    <Combobox.Option key={ex.name} value={ex.id}>
                        {ex.name}
                    </Combobox.Option>
                    ))}
                </Combobox.Options>
            </Combobox>
            { current !== null ?
                <>
                    <p className='mx-auto w-max'>Projected 1-Rep Max (lbs)</p>
                    <div className='h-[50vh] w-full lg:w-3/4 mb-2 overflow-x-auto overflow-y-hidden'>
                        <div className={`${chartData.length > 10 ? 'w-[1000px]': 'w-full lg:w-3/4'} h-[50vh] block mx-auto`}>
                                <ResponsiveLine
                                    data={data}
                                    margin={{ top: 20, right: 50, bottom: 50, left: 40 }}
                                    xScale={{ type: 'point' }}
                                    yScale={{
                                        type: 'linear',
                                        min: 0,
                                        max: yMax,
                                        stacked: true,
                                        reverse: false
                                    }}
                                    yFormat=" >-.2f"
                                    axisTop={null}
                                    axisRight={null}
                                    axisBottom={{
                                        tickSize: 5,
                                        tickPadding: 5,
                                        tickRotation: 0,
                                        legend: 'Day',
                                        legendOffset: 36,
                                        legendPosition: 'middle'
                                    }}
                                    colors={{ scheme: 'category10' }}
                                    axisLeft={{
                                        tickSize: 0,
                                        tickPadding: 20,
                                    }}
                                    enableGridX={false}
                                    enableGridY={false}
                                    isInteractive={false}
                                    pointSize={3}
                                    enablePointLabel={true}
                                    pointColor={{ theme: 'background' }}
                                    pointBorderWidth={2}
                                    pointBorderColor={{ from: 'serieColor' }}
                                    pointLabelYOffset={-7}
                                    useMesh={false}
                                />
                                {/* <LineChart data={data} /> */}
                        </div>
                    </div>
                    <div className='flex flex-col items-center gap-2'>
                        <div className='flex'
                        >
                            <button className={`${range === 'all' ? 'bg-sky-600 text-white' : 'bg-stone-50'} px-4 py-1.5 text-sm rounded-l-md`} onClick={(e)=>setRange('all')}>All</button>
                            <button className={`${range === 'month' ? 'bg-sky-600 text-white' : 'bg-stone-50'} px-4 py-1.5 text-sm border-x-[1px]`} onClick={(e)=>setRange('month')}>Month</button>
                            <button className={`${range === 'year' ? 'bg-sky-600 text-white' : 'bg-stone-50'} px-4 py-1.5 text-sm rounded-r-md`} onClick={(e)=>setRange('year')}>Year</button>
                        </div>
                        <p className='text-xs text-neutral-500'>Date Range</p>
                    </div>
                    <div className='w-full lg:w-1/2 bg-stone-50 rounded-lg px-4 py-2 max-h-[30vh] overflow-y-auto'>
                        <p>{current.name}</p>
                        <div className='divide-y py-1'>
                            <div className='grid grid-cols-5'>
                                <p className='col-span-1 text-gray-400 text-sm'>Date</p>
                                <p className='col-span-4 text-gray-400 text-sm'>Results</p>
                            </div>
                            { current.slice().reverse().map((item,id)=>
                                <div key={id} className='grid grid-cols-5 items-center'>
                                    <p className='col-span-1 text-sm'>{new Date(parseInt(item.date)).getMonth()+1}-{new Date(parseInt(item.date)).getDate()}</p>
                                    <div className='flex gap-3 text-sm col-span-4'>
                                    { item.results.sets.map((set,index)=>
                                        <p key={index}>{set.weight}x{set.reps}</p>
                                    )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            :
                <div className='h-[10vh]'></div>
            }
            <div className='grid grid-cols-3 items-center gap-2 w-full px-2 lg:px-12'>
                <Link className='flex flex-col gap-1 items-center justify-center self-stretch px-4 py-2 shadow-sm rounded-md bg-stone-50 text-neutral-600'
                    href="/"
                >
                    <div className='px-3 py-1 rounded-full'
                    ><BsHouse size={20} /></div>
                    <p className='text-xs text-center'>Back to Home</p>
                </Link>
                <div></div>
                <button className='flex flex-col gap-1 items-center justify-center px-4 py-2 rounded-md bg-gray-200 text-neutral-500'
                >
                    <div className='px-3 py-1 rounded-full text-green-700'
                    ><BsGraphUp size={20} /></div>
                    <p className='text-xs text-center'>Export Graph</p>
                </button>
            </div>
        </main>
    )
}
