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

    return (
        <div className='grid grid-cols-7 my-1 gap-2 items-center'>
            <div className='flex gap-3 items-center'>
                { index === 0 || updated ?
                    <p className='text-sm'>{index+1}</p>
                :
                    <button className='text-red-500 text-xs border border-red-200 rounded-md px-2 py-0.5'
                        type="button"
                        onClick={()=>RemoveTargetSet(index)}
                    ><BsTrash /></button>
                }
            </div>
            <select type="number" value={repVal} onChange={(e)=>setrepVal(e.target.value)}
                className='border border-gray-400 rounded-md px-2 col-span-3'
            >
                {repConstant.map((rep,number)=>
                    <option value={rep} key={number}>{rep}</option>
                )}
            </select>
            <input type="number" step="0.5" placeholder={set.weight} value={weightVal} disabled={!allowWeight} onChange={(e)=>setweightVal(e.target.value)}
                className={`border border-gray-400 rounded-md px-2 col-span-3 ${allowWeight ? '' : 'bg-gray-200 border-gray-200 text-gray-400'}`} required
            />
        </div>
    )
}