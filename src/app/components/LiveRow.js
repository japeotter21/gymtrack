"use client"
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BsTrash } from 'react-icons/bs'

export default function LiveRow({index, set, RemoveTargetSet, repConstant, id, username, updating, setUpdating, complete, setComplete}) {
    const [weightVal, setweightVal] = useState(set.weight)
    const [updated, setUpdated] = useState(false)
    const updateIndex = complete.findIndex((item)=>item.name === set.name)

    function UpdateExValue(category,value) {
        setUpdating(true)
        const tempArr = [...complete]
        if(category === 0)
        {
            tempArr[updateIndex].reps = parseInt(value)
        }
        else
        {
            tempArr[updateIndex].weight = value
        }
        axios.put('api/history', tempArr[updateIndex], { params: { user: username } })
        .then(res=>{
            setUpdating(false)
        })
        setComplete(tempArr)
    }

    return (
        <div className='grid grid-cols-8 my-1 gap-2 items-center'>
            <p className='text-sm'>{index+1}</p>
            <select type="number" value={set.reps} onChange={(e)=>UpdateExValue(0,e.target.value)}
                className='border border-gray-400 rounded-md px-2 col-span-3'
            >
                {repConstant.map((rep,number)=>
                    <option value={rep} key={number}>{rep}</option>
                )}
            </select>
            <input type="number" step="0.5" value={weightVal} onChange={(e)=>setweightVal(e.target.value)}
                onBlur={()=>UpdateExValue(1,weightVal)}
                className={`border border-gray-400 rounded-md px-2 col-span-3`} required
            />
            <button className='text-red-500 text-xs'
                type="button"
                onClick={()=>RemoveTargetSet(set)}
            ><BsTrash size={15} /></button>
        </div>
    )
}