"use client"
import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function LiveRow({index, set, RemoveTargetSet, completed, repConstant, id, setLength, username, name, extraRow}) {
    const [repVal, setrepVal] = useState(0)
    const [weightVal, setweightVal] = useState(0)
    const [allowWeight, setallowWeight] = useState(false)
    const [updated, setUpdated] = useState(false)

    useEffect(()=>{
        if(set.reps)
        {
            setrepVal(set.reps)
        }
        if (set.weight)
        {
            setweightVal(set.weight)
        }
    },[])

    useEffect(()=>{
        if(repVal > 0)
        {
            setallowWeight(true)
            if(updated)
            {
                PostResults()
            }
        }
        else
        {
            setallowWeight(false)
        }
    },[repVal])

    function PostResults() {
        
        if(updated)
        {
            // if updated is already set true then the entry already exists and should be edited
            const postObj = {
                reps: parseInt(repVal),
                weight: weightVal
            }
            setUpdated(true)
            axios.put('/api/history',postObj,{ params: { user: username, index: id, edit: index }})
            .then(res=>{
                axios.get('/api/workouts',{ params: {user: username}})
                .then(r=>{
                })
                .catch(err=>{
                    console.error(err)
                })
            }) 
            .catch(err=>{
                console.error(err)
            })
        }
        else
        {
            // otherwise need to create a new entry
            if(index === 0 && !extraRow)
            {
                const resultObj = {
                    name: name,
                    notes: '',
                    rpe: 6,
                    sets: [{reps: parseInt(repVal), weight: weightVal}]
                }
                setUpdated(true)
                axios.put('/api/history',resultObj,{ params: { user: username, index: id, create: true }})
                .then(res=>{
                    axios.get('/api/workouts',{ params: {user: username}})
                    .then(r=>{
                    })
                    .catch(err=>{
                        console.error(err)
                    })
                }) 
                .catch(err=>{
                    console.error(err)
                })
            }
            else
            {
                const postObj = {
                    reps: parseInt(repVal),
                    weight: weightVal
                }
                setUpdated(true)
                axios.put('/api/history',postObj,{ params: { user: username, index: id }})
                .then(res=>{
                    axios.get('/api/workouts',{ params: {user: username}})
                    .then(r=>{
                    })
                    .catch(err=>{
                        console.error(err)
                    })
                }) 
                .catch(err=>{
                    console.error(err)
                })
            }
        }
    }

    return (
        <div className='grid grid-cols-3 my-1 gap-2 items-center'>
            <div className='flex gap-3 items-center'>
                <p className='text-sm'>{index+1}</p>
                { index === 0 ?
                    <button type="button"></button>
                :
                    <button className='text-red-500 text-xs border border-red-200 rounded-md px-1'
                        type="button"
                        onClick={()=>RemoveTargetSet(index)}
                    >Remove</button>
                }
            </div>
            <select type="number" value={repVal} onChange={(e)=>setrepVal(e.target.value)}
                className='border border-gray-400 rounded-md px-2'
            >
                {repConstant.map((rep,number)=>
                    <option value={rep} key={number}>{rep}</option>
                )}
            </select>
            <input type="number" step="0.5" value={weightVal} disabled={!allowWeight} onChange={(e)=>setweightVal(e.target.value)} onBlur={PostResults}
                className={`border border-gray-400 rounded-md px-2 ${allowWeight ? '' : 'bg-gray-200 border-gray-200 text-gray-400'}`} required
            />
        </div>
    )
}