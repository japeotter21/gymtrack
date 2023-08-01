"use client"
import React, { useState } from 'react'
import { BsPause, BsPauseBtn, BsPlay } from 'react-icons/bs'
import axios from 'axios'
import { useRouter } from 'next/navigation';
import { FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material';

export default function LiveExerciseLog({complete, lift, id, setComplete, currentWorkout, profile, currentWorkoutIndex, exercises}) {
    const [radioVal, setRadioVal] = useState(0)

    function SubmitSetForm(e) {
        e.preventDefault()
        const exerciseIndex = e.target.id.split('-')[1]
        const currentExercise = exercises[exerciseIndex]
        const postLength = currentExercise.target.sets.length
        const formLength = currentExercise.target.sets.flat()
        let postArr = Array.from({length: postLength},(x)=>0)
        formLength.forEach((item,id)=>{
            if(id % 2 === 1)
            {
                const newResult = [parseInt(e.target[id-1].value),parseInt(e.target[id].value)]
                postArr[Math.floor(id/2)] = newResult
            }
        })
        const postObj = {
            sets: postArr,
            notes: '',
            reminder: "",
            date: new Date().getTime(),
            rpe: radioVal
        }
        axios.post('/api/exercise',postObj,{ params: { workout:currentWorkoutIndex, log:1, exercise: exerciseIndex}})
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

    return (
        <div className='w-full lg:w-1/2 flex-col gap-3 items-center border border-gray-300 rounded-lg bg-stone-50 px-4 py-1' key={id}>
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
                    <input type="number" id={`${exercises[lift].name}set${index+1}`} name={`${exercises[lift].name}set${index+1}`} defaultValue={set[0]}
                        className='border border-gray-400 rounded-md px-2'
                    />
                    <input type="number" id={`${exercises[lift].name}set${index+1}`} name={`${exercises[lift].name}set${index+1}`} defaultValue={set[1]}
                        className='border border-gray-400 rounded-md px-2'
                    />
                    </div>
                )}
                <FormControl onChange={(e)=>RPEForm(e)} sx={{mx: 'auto', w:'max-content', display:'grid', placeItems:'center'}}>
                    <RadioGroup row sx={{display:"flex", alignItems:'center'}}>
                        <Radio
                            checked={radioVal === 3}
                            value={3}
                            name="rpe"
                        />
                        <p className='text-sm'>Easy</p>
                        <Radio
                            checked={radioVal === 6}
                            value={6}
                            name="rpe"
                        />
                        <p className='text-sm'>Challenging</p>
                        <Radio
                            checked={radioVal === 9}
                            value={9}
                            name="rpe"
                        />
                        <p className='text-sm'>Hard</p>
                    </RadioGroup>
                </FormControl>
                { radioVal > 0 ?
                <button type="submit" 
                    className='bg-gradient-to-r to-slate-400 from-slate-700 rounded-md px-5 py-1 w-3/4 block mx-auto mt-4 mb-2 text-white'
                >
                    Complete
                </button>
                :
                <button type="button" 
                    className='bg-slate-400 bg-opacity-80 rounded-md px-5 py-1 w-3/4 block mx-auto mt-4 mb-2 text-gray-200'
                    disabled
                >
                    Complete
                </button>
                }
                
            </form>
        </div>
    )
}