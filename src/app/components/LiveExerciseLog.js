"use client"
import React, { useState, useEffect } from 'react'
import { BsPause, BsPauseBtn, BsPlay, BsPlus, BsTrash } from 'react-icons/bs'
import axios from 'axios'
import { useRouter } from 'next/navigation';
import { FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { repConstant } from '@/globals';

export default function LiveExerciseLog({complete, lift, id, setComplete, currentWorkout, profile, currentWorkoutIndex, exercises, setExercises, username}) {
    const [radioVal, setRadioVal] = useState(6)
    const [addSet, setAddSet] = useState([])
    const [editing, setEditing] = useState(false)
    const [completed, setCompleted] = useState(false)
    const [loading, setLoading] = useState(true)
    console.log(completed)
    useEffect(()=>{
        complete.includes(lift.toString()) ? setCompleted(true) : setCompleted(false)
        setLoading(false)
    },[complete])

    function SubmitSetForm(e) {
        e.preventDefault()
        const exerciseIndex = e.target.id.split('-')[1]
        const currentExercise = exercises[exerciseIndex]
        const postLength = currentExercise.target.sets.length
        //needed to edit results after saving
        const lastIndex = exercises[lift].results.length-1
        const formLength = !completed ? currentExercise.target.sets.flat() : currentExercise.results[lastIndex].sets.flat()
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
        if(completed && editing)
        {
            axios.put('/api/exercise',postObj,{ params: { workout:currentWorkoutIndex, log:1, exercise: exerciseIndex, user: username, index:lastIndex}})
            .then(res=>{
                setEditing(false)
            }) 
        }
        else
        {
            axios.post('/api/exercise',postObj,{ params: { workout:currentWorkoutIndex, log:1, exercise: exerciseIndex, user: username}})
            .then(res=>{
                axios.get('/api/exercise',{ params: {user: username}})
                .then(r=>{
                    const storeComplete = [...complete]
                    storeComplete.push(exerciseIndex)
                    setComplete(storeComplete)
                    setCompleted(true)
                    setExercises(r.data.exercises)
                })
            })
        }
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

    function ToggleEdit(cancel) {
        setEditing(!editing)
        // if(cancel)
        // {
        //     setRevert(true)
        // }
        // else
        // {
        //     setRevert(false)
        // }
    }

    if(loading)
    {
        return(
            <></>
        )
    }

    return (
        <div className={`w-5/6 lg:w-1/2 flex-col gap-3 items-center border border-gray-300 rounded-lg ${completed && !editing ? 'bg-neutral-200' : 'bg-stone-50'} px-4 py-1 shadow-md`} key={id}>
            <p className='text-lg font-semibold text-center'>{exercises[lift].name}</p>
            <div className='grid grid-cols-3 mt-2 gap-2 items-center'>
                <p className='text-xs text-gray-400'>Set</p>
                <p className='text-xs text-gray-400'>Reps</p>
                <p className='text-xs text-gray-400'>Weight</p>
            </div>
            <form id={`lift-${lift}`} onSubmit={(e)=>SubmitSetForm(e)}>
                { !completed ? 
                    exercises[lift].target.sets.map((set,index)=>
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
                    )
                :
                exercises[lift].results[exercises[lift].results.length-1].sets.map((set,index)=>
                    <div key={index} className='grid grid-cols-3 my-1 gap-2 items-center'>
                        <p className='text-sm'>{index+1}</p>
                        <select disabled={completed && !editing} type="number" id={`${exercises[lift].name}set${index+1}`} name={`${exercises[lift].name}set${index+1}`} defaultValue={set[0] || ''}
                            className='border border-gray-400 rounded-md px-2'
                        >
                            {repConstant.map((rep,number)=>
                                <option value={rep} key={number}>{rep}</option>
                            )}
                        </select>
                        <input disabled={completed && !editing} type="number" id={`${exercises[lift].name}set${index+1}`} name={`${exercises[lift].name}set${index+1}`} defaultValue={set[1] || ''}
                            className='border border-gray-400 rounded-md px-2'
                        />
                    </div>
                )
                }
                {addSet.map((set,index)=>
                    <div key={index} className='grid grid-cols-3 my-1 gap-2 items-center'>
                        <div className='flex gap-3 items-center'>
                            <p className='text-sm'>{exercises[lift].target.sets.length+index+1}</p>
                            <button className='text-red-500 text-xs border border-red-200 rounded-md px-1' disabled={completed && !editing}
                                type="button"
                                onClick={RemoveExtraSet}
                            >Remove</button>
                        </div>
                        <select type="number" id={`extraset${index+1}`} name={`extraset${index+1}`} defaultValue={0} disabled={completed && !editing}
                            className='border border-gray-400 rounded-md px-2'
                            onChange={(e)=>UpdateAddSet(e, index, 'rep')}
                        >
                            {repConstant.map((rep,number)=>
                                <option value={rep} key={number}>{rep}</option>
                            )}
                        </select>
                        <input type="number" id={`extraset${index+1}`} name={`extraset${index+1}`} defaultValue={0} disabled={completed && !editing}
                            className='border border-gray-400 rounded-md px-2'
                            onChange={(e)=>UpdateAddSet(e, index, 'weight')}
                        />
                    </div>
                )}
                <div className='grid grid-cols-3 my-2 gap-2 items-center'>
                    <button onClick={()=>setAddSet([...addSet,[0,0]])} type="button" disabled={completed && !editing}
                        className={`text-sm ${completed && !editing ? 'bg-neutral-400 text-white' : 'bg-stone-50 border border-neutral-700 shadow-sm'} rounded-md px-1 py-0.5`}
                    >
                        Add Set
                    </button>
                    <input disabled className='border border-gray-200 rounded-md px-2 bg-gray-100' />
                    <input disabled className='border border-gray-200 rounded-md px-2 bg-gray-100' />
                </div>
                <FormControl onChange={(e)=>RPEForm(e)} sx={{mx: 'auto', w:'max-content', display:'grid', placeItems:'center'}}>
                    <RadioGroup row sx={{display:"flex", alignItems:'center', flexWrap:'wrap', marginX:'auto'}}>
                        <div className='flex items-center'>
                            <Radio disabled={completed && !editing}
                                checked={radioVal === 3}
                                value={3}
                                name="rpe"
                            />
                            <p className='text-sm'>Easy</p>
                        </div>
                        <div className='flex items-center'>
                            <Radio disabled={completed && !editing}
                                checked={radioVal === 6}
                                value={6}
                                name="rpe"
                            />
                            <p className='text-sm'>Challenging</p>
                        </div>
                        <div className='flex items-center'>
                            <Radio disabled={completed && !editing}
                                checked={radioVal === 9}
                                value={9}
                                name="rpe"
                            />
                            <p className='text-sm'>Hard</p>
                        </div>
                    </RadioGroup>
                </FormControl>
                { completed ? 
                <div className='mt-4 mb-2 flex justify-between'>
                    { !editing ? 
                        <button type="button" onClick={()=>ToggleEdit(false)}
                            className='bg-stone-50 border border-neutral-700 rounded-full px-5 py-1 mt-4 mb-2'
                        >
                            Edit
                        </button>
                    :
                        <button type="button" onClick={()=>ToggleEdit(true)}
                            className='bg-stone-50 border border-neutral-700 rounded-full px-5 py-1 mt-4 mb-2'
                        >
                            Cancel
                        </button>
                    }
                    <button type="submit" disabled={!editing && radioVal < 1}
                        className={`${editing && radioVal > 0 ? 'bg-gradient-to-r to-green-500 from-green-600' : 'bg-neutral-400' } rounded-full px-5 py-1 mt-4 mb-2 text-white`}
                    >
                        Update
                    </button>
                </div>
                :
                radioVal > 0 ?
                <button type="submit" 
                    className='bg-gradient-to-r to-green-500 from-green-600 rounded-full px-5 py-1 w-full block mx-auto mt-4 mb-2 text-white'
                >
                    Save
                </button>
                :
                <button type="button" 
                    className='bg-neutral-400 bg-opacity-80 rounded-full px-5 py-1 w-full block mx-auto mt-4 mb-2 text-gray-200'
                    disabled
                >
                    Save
                </button>
                }
            </form>
        </div>
    )
}