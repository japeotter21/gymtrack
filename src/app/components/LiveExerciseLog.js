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
import { useSwipeable } from 'react-swipeable';

const textOptions = ['Machine taken?', 'Machine broken?', 'Not feeling it?', 'In a hurry?']

export default function LiveExerciseLog({complete, lift, id, setComplete, currentWorkout, profile, currentWorkoutIndex, exercises, setExercises, username,
    setFinishObj, setCurrentWorkout, setActiveSlide, activeSlide
    })
{
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
    const [randomText, setRandomText] = useState(0)
    const [swap, setSwap] = useState(false)
    const [choice, setChoice] = useState(lift)
    const [initialLift, setInitialLift] = useState(null)
    const [showDirections, setShowDirections] = useState(false)
    const [swipe, setSwipe] = useState(true)
    const handlers = useSwipeable({
        onSwipeStart: () => setShowDirections(true),
        onSwipedLeft(e) {
            if(-e.deltaX > 200 && activeSlide < currentWorkout.exercises.length - 2 && swipe)
            {
                setActiveSlide(activeSlide+1)
                setShowDirections(false)
            }
        },
        onSwipedRight(e) {
            if (e.deltaX > 200 && activeSlide > 0 && swipe)
            {
                setActiveSlide(activeSlide-1)
                setShowDirections(false)
            }
        },
    });

    useEffect(()=>{
        setRandomText(Math.floor(Math.random()*4))
        setInitialLift(lift)
    },[])

    useEffect(()=>{
        if(exercises.length > 0)
        {
            setTargetSets(exercises[choice].target.sets)
        }
    },[choice, exercises])

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

    useEffect(()=>{
        if(choice != lift) {
            const currenttemp = Object.assign({}, currentWorkout)
            currenttemp.exercises.splice(id,1,
                {
                    exercise: parseInt(choice),
                    superset: superset
                }
            )
            setCurrentWorkout(currenttemp)
            setSwap(false)
        }
        else if (currentWorkout.exercises[id].exercise !== initialLift && initialLift !== null)
        {
            const currenttemp = Object.assign({}, currentWorkout)
            currenttemp.exercises.splice(id,1,
                {
                    exercise: lift,
                    superset: superset
                }
            )
            setCurrentWorkout(currenttemp)
        }
    },[choice])
    
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
            name: exercises[choice].name,
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
        <div
            className={`w-5/6 lg:w-1/2 flex-col mx-auto gap-3 items-center border border-gray-300 rounded-lg ${completed && !editing ? 'bg-neutral-200' : 'bg-stone-50'} px-4 py-3 shadow-md`} key={id}
            {...handlers} style={{preventScrollOnSwipe:true}}
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
                <div className='grid grid-cols-3 mt-4 gap-2 items-center'>
                    <p className='text-xs text-neutral-500'>Set</p>
                    <p className='text-xs text-neutral-500'>Reps</p>
                    <p className='text-xs text-neutral-500'>Weight</p>
                </div>
            </div>
            <form id={`lift-${lift}`} onSubmit={(e)=>SubmitSetForm(e)} style={{trackTouch:false}}>
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
                            <select type="number" id={`${exercises[choice].name}set${index+1}`} name={`${exercises[choice].name}set${index+1}`} defaultValue={set.reps || ''}
                                className='border border-gray-400 rounded-md px-2'
                            >
                                {repConstant.map((rep,number)=>
                                    <option value={rep} key={number}>{rep}</option>
                                )}
                            </select>
                            <input type="number" step="0.5" id={`${exercises[choice].name}set${index+1}`} name={`${exercises[choice].name}set${index+1}`} defaultValue={set.weight || ''}
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
                        <select disabled={completed && !editing} type="number" id={`${exercises[choice].name}set${index+1}`} name={`${exercises[choice].name}set${index+1}`} defaultValue={set.reps || ''}
                            className='border border-gray-400 rounded-md px-2'
                        >
                            {repConstant.map((rep,number)=>
                                <option value={rep} key={number}>{rep}</option>
                            )}
                        </select>
                        <input disabled={completed && !editing} type="number" step="0.5" id={`${exercises[choice].name}set${index+1}`} name={`${exercises[choice].name}set${index+1}`} defaultValue={set.weight || ''}
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
                        <p className='text-xs text-blue-500 flex flex-col items-center w-full'>
                            |
                            <HiLink size={23} />
                            |
                        </p>
                        <p className='text-lg font-semibold text-center my-2'>{exercises[ssId].name}</p>
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
                />
                { completed ? 
                <div className='mt-2 mb-2 flex justify-between'>
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
            <div className='flex justify-center mt-4 gap-1'>
                <p className='text-sm text-gray-400'>{textOptions[randomText]}</p>
                <button className='text-sm text-blue-500 underline'
                    onClick={()=>setSwap(true)}
                >Swap Exercise</button>
            </div>
            <Dialog open={swap} onClose={()=>setSwap(false)}>
                <div className='px-4 py-3'>
                    <div className='font-semibold'>New Exercise</div>
                    <GroupExercises exercises={exercises} setChoice={setChoice} choice={choice} ss={false} disabled={completed !== null} />
                    <button className='border border-gray-400 py-1 px-3 mt-4 rounded-xl lg:hover:bg-red-100 lg:hover:border-red-200 lg:hover:text-red-500 lg:hover:scale-105 transition duration-200'
                        onClick={()=>{setSwap(false);setChoice(lift)}}
                    >Cancel</button>
                </div>
            </Dialog>
        </div>
    )
}