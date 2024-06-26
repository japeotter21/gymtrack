import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BsTrash } from 'react-icons/bs'
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { targetObj } from '@/globals'
import DialogButton from './DialogButton'
import GroupExercises from './GroupExercises'
import { setConstant, repConstant } from '@/globals'
export default function PostExercise({username, currentWorkoutIndex, currentWorkout, setCurrentWorkout, exercises, setExercises,
    homepage, setWorkouts, setPrograms, setCurrentProgram, setCurrentWorkoutIndex, programIndex
    })
{
    const [loading, setLoading] = useState(false)
    const [choice, setChoice] = useState('')
    const [addNew, setAddNew] = useState(false)
    const [addedNew, setAddedNew] = useState(false)
    const [addCustom, setAddCustom] = useState(false)
    const [attributes, setAttributes] = useState([])
    const [newName, setNewName] = useState('')
    const [editEx, setEditEx] = useState(null)
    const [editSets, setEditSets] = useState(0)
    const [editReps, setEditReps] = useState(0)
    const [editWeight, setEditWeight] = useState(0)
    const [edited, setEdited] = useState(false)
    useEffect(()=> {
        if(choice !== '')
        {
            if(choice=== 'custom')
            {
                setAddNew(true)
                setChoice('')
            }
            else
            {
                setEditEx(choice)
            }
        }
    },[choice])
        
    useEffect(()=>{
        if(editEx !== null)
        {
            setEditSets(exercises[parseInt(choice)].target?.sets?.length || 0)
            setEditReps(exercises[parseInt(choice)].target?.sets[0]?.reps || 0)
            setEditWeight(exercises[parseInt(choice)].target?.sets[0]?.weight || 0)
        }
    },[editEx])

    function AddNewExercise() {
        setAddCustom(true)
        const postObj = {
            name: newName,
            attributes: attributes,
            id: exercises.length,
            target: targetObj
        }
        axios.post('api/exerciseList',postObj,{params: {user: username} })
        .then(res=>{
            axios.get('/api/exercise',{ params: { user:username }})
            .then(r=>{
                setExercises(r.data.exercises)
                setAddedNew(true)
                setAddCustom(false)
            })
        })
    }
    
    function AddToWorkout() {
        const newExercise = exercises[parseInt(choice)]
        if(edited)
        {
            const newSets = parseInt(editSets)
            const newReps = parseInt(editReps)
            const newWeight = editWeight
            let newPostArr = Array.from({length: newSets}, x=>0)
            newPostArr.forEach((item,id)=>newPostArr[id]={reps:newReps, weight:newWeight})
            Object.assign(newExercise,{target: {sets: newPostArr}})
        }
        const newWorkout = currentWorkout.exercises
        newWorkout.push(newExercise)
        const postObj = newWorkout
        setLoading(true)
        axios.post(`/api/program/${programIndex}/${currentWorkoutIndex}`, postObj, { params:{ user:username } })
        .then(res=>{
            axios.get('/api/programs', { params: { user: username } })
            .then(r=>{
                setCurrentProgram(r.data.programs[programIndex])
                HandleClose()
            })
            .catch(err=>{
                HandleClose()
            })
        })
    }

    function AddAttribute(value) {
        setAttributes([...attributes,value])
    }

    function RemoveAttribute(item) {
        const arrTemp = [...attributes]
        if(arrTemp.length <= 1)
        {
            setAttributes([])
        }
        else
        {
            const index = arrTemp.findIndex((attr) => attr === item)
            arrTemp.splice(index,1)
            setAttributes(arrTemp)
        }
    }

    function HandleEdit() {
        const newSets = parseInt(editSets)
        const newReps = parseInt(editReps)
        const newWeight = editWeight
        let newPostArr = Array.from({length: newSets}, x=>0)
        newPostArr.forEach((item,id)=>newPostArr[id]={reps:newReps, weight:newWeight})
        const postObj = {
            sets: newPostArr,
            notes: '',
            reminder: ""
        }
        axios.post('/api/exercise',postObj,{ params: {exercise: parseInt(choice), user:username, workout:currentWorkoutIndex}})
        .then(res=>{
            setEdited(false)
            axios.get('/api/exercise',{ params: { user:username }})
            .then(r=>{
                setExercises(r.data.exercises)
                HandleClose()
            })
        })
    }

    function HandleClose() {
        setChoice('')
        setLoading(false)
        setAddNew(false)
        setNewName('')
        setAttributes([])
        setAddedNew(false)
        setAddCustom(false)
        setEditEx(null)
    }

    return(
        <div className='grid grid-cols-3 lg:flex lg:justify-between rounded-md px-3 py-2 items-center bg-neutral-200 bg-opacity-80'>
            { !loading ?
            <>
                <p>Add Exercise</p>
                <div className='col-span-2'>
                    <GroupExercises exercises={exercises} setChoice={setChoice} choice={choice} />
                </div>
            </>
            :
            <>
                <div className="animate-pulse rounded-full bg-gray-200 h-4 w-full"></div>
            </>
            }
            { editEx !== null ? 
                <Dialog open={editEx !== null} onClose={()=>{setEditEx(null);setChoice('')}} maxWidth='lg' fullWidth>
                    <div className='px-4 py-3'>
                        <p className='font-semibold mb-2'>{choice && choice !== '' ? <>{exercises[parseInt(choice)].name}</> : <></>}</p>
                        <div className='grid grid-cols-2 px-3 py-3 gap-3'>
                            <p className='text-md'>Sets</p>
                            <select className='text-md border rounded-lg w-full py-1 px-2' value={editSets}
                            onChange={(e)=>{setEdited(true);setEditSets(e.target.value)}}
                            >
                            {setConstant.map((num,setNum)=>
                                <option value={num} key={setNum}>{num}</option>
                            )}
                            </select>
                            <p className='text-md'>Reps</p>
                            <select className='text-md border rounded-lg w-full py-1 px-2' value={editReps}
                            onChange={(e)=>{setEdited(true);setEditReps(e.target.value)}}
                            >
                            {repConstant.map((num,setNum)=>
                                <option value={num} key={setNum}>{num}</option>
                            )}
                            </select>
                            <p className='text-md'>Weight (lbs)</p>
                            <input className='text-md border rounded-lg w-full py-1 px-2' value={editWeight}
                            onChange={(e)=>{setEdited(true);setEditWeight(e.target.value)}}
                            />
                        </div>
                        <div className='flex justify-between'>
                            <button type="button" className='px-3 py-1 rounded-md shadow-md border border-neutral-300' onClick={()=>{setEditEx(null);setChoice('')}}
                            >Cancel</button>
                            <DialogButton text="Add to Workout" type="button" loadingText="Adding..." loading={loading} action={AddToWorkout} />
                        </div>
                    
                    </div>
                </Dialog>
                :
                <></>
            }
            <Dialog open={addNew} onClose={HandleClose} maxWidth='lg' fullWidth>
                <div className='px-4 py-3'>
                    <p className='font-semibold mb-2'>Add Custom Exercise</p>
                    <div className='grid grid-cols-3 gap-4 items-center'>
                        <p className='text-sm'>Name</p>
                        <input value={newName} onChange={(e)=>setNewName(e.target.value)} className='col-span-2 px-2 py-1 border border-neutral-300 rounded-md' required/>
                        <p className='text-sm col-span-3'>Muscle Group(s)</p>
                        <div className='col-span-3 flex gap-1 flex-wrap'>
                            {['Chest','Shoulder','Tricep','Back','Bicep','Legs','Mobility'].map((item,id)=>
                                <button onClick={()=>attributes.includes(item) ? RemoveAttribute(item) : AddAttribute(item)} type="button"
                                    className={`rounded-full ${attributes.includes(item) ? 'bg-blue-500 text-gray-100' : 'bg-gray-100'} px-2 py-1 shadow-md`}
                                    key={id}
                                    value={item}
                                >
                                    {item}
                                </button>
                            )}
                        </div>
                        {attributes.length < 1 ? <p className='text-xs text-red-500 col-span-3 text-center'>Please select at least 1 muscle group</p> : <></>}
                        {/* <p className='text-sm'>Compound/Accessory</p> */}
                        <button type="button" disabled={addedNew || attributes.length < 1} onClick={AddNewExercise}
                            className={`block mx-auto mb-2 col-span-3 w-max ${addCustom ? 'animate-pulse' : ''}
                                ${addedNew || attributes.length < 1 ? 'bg-gray-300' : 'bg-green-600'} px-3 py-1.5 rounded-md shadow-md text-white`}
                        >
                           {addCustom ? 'Creating...' : 'Create Custom Exercise'}
                        </button>
                    </div>
                    { addedNew ?
                        <div className='w-1/2 mx-auto text-center'>
                                <p>New Exercise Added!</p>
                                <p className='text-sm'>Add to this workout?</p>
                            <div className='flex justify-between'>
                                <button type="button" className='px-3 py-1 rounded-md shadow-md border border-neutral-300' onClick={HandleClose}
                                >No</button>
                                <DialogButton text="Yes" type="button" loadingText="Adding..." loading={loading} action={()=>setChoice(exercises.length-1)} />
                            </div>
                        </div>
                        :
                        <></>
                    }
                </div>
            </Dialog>
        </div>
    )
}

