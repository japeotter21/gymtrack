"use client"
import React, { useState } from 'react'
import { BsPause, BsPauseBtn, BsPlay, BsPlus, BsTrash } from 'react-icons/bs'
import axios from 'axios'
import { useRouter } from 'next/navigation';
import { FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { repConstant } from '@/globals';

export default function LiveExerciseLog({complete, lift, id, setComplete, currentWorkout, profile, currentWorkoutIndex, exercises, username}) {
    const [radioVal, setRadioVal] = useState(0)
    const [addSet, setAddSet] = useState([])
    function SubmitSetForm(e) {
        e.preventDefault()
        const exerciseIndex = e.target.id.split('-')[1]
        const currentExercise = exercises[exerciseIndex]
        const postLength = currentExercise.target.sets.length
        const formLength = currentExercise.target.sets.flat()
        const extraLength = addSet.length
        const extraFormLength = addSet.flat()
        let postArr = []
        formLength.forEach((item,id)=>{
            if(id % 2 === 1)
            {
                const newResult = [parseInt(e.target[id-1].value),parseInt(e.target[id].value)]
                postArr.push(newResult)
            }
        })
        extraFormLength.forEach((item,id)=>{
            if(id % 2 === 1)
            {
                const newResult = [parseInt(extraFormLength[id-1]),parseInt(item)]
                postArr.push(newResult)
            }
        })
        const postObj = {
            sets: postArr,
            notes: '',
            reminder: "",
            date: new Date().getTime(),
            rpe: radioVal
        }
        axios.post('/api/exercise',postObj,{ params: { workout:currentWorkoutIndex, log:1, exercise: exerciseIndex, user: username}})
        .then(res=>{
            const storeComplete = [...complete]
            storeComplete.push(exerciseIndex)
            setComplete(storeComplete)
        })
    }

    function RPEForm(e) {
        e.preventDefault()
        setRadioVal(parseInt(e.target.value))
    }

    function RemoveExtraSet() {
        const setTemp = [...addSet]
        setTemp.pop()
        setAddSet(setTemp)
    }

    function UpdateAddSet(e, index, target) {
        let addTemp = [...addSet]
        if (target==="rep")
        {
            addTemp[index][0] = parseInt(e.target.value)
        }
        else if (target==="weight")
        {
            addTemp[index][1] = parseInt(e.target.value)
        }
        setAddSet(addTemp)
    }

    return (
        <div className='w-5/6 lg:w-1/2 flex-col gap-3 items-center border border-gray-300 rounded-lg bg-stone-50 px-4 py-1' key={id}>
            <p className='text-lg font-semibold text-center'>{exercises[lift].name}</p>
            <div className='grid grid-cols-3 mt-2 gap-2 items-center'>
                <p className='text-xs text-gray-400'>Set</p>
                <p className='text-xs text-gray-400'>Reps</p>
                <p className='text-xs text-gray-400'>Weight</p>
            </div>
            <form id={`lift-${lift}`} onSubmit={(e)=>SubmitSetForm(e)}>
                {exercises[lift].target.sets.map((set,index)=>
                    <div key={index} className='grid grid-cols-3 my-1 gap-2 items-center'>
                        <p className='text-sm'>{index+1}</p>
                        <select type="number" id={`${exercises[lift].name}set${index+1}`} name={`${exercises[lift].name}set${index+1}`} defaultValue={set[0] || ''}
                            className='border border-gray-400 rounded-md px-2'
                        >
                            {repConstant.map((rep,number)=>
                                <option value={rep} key={number}>{rep}</option>
                            )}
                        </select>
                        <input type="number" id={`${exercises[lift].name}set${index+1}`} name={`${exercises[lift].name}set${index+1}`} defaultValue={set[1] || ''}
                            className='border border-gray-400 rounded-md px-2'
                        />
                    </div>
                )}
                {addSet.map((set,index)=>
                    <div key={index} className='grid grid-cols-3 my-1 gap-2 items-center'>
                        <div className='flex gap-3 items-center'>
                            <p className='text-sm'>{exercises[lift].target.sets.length+index+1}</p>
                            <button className='text-red-500 text-xs border border-red-200 rounded-md px-1'
                                type="button"
                                onClick={RemoveExtraSet}
                            >Remove</button>
                        </div>
                        <select type="number" id={`extraset${index+1}`} name={`extraset${index+1}`} defaultValue={0}
                            className='border border-gray-400 rounded-md px-2'
                            onChange={(e)=>UpdateAddSet(e, index, 'rep')}
                        >
                            {repConstant.map((rep,number)=>
                                <option value={rep} key={number}>{rep}</option>
                            )}
                        </select>
                        <input type="number" id={`extraset${index+1}`} name={`extraset${index+1}`} defaultValue={0}
                            className='border border-gray-400 rounded-md px-2'
                            onChange={(e)=>UpdateAddSet(e, index, 'weight')}
                        />
                    </div>
                )}
                <div className='grid grid-cols-3 my-2 gap-2 items-center'>
                    <button onClick={()=>setAddSet([...addSet,[0,0]])} type="button"
                        className='text-sm bg-green-600 text-white shadow-sm rounded-md px-1 py-0.5'
                    >
                        Add Set
                    </button>
                    <input disabled className='border border-gray-200 rounded-md px-2 bg-gray-100' />
                    <input disabled className='border border-gray-200 rounded-md px-2 bg-gray-100' />
                    {/* <div className='rounded-md bg-gradient-to-r from-gray-200 to-gray-100 w-full h-6 col-span-2'></div> */}
                </div>
                
                <FormControl onChange={(e)=>RPEForm(e)} sx={{mx: 'auto', w:'max-content', display:'grid', placeItems:'center'}}>
                    <RadioGroup row sx={{display:"flex", alignItems:'center', flexWrap:'wrap', marginX:'auto'}}>
                        <div className='flex items-center'>
                            <Radio
                                checked={radioVal === 3}
                                value={3}
                                name="rpe"
                            />
                            <p className='text-sm'>Easy</p>
                        </div>
                        <div className='flex items-center'>
                            <Radio
                                checked={radioVal === 6}
                                value={6}
                                name="rpe"
                            />
                            <p className='text-sm'>Challenging</p>
                        </div>
                        <div className='flex items-center'>
                            <Radio
                                checked={radioVal === 9}
                                value={9}
                                name="rpe"
                            />
                            <p className='text-sm'>Hard</p>
                        </div>
                    </RadioGroup>
                </FormControl>
                { radioVal > 0 ?
                <button type="submit" 
                    className='bg-gradient-to-r to-slate-400 from-slate-700 rounded-full px-5 py-1 w-full block mx-auto mt-4 mb-2 text-white'
                >
                    Complete
                </button>
                :
                <button type="button" 
                    className='bg-slate-400 bg-opacity-80 rounded-full px-5 py-1 w-full block mx-auto mt-4 mb-2 text-gray-200'
                    disabled
                >
                    Complete
                </button>
                }
                
            </form>
        </div>
    )
}