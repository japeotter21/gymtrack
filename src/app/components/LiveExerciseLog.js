"use client"
import React, { useState, useEffect } from 'react'
import { BsPause, BsPauseBtn, BsPlay, BsPlus, BsTrash } from 'react-icons/bs'
import axios from 'axios'
import { useRouter } from 'next/navigation';
import { FormControl, RadioGroup, FormControlLabel, Radio, Slider } from '@mui/material';
import { repConstant } from '@/globals';
import LiveButton from './LiveButton.js'
import { HiLink } from 'react-icons/hi2';

export default function LiveExerciseLog({complete, lift, id, setComplete, currentWorkout, profile, currentWorkoutIndex, exercises, setExercises, username, setFinishObj}) {
    const [targetSets, setTargetSets] = useState([])
    const [radioVal, setRadioVal] = useState(6)
    const [addSet, setAddSet] = useState([])
    const [ssId, setSSId] = useState(null)
    const [superset, setSuperset] = useState([])
    const [editing, setEditing] = useState(false)
    const [completed, setCompleted] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [updating, setUpdating] = useState(false)

    useEffect(()=>{
        if(exercises.length > 0)
        {
            setTargetSets(exercises[lift].target.sets)
        }
    },[lift, exercises])

    useEffect(()=>{
        if(complete)
        {
            if(complete.length > 0 )
            {
                complete[id].rpe > 0 ? setCompleted(complete[id]) : setCompleted(null)
                complete[id].superset.length > 0 ? setSSId(complete[id].superset[0]) : <></>
            }
            else
            {
                setCompleted(null)
            }
            setLoading(false)
        }
    },[complete])

    useEffect(()=>{
        if(ssId !== null)
        {
            if(sessionStorage.getItem('supersets') && sessionStorage.getItem('supersets') !== undefined)
            {
                const currentSSObj = JSON.parse(sessionStorage.getItem('supersets'))
                const sessIndex = currentSSObj.findIndex((item,id)=>item.name === exercises[ssId].name)
                if(sessIndex < 0)
                {
                    setSuperset(exercises[ssId].target.sets)
                }
                else
                {
                    setSuperset(currentSSObj[sessIndex].sets)
                }
            }
            else
            {
                setSuperset(exercises[ssId].target.sets)
            }
        }
    },[ssId])

    function SubmitSetForm(e) {
        e.preventDefault()
        const exerciseIndex = e.target.id.split('-')[1]
        const currentExercise = exercises[exerciseIndex]
        const formLength = !completed ? targetSets : completed.sets
        const extraFormLength = addSet.flat()
        let postArr = []
        formLength.forEach((item,id)=>{
            const newResult = {reps: parseInt(e.target[3*id + 1].value),weight: e.target[3*id + 2].value}
            postArr.push(newResult)
        })
        extraFormLength.forEach((item,id)=>{
            if(id % 2 === 1)
            {
                const newResult = {reps:parseInt(extraFormLength[id-1]),weight: item}
                postArr.push(newResult)
            }
        })
        const resultObj = {
            name: exercises[lift].name,
            notes: '',
            rpe: radioVal,
            sets: postArr,
            superset: complete[id].superset
        }
        const ssObj = ssId !== null ? {
                name: exercises[ssId].name,
                notes: '',
                rpe: radioVal,
                sets: superset,
                superset: []
            }
            : null
        if (ssObj !== null)
        {
            if(sessionStorage.getItem('supersets') && sessionStorage.getItem('supersets') !== undefined)
            {
                const currentSSObj = JSON.parse(sessionStorage.getItem('supersets'))
                const sessIndex = currentSSObj.findIndex((item,id)=>item.name === ssObj.name)
                if(sessIndex < 0)
                {
                    currentSSObj.push(ssObj)
                    sessionStorage.setItem('supersets',JSON.stringify(currentSSObj))
                }
                else
                {
                    currentSSObj.splice(sessIndex,1,ssObj)
                    sessionStorage.setItem('supersets',JSON.stringify(currentSSObj))
                }
            }
            else
            {
                sessionStorage.setItem('supersets',JSON.stringify([ssObj]))
            }
        }
        if(completed && editing)
        {
            setUpdating(true)
            axios.put('/api/history',resultObj,{ params: { user: username, index: id }})
            .then(res=>{
                axios.get('/api/workouts',{ params: {user: username}})
                .then(r=>{
                    setFinishObj(r.data.inProgress)
                    setComplete(r.data.inProgress.results)
                    setEditing(false)
                    setAddSet([])
                    setUpdating(false)
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
            setSaving(true)
            axios.put('/api/history',resultObj,{ params: { user: username, index: id }})
            .then(res=>{
                axios.get('/api/workouts',{ params: {user: username}})
                .then(r=>{
                    setComplete(r.data.inProgress.results)
                    setCompleted(r.data.inProgress.results[id])
                    setAddSet([])
                    setFinishObj(r.data.inProgress)
                    setSaving(false)
                })
                .catch(err=>{
                    console.error(err)
                    setSaving(false)
                })
            }) 
            .catch(err=>{
                console.error(err)
                setSaving(false)
            })
        }
    }

    function RemoveExtraSet() {
        const setTemp = [...addSet]
        setTemp.pop()
        setAddSet(setTemp)
    }

    function RemoveTargetSet(index) {
        const setTemp = [...targetSets]
        setTemp.splice(index,1)
        setTargetSets(setTemp)
    }

    function RemoveCompletedSet(index) {
        const setTemp = Object.assign({},completed)
        setTemp.sets.splice(index,1)
        setCompleted(setTemp)
    }

    function UpdateAddSet(e, index, target) {
        let addTemp = [...addSet]
        if (target==="rep")
        {
            addTemp[index][0] = parseInt(e.target.value)
        }
        else if (target==="weight")
        {
            addTemp[index][1] = e.target.value
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

    function RemoveSS() {
        const setTemp = [...superset]
        setTemp.pop()
        setSuperset(setTemp)
    }

    function UpdateSS(e, index, target) {
        let addTemp = [...superset]
        if (target==="rep")
        {
            addTemp[index].reps = parseInt(e.target.value)
        }
        else if (target==="weight")
        {
            addTemp[index].weight = e.target.value
        }
        setSuperset(addTemp)
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
                    targetSets.map((set,index)=>
                        <div key={index} className='grid grid-cols-3 my-1 gap-2 items-center'>
                            <div className='flex gap-3 items-center'>
                                <p className='text-sm'>{index+1}</p>
                                { index === 0 ?
                                    <button type="button"></button>
                                :
                                    <button className='text-red-500 text-xs border border-red-200 rounded-md px-1' disabled={completed && !editing}
                                        type="button"
                                        onClick={()=>RemoveTargetSet(index)}
                                    >Remove</button>
                                }
                            </div>
                            <select type="number" id={`${exercises[lift].name}set${index+1}`} name={`${exercises[lift].name}set${index+1}`} defaultValue={set.reps || ''}
                                className='border border-gray-400 rounded-md px-2'
                            >
                                {repConstant.map((rep,number)=>
                                    <option value={rep} key={number}>{rep}</option>
                                )}
                            </select>
                            <input type="number" step="0.5" id={`${exercises[lift].name}set${index+1}`} name={`${exercises[lift].name}set${index+1}`} defaultValue={set.weight || ''}
                                className='border border-gray-400 rounded-md px-2' required
                            />
                        </div>
                    )
                :
                completed.sets.map((set,index)=>
                    <div key={`${completed.name}${index}`} className='grid grid-cols-3 my-1 gap-2 items-center'>
                        <div className='flex gap-3 items-center'>
                            <p className='text-sm'>{index+1}</p>
                            { index === 0 ?
                                <button type="button"></button>
                            :
                                <button className='text-red-500 text-xs border border-red-200 rounded-md px-1' disabled={completed && !editing}
                                    type="button"
                                    onClick={()=>RemoveCompletedSet(index)}
                                >Remove</button>
                            }
                        </div>
                        <select disabled={completed && !editing} type="number" id={`${exercises[lift].name}set${index+1}`} name={`${exercises[lift].name}set${index+1}`} defaultValue={set.reps || ''}
                            className='border border-gray-400 rounded-md px-2'
                        >
                            {repConstant.map((rep,number)=>
                                <option value={rep} key={number}>{rep}</option>
                            )}
                        </select>
                        <input disabled={completed && !editing} type="number" step="0.5" id={`${exercises[lift].name}set${index+1}`} name={`${exercises[lift].name}set${index+1}`} defaultValue={set.weight || ''}
                            className='border border-gray-400 rounded-md px-2' required
                        />
                    </div>
                )
                }
                {addSet.map((set,index)=>
                    <div key={index} className='grid grid-cols-3 my-1 gap-2 items-center'>
                        <div className='flex gap-3 items-center'>
                            <p className='text-sm'>{targetSets.length+index+1}</p>
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
                        <input type="number" step="0.5" id={`extraset${index+1}`} name={`extraset${index+1}`} defaultValue={0} disabled={completed && !editing}
                            className='border border-gray-400 rounded-md px-2'
                            onChange={(e)=>UpdateAddSet(e, index, 'weight')} required
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
                {ssId !== null ? 
                    <>
                        <p className='text-xs text-blue-500 flex flex-col items-center '>
                            |
                            <HiLink size={23} />
                            |
                        </p>
                        <p className='text-lg font-semibold text-center'>{exercises[ssId].name}</p>
                        {superset.map((ss,index)=>
                            <div key={index} className='grid grid-cols-3 my-1 gap-2 items-center'>
                                <div className='flex gap-3 items-center'>
                                    <p className='text-sm'>{index+1}</p>
                                    <button className='text-red-500 text-xs border border-red-200 rounded-md px-1' disabled={completed && !editing}
                                        type="button"
                                        onClick={RemoveSS}
                                    >Remove</button>
                                </div>
                                <select type="number" id={`ss${index+1}`} name={`ss${index+1}`} defaultValue={ss.reps} disabled={completed && !editing}
                                    className='border border-gray-400 rounded-md px-2'
                                    onChange={(e)=>UpdateSS(e, index, 'rep')}
                                >
                                    {repConstant.map((rep,number)=>
                                        <option value={rep} key={number}>{rep}</option>
                                    )}
                                </select>
                                <input type="number" step="0.5" id={`ss${index+1}`} name={`ss${index+1}`} defaultValue={ss.weight} disabled={completed && !editing}
                                    className='border border-gray-400 rounded-md px-2'
                                    onChange={(e)=>UpdateSS(e, index, 'weight')} required
                                />
                            </div>
                        )}
                        <div className='grid grid-cols-3 my-2 gap-2 items-center'>
                            <button onClick={()=>setSuperset([...superset,{reps:0, weight:"0"}])} type="button" disabled={completed && !editing}
                                className={`text-sm ${completed && !editing ? 'bg-neutral-400 text-white' : 'bg-stone-50 border border-neutral-700 shadow-sm'} rounded-md px-1 py-0.5`}
                            >
                                Add Set
                            </button>
                            <input disabled className='border border-gray-200 rounded-md px-2 bg-gray-100' />
                            <input disabled className='border border-gray-200 rounded-md px-2 bg-gray-100' />
                        </div>
                    </>
                :
                    <></>
                }
                <Slider
                    disabled={completed && !editing}
                    onChange={(e)=>setRadioVal(e.target.value)}
                    track={false}
                    defaultValue={6}
                    sx={{color:"#64748b"}}
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
                />
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
                    <div className='w-1/2'>
                        <LiveButton disabled={!editing || radioVal < 1} text={'Update'} loading={updating} loadingText={'Updating...'} />
                    </div>
                </div>
                :
                    <LiveButton disabled={!(radioVal > 0)} text={'Save'} loading={saving} loadingText={'Saving...'} />
                }
            </form>
        </div>
    )
}