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

const textOptions = ['Machine taken?', 'Machine broken?', 'Not feeling it?', 'In a hurry?']

export default function LiveExerciseLog({lift, id, currentWorkout, profile, complete, currentWorkoutIndex, exercises, setExercises, username,
    setCurrentWorkout, setActiveSlide, activeSlide, setComplete
    })
{
    const [targetSets, setTargetSets] = useState([])
    const [radioVal, setRadioVal] = useState(6)
    const [addSet, setAddSet] = useState([])
    const [ssId, setSSId] = useState(null)
    const [saving, setSaving] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [randomText, setRandomText] = useState(0)
    const [swap, setSwap] = useState(false)
    const [choice, setChoice] = useState(lift)
    const [initialLift, setInitialLift] = useState(null)
    useEffect(()=>{
        setRandomText(Math.round(Math.random()*3))
        setInitialLift(lift)
    },[])

    useEffect(()=>{
        if(exercises.length > 0)
        {
            setTargetSets(exercises[choice].target.sets)
        }
    },[choice, exercises])

    useEffect(()=>{
        if(choice != lift) {
            const currenttemp = Object.assign({}, currentWorkout)
            currenttemp.exercises.splice(id,1,parseInt(choice))
            setCurrentWorkout(currenttemp)
            setSwap(false)
        }
        else if (currentWorkout.exercises[id] !== initialLift && initialLift !== null)
        {
            const currenttemp = Object.assign({}, currentWorkout)
            currenttemp.exercises.splice(id,1,lift)
            setCurrentWorkout(currenttemp)
        }
    },[choice])

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

    return (
        <div
            className={`w-full flex-col mx-auto gap-3 items-center border border-gray-300 rounded-lg
                px-4 py-3 shadow-md bg-stone-50
                `
            }
            key={id}
        >
            <div>
                {choice !== lift ?
                    <div className='flex justify-between items-center mb-2'>
                        <p className='text-lg font-semibold text-center'>{exercises[choice].name}</p>
                        <button className='text-red-500' onClick={()=>setChoice(initialLift)}>Revert</button>
                    </div>
                    :
                    <p className='text-lg font-semibold text-center mb-2'>{exercises[choice].name}</p>
                }
                <div className='grid grid-cols-7 mt-4 gap-2 items-center'>
                    <p className='text-xs text-neutral-500 col-span-2'>Set</p>
                    <p className='text-xs text-neutral-500 col-span-2'>Reps</p>
                    <p className='text-xs text-neutral-500 col-span-2'>Weight</p>
                    <p className='text-xs text-neutral-500'>Saved</p>
                </div>
            </div>
            <div>
                { targetSets.map((set,index)=>
                        <LiveRow key={`${id}-${index}`} index={index} set={set} setLength={targetSets.length} repConstant={repConstant} RemoveTargetSet={RemoveTargetSet}
                            id={id} username={username} name={exercises[choice].name} extraRow={false} complete={complete} setComplete={setComplete}
                        />
                )}
                {addSet.map((set,index)=>
                    <LiveRow key={`${id}extra-${index}`} index={targetSets.length + index} set={set} setLength={addSet.length} repConstant={repConstant} RemoveTargetSet={RemoveExtraSet}
                        id={id} username={username} name={exercises[choice].name} extraRow={targetSets.length < 1 ? false : true} complete={complete} setComplete={setComplete}
                    />
                )}
                <div className='grid grid-cols-7 my-2 gap-2 items-center'>
                    <button onClick={()=>setAddSet([...addSet,{reps:0,weight:"0"}])} type="button"
                        className={`text-sm bg-stone-100 border border-neutral-300 shadow-sm rounded-md px-1 py-0.5 col-span-2`}
                    >
                        Add Set
                    </button>
                    <input disabled className='border border-gray-200 rounded-md px-2 bg-gray-100 col-span-2' />
                    <input disabled className='border border-gray-200 rounded-md px-2 bg-gray-100 col-span-2' />
                </div>
                {/* <Slider
                    onChange={(e)=>{e.stopPropagation();setRadioVal(e.target.value)}}
                    track={false}
                    defaultValue={6}
                    sx={{color:"#64748b",my:2}}
                    step={null}
                    min={2}
                    max={10}
                    marks={
                        [
                            {
                            value: 3,
                            label: "Too Easy"   
                            },
                            {
                                value: 6,
                                label: "Challenging"   
                            },
                            {
                                value: 9,
                                label:'Too Hard'
                            }
                        ]
                    }
                /> */}
            </div>
            <div className='flex justify-center mt-4 gap-1'>
                <p className='text-sm text-gray-400'>{textOptions[randomText]}</p>
                <button className='text-sm text-blue-500 underline'
                    onClick={()=>setSwap(true)}
                >Swap Exercise</button>
            </div>
            <Dialog open={swap} onClose={()=>setSwap(false)}>
                <div className='px-4 py-3'>
                    <div className='font-semibold'>New Exercise</div>
                    <GroupExercises exercises={exercises} setChoice={setChoice} choice={choice} ss={false} />
                    <button className='border border-gray-400 py-1 px-3 mt-4 rounded-xl lg:hover:bg-red-100 lg:hover:border-red-200 lg:hover:text-red-500 lg:hover:scale-105 transition duration-200'
                        onClick={()=>{setSwap(false);setChoice(lift)}}
                    >Cancel</button>
                </div>
            </Dialog>
        </div>
    )
}