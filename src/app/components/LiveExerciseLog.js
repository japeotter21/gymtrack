"use client"
import React, { useState, useEffect } from 'react'
import { BsPause, BsPauseBtn, BsPlay, BsPlus, BsTrash } from 'react-icons/bs'
import axios from 'axios'
import { useRouter } from 'next/navigation';
import { FormControl, RadioGroup, FormControlLabel, Radio, Slider, Dialog } from '@mui/material';
import { repConstant } from '@/globals';
import LiveButton from './LiveButton.js'
import { HiLink } from 'react-icons/hi2';
import GroupExercises from './GroupExercises.js';
import LiveRow from './LiveRow.js';
import { Combobox } from '@headlessui/react';
import { DeleteExercise } from './EditWorkout.js';

const textOptions = ['Machine taken?', 'Machine broken?', 'Not feeling it?', 'In a hurry?']

export default function LiveExerciseLog({lift, id, currentWorkout, profile, complete, updating, setUpdating, username,
    setCurrentWorkout, setActiveSlide, activeSlide, setComplete
    })
{
    const [addSet, setAddSet] = useState([])
    const [targetSets, setTargetSets] = useState([])

    useEffect(()=>{
        let tempArr = complete.filter((item)=>item.name.split('-')[0] === lift)
        setTargetSets(tempArr)
    },[complete])

    function RemoveTargetSet(set) {
        const setTemp = [...complete]
        const index = setTemp.findIndex((item)=>item.name === set.name)
        setTemp.splice(index,1)
        setComplete(setTemp)
    }

    function SpliceExercise() {
        const tempArr = [...complete]
        let missingIndex = 0
        targetSets.forEach((item,arrIndex)=> item.name.split('-')[1] != arrIndex ? missingIndex = arrIndex : missingIndex = targetSets.length)
        tempArr.splice(id+1, 0, {name: `${lift}-${missingIndex}`, sets: 0, weight: 0})
        setComplete(tempArr)
    }

    return (
        <div
            className={`w-full flex-col mx-auto gap-3 items-center border border-gray-300 rounded-lg
                px-4 py-3 shadow-md bg-stone-50
                `
            }
            key={id}
        >
            <div>
                <h2 className='w-max mx-auto font-semibold'>{lift}</h2>
                <div className='grid grid-cols-8 mt-4 gap-2 items-center'>
                    <p className='text-xs text-neutral-500'>Set</p>
                    <p className='text-xs text-neutral-500 col-span-3'>Reps</p>
                    <p className='text-xs text-neutral-500 col-span-3'>Weight</p>
                </div>
            </div>
            <div>
                { targetSets.map((set,index)=>
                    <LiveRow key={`${id}-${index}`} index={index} set={set} repConstant={repConstant} RemoveTargetSet={RemoveTargetSet}
                        id={id} username={username} name={lift} extraRow={false} complete={complete} setComplete={setComplete}
                        updating={updating} setUpdating={setUpdating}
                    />
                )}
                <div className='grid grid-cols-8 my-2 gap-2 items-center'>
                    <button onClick={SpliceExercise} type="button"
                        className={`text-sm bg-stone-100 border border-neutral-300 shadow-sm rounded-md px-1 py-0.5`}
                    >
                        +
                    </button>
                    <input disabled className='border border-gray-200 rounded-md px-2 bg-gray-100 col-span-3' />
                    <input disabled className='border border-gray-200 rounded-md px-2 bg-gray-100 col-span-3' />
                </div>
            </div>
        </div>
    )
}