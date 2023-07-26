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
                    maxWeightArr.push(set[1])
                })
                const maxWeight = Math.max(...maxWeightArr)
                weightsTemp.push(maxWeight)
            })
            setLabelData(labelsTemp)
            setChartData(weightsTemp)
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
                "id": '1',
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
                  onChange={(e)=>ChartExercise(e)}
                >
                  {results.map((ex,id)=>
                      <option value={id} key={id}>{ex.name}</option>
                  )}
            </select>
            <div className='h-[40vh] w-full'>
                <ResponsiveLine
                    data={data}
                    margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                    xScale={{ type: 'point' }}
                    yScale={{
                        type: 'linear',
                        min: 'auto',
                        max: 'auto',
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
                    pointSize={10}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    pointLabelYOffset={-12}
                    useMesh={true}
                />
            </div>
            <Pagenav page='stats' />
        </main>
    )
}
