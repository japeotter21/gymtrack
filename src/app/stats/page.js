"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Avatar, Paper } from '@mui/material'
import { BsCalendar, BsGraphUp, BsPencil } from 'react-icons/bs'
import { BiDumbbell} from 'react-icons/bi'
import axios from 'axios'
import Pagenav from '../components/Pagenav'
import { ResponsiveLine } from '@nivo/line'

export default function Stats() {
    const [loading, setLoading] = useState(true)
    const [current, setCurrent] = useState(null)
    const [chartData, setChartData] = useState([])
    const [labelData, setLabelData] = useState([])
    const [data, setData] = useState(null)
    const [results, setResults] = useState([])
    const [yMax, setYMax] = useState(200)
    const maxPercent = [0, 1, 0.95, 0.93, 0.9, 0.87, 0.85, 0.83, 0.8, 0.77, 0.75, 0.7, 0.67, 0.65]

    useEffect(()=>{
        axios.get('/api/user')
        .then(res=>{
          setLoading(false)
          setResults(res.data.documents[0].exercises)
        })
        .catch(err=>{
          console.error(err.message)
        })
    },[])

    useEffect(()=>{
        if(current !== null)
        {
            let labelsTemp = []
            let weightsTemp = []
            current.results.forEach((item,id)=>{
                const dateObj = new Date(item.date)
                const month = dateObj.getMonth() +1
                labelsTemp.push(month+'-'+dateObj.getDate())
                let maxWeightArr = []
                item.sets.forEach((set,index)=>{
                    if(set[0] < maxPercent.length)
                    {
                        //max weight quantized to multiples of 5
                        const calcMax = Math.floor((set[1]/maxPercent[set[0]])/5)*5
                        maxWeightArr.push(calcMax)
                    }
                    else
                    {
                        maxWeightArr.push(Math.floor((set[1]*2)/5)*5)
                    }
                })
                const maxWeight = Math.max(...maxWeightArr)
                weightsTemp.push(maxWeight)
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
        setCurrent(results[e.target.value])
    }

    return (
        <main className="flex min-h-screen flex-col items-center py-6 lg:pt-12 px-2 lg:p-12 gap-4">
            <select className='border border-gray-400 rounded-md p-1'
                  onChange={(e)=>ChartExercise(e)} defaultValue=''
                >
                  <option value='' disabled>Select Exercise</option>
                  {results.map((ex,id)=>
                      <option value={id} key={id}>{ex.name}</option>
                  )}
            </select>
            { current !== null ?
                <>
                    <div className='h-[50vh] w-full lg:w-3/4 mb-2 overflow-x-auto overflow-y-hidden'>
                        <p className='mx-auto w-max'>Projected 1-Rep Max</p>
                        <div className={`w-${chartData.length > 10 ? '[1000px]': 'w-full lg:w-3/4'} h-[50vh] block mx-auto`}>
                                <ResponsiveLine
                                    data={data}
                                    margin={{ top: 20, right: 50, bottom: 50, left: 50 }}
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
                                        tickSize: 5,
                                        tickPadding: 5,
                                        tickRotation: 0,
                                        legend: 'Weight',
                                        legendOffset: -40,
                                        legendPosition: 'middle'
                                    }}
                                    isInteractive={false}
                                    pointSize={3}
                                    enablePointLabel={true}
                                    pointColor={{ theme: 'background' }}
                                    pointBorderWidth={2}
                                    pointBorderColor={{ from: 'serieColor' }}
                                    pointLabelYOffset={-7}
                                    useMesh={true}
                                />
                                
                        </div>
                    </div>
                    <div className='w-full lg:w-1/2 bg-stone-50 rounded-lg px-4 py-2 max-h-[30vh] overflow-y-auto'>
                        <p>{current.name}</p>
                        <div className='divide-y py-1'>
                            <div className='grid grid-cols-5'>
                                <p className='col-span-1 text-gray-400'>Date</p>
                                <p className='col-span-4 text-gray-400'>Results</p>
                            </div>
                            { current.results.slice(0).reverse().map((item,id)=>
                                <div key={id} className='grid grid-cols-5 items-center'>
                                    <p className='col-span-1 text-sm'>{new Date(item.date).getMonth()+1}-{new Date(item.date).getDate()}</p>
                                    <div className='flex gap-3 text-sm col-span-4'>
                                    { item.sets.map((set,index)=>
                                        <p key={index}>{set.slice(0).reverse().join('x')}</p>
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
            <Pagenav page='stats' />
        </main>
    )
}