export function DeleteExercise ({item, id, currentWorkout, setCurrentWorkout, currentWorkoutIndex, username, homepage, setPrograms, programIndex, setCurrentProgram, setWorkouts, exercises, displayText}){
    const [deleting, setDeleting] = useState(null)
    const [loading, setLoading] = useState(false)

    function HandleDelete() {
        let postObj = [...currentWorkout.exercises]
        if(postObj.length > 1)
        {
            postObj.splice(deleting, 1)
        }
        else
        {
            postObj = []
        }
        setLoading(true)
        axios.post(`/api/program/${programIndex}/${currentWorkoutIndex}`,postObj, {params:{ user: username }})
        .then(res=>{
            axios.get('/api/programs', { params: { user: username } })
            .then(r=>{
                setCurrentProgram(r.data.programs[programIndex])
                setLoading(false)
                setDeleting(null)
            })
            .catch(err=>{
                setLoading(false)
            })
        })
        .catch(err=>{
            setLoading(false)
        })
    }
    return (
        <>
        <button className={`px-2 py-1 ${displayText ? 'text-neutral-400' : 'text-red-500'} text-sm block ml-auto cursor-pointer`} onClick={()=>setDeleting(id)}>
            {displayText ? <>{displayText}</> : <BsTrash size={15} />}    
        </button>
        { deleting !== null ? 
          <Dialog open={deleting !== null} onClose={()=>setDeleting(null)} maxWidth="sm" fullWidth>
              <p className='font-semibold text-lg px-3 py-3'>Remove exercise</p>
              <div className='px-3 py-3'>
                <p className='text-md'>Are you sure you want to remove {item?.name}?</p>
              </div>
              <div className='flex justify-end px-3 py-3 gap-3'>
                  <button className='border border-gray-400 py-1 px-3 rounded-xl hover:bg-red-100 hover:border-red-200 hover:text-red-500 hover:scale-105 transition duration-200'
                    onClick={()=>setDeleting(null)}
                  >Cancel</button>
                  <button className={`block shadow-md py-1 px-3 rounded-xl bg-red-600 hover:bg-opacity-80 text-white hover:scale-105 transition duration-200 ${loading ? 'animate-pulse' : ''}`}
                    onClick={HandleDelete}
                  >{loading ? <>Removing...</>: <>Remove</>}</button>
              </div>
            </Dialog>
          :
           <></>
        }
        </>
    )
}

