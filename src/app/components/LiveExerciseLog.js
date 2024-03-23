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

export default function LiveExerciseLog({lift, id, currentWorkout, profile, complete, currentWorkoutIndex, exercises, setExercises, username,
    setCurrentWorkout, setActiveSlide, activeSlide, setComplete
    })
{
    const [targetSets, setTargetSets] = useState([...lift.target.sets])
    const [addSet, setAddSet] = useState([])

    function RemoveTargetSet(index) {
        const setTemp = [...targetSets]
        setTemp.splice(index,1)
        setTargetSets(setTemp)
    }

    function RemoveExtraSet()
    {
        const setTemp = [...addSet]
        setTemp.pop()
        setAddSet(setTemp)
    }

    function SpliceExercise() {
        const tempArr = [...complete]
        tempArr.splice(id+1, 0, {name: `${lift.name}-${id+1}`, sets: 0, weight: 0})
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
                <h2 className='w-max mx-auto font-semibold'>{lift.name}</h2>
                <div className='grid grid-cols-7 mt-4 gap-2 items-center'>
                    <p className='text-xs text-neutral-500'>Set</p>
                    <p className='text-xs text-neutral-500 col-span-3'>Reps</p>
                    <p className='text-xs text-neutral-500 col-span-3'>Weight</p>
                </div>
            </div>
            <div>
                { targetSets.map((set,index)=>
                    <LiveRow key={`${id}-${index}`} index={index} set={set} setLength={targetSets.length} repConstant={repConstant} RemoveTargetSet={RemoveTargetSet}
                        id={id} username={username} name={lift.name} extraRow={false} complete={complete} setComplete={setComplete}
                    />
                )}
                <div className='grid grid-cols-7 my-2 gap-2 items-center'>
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