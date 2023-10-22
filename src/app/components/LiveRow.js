"use client"
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BsTrash } from 'react-icons/bs'

export default function LiveRow({index, set, RemoveTargetSet, repConstant, id, setLength, username, name, extraRow, complete, setComplete}) {
    const [repVal, setrepVal] = useState(0)
    const [weightVal, setweightVal] = useState("")
    const [allowWeight, setallowWeight] = useState(false)
    const [updated, setUpdated] = useState(false)
    const [updating, setUpdating] = useState(false)

    useEffect(()=>{
        if(set.reps)
        {
            setrepVal(set.reps)
        }
        // if (set.weight)
        // {
        //     setweightVal(set.weight)
        // }
    },[])

    useEffect(() => {
        if(complete.length > 0)
        {
            const checkDone = complete.findIndex((item)=>item.name === name+'-'+index)
            if(checkDone >= 0)
            {
                setUpdated(true)
                setrepVal(complete[checkDone].reps)
                setweightVal(complete[checkDone].weight)
            }
            else
            {
                setUpdated(false)
            }
        }
    }, [complete])
    

    useEffect(()=>{
        if(repVal > 0 && !allowWeight)
        {
            setallowWeight(true)
        }
        else if (!(repVal > 0))
        {
            setallowWeight(false)
        }
        const checkDone = complete.findIndex((item)=>item.name === name+'-'+index)
        if(updated && checkDone >=0)
        {
            if(repVal !== complete[checkDone].reps || weightVal !== complete[checkDone].weight)
            {
                setUpdated(false)
            }
        }
    },[repVal, weightVal])

    function PostResults() {
        setUpdating(true)
        const checkDone = complete.findIndex((item)=>item.name === name+'-'+index)
        if(checkDone >= 0)
        {
            // if updated is already set true then the entry already exists and should be edited
            const postObj = {
                reps: parseInt(repVal),
                weight: weightVal,
                name: name+'-'+index
            }
            setUpdated(true)
            axios.put('/api/history',postObj,{ params: { user: username, edit: index }})
            .then(res=>{
                axios.get('/api/workouts',{ params: {user: username}})
                .then(r=>{
                    setUpdating(false)
                    setComplete(r.data.inProgress.results)
                })
                .catch(err=>{
                    console.error(err)
                    setUpdating(false)
                })
            }) 
            .catch(err=>{
                console.error(err)
                setUpdating(false)
            })
        }
        else
        {
            const postObj = {
                reps: parseInt(repVal),
                weight: weightVal,
                name: name+'-'+index
            }
            setUpdated(true)
            axios.put('/api/history',postObj,{ params: { user: username }})
            .then(res=>{
                axios.get('/api/workouts',{ params: {user: username}})
                .then(r=>{
                    setUpdating(false)
                    setComplete(r.data.inProgress.results)
                })
                .catch(err=>{
                    console.error(err)
                    setUpdating(false)
                })
            }) 
            .catch(err=>{
                console.error(err)
                setUpdating(false)
            })
        }
    }

    return (
        <div className='grid grid-cols-7 my-1 gap-2 items-center'>
            <div className='flex gap-3 items-center col-span-2'>
                <p className='text-sm'>{index+1}</p>
                { index === 0 || updated ?
                    <button type="button"></button>
                :
                    <button className='text-red-500 text-xs border border-red-200 rounded-md px-2 py-0.5'
                        type="button"
                        onClick={()=>RemoveTargetSet(index)}
                    ><BsTrash /></button>
                }
            </div>
            <select type="number" value={repVal} onChange={(e)=>setrepVal(e.target.value)}
                className='border border-gray-400 rounded-md px-2 col-span-2'
            >
                {repConstant.map((rep,number)=>
                    <option value={rep} key={number}>{rep}</option>
                )}
            </select>
            <input type="number" step="0.5" placeholder={set.weight} value={weightVal} disabled={!allowWeight} onChange={(e)=>setweightVal(e.target.value)}
                className={`border border-gray-400 rounded-md px-2 col-span-2 ${allowWeight ? '' : 'bg-gray-200 border-gray-200 text-gray-400'}`} required
            />
            { updated ? 
            <div
                className={`rounded-full border border-gray-400 h-[17px] w-[17px] mx-auto transition duration-200 ${updating ? 'animate-pulse bg-sky-500 border-none' : ''} bg-gradient-to-r to-sky-500 from-sky-600 border-none `}
            />
            : isNaN(parseInt(weightVal)) ?
            <div
                className={`rounded-full border border-gray-400 h-[17px] w-[17px] mx-auto transition duration-200`}
            />
            :
            <div
                onClick={PostResults}
                className={`rounded-full border border-gray-400 h-[17px] w-[17px] mx-auto transition duration-200 ${updating ? 'animate-pulse bg-sky-500 border-none' : ''} `}
            />
            }
        </div>
    )
}