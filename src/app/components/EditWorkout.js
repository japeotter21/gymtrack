import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BsTrash } from 'react-icons/bs'
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { targetObj } from '@/globals'

export default function PostExercise({username, currentWorkoutIndex, currentWorkout, setCurrentWorkout, exercises, setExercises, homepage, setWorkouts, setPrograms, setCurrentProgram, setCurrentWorkoutIndex}) {
    const [loading, setLoading] = useState(false)
    const [groupedEx, setGroupedEx] = useState([])
    const [choice, setChoice] = useState('')
    const [addNew, setAddNew] = useState(false)
    const [addedNew, setAddedNew] = useState(false)
    const [attributes, setAttributes] = useState([])
    const muscleGroups = ['Chest', 'Shoulders', 'Triceps', 'Back', 'Biceps', 'Legs', 'Accessory']

    useEffect(()=>{
        if(exercises.length > 0)
        {
            const grouped = Array.from({length: muscleGroups.length},i=>[])
            const filteredTemp = [...exercises]
            filteredTemp.forEach((item,id)=>{
                const key = item.attributes[0]
                switch(key) {
                    case ('chest'):
                        grouped[0].push({name:item.name, id: id})
                        break
                    case ('shoulder'):
                        grouped[1].push({name:item.name, id: id})
                        break
                    case ('front delt'):
                        grouped[1].push({name:item.name, id: id})
                        break
                    case ('side delt'):
                        grouped[1].push({name:item.name, id: id})
                        break
                    case ('rear delt'):
                        grouped[1].push({name:item.name, id: id})
                        break
                    case ('tricep'):
                        grouped[2].push({name:item.name, id: id})
                        break
                    case ('lat'):
                        grouped[3].push({name:item.name, id: id})
                        break
                    case ('trap'):
                        grouped[3].push({name:item.name, id: id})
                        break
                    case ('rhomboid'):
                        grouped[3].push({name:item.name, id: id})
                        break
                    case ('bicep'):
                        grouped[4].push({name:item.name, id: id})
                        break
                    case ('legs'):
                        grouped[5].push({name:item.name, id: id})
                        break
                    case ('quad'):
                        grouped[5].push({name:item.name, id: id})
                        break
                    case ('hamstring'):
                        grouped[5].push({name:item.name, id: id})
                        break
                    default:
                        grouped[6].push({name:item.name, id: id})
                }
            })
            setGroupedEx(grouped)
        }
    },[exercises])

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
                const newExercise = parseInt(choice)
                const newWorkout = currentWorkout.exercises
                newWorkout.push(newExercise)
                const postObj = newWorkout
                setLoading(true)
                axios.post('/api/workouts',postObj, {params:{workout: currentWorkoutIndex, user:username}})
                .then(res=>{
                    axios.get('/api/workouts', {params: { user: username }})
                    .then(r=>{
                        const currentIndex = r.data.currentProgram
                        const dayIndex = r.data.currentDay
                        const workoutIndex = r.data.programs[currentIndex].schedule[dayIndex]
                        if(homepage)
                        {
                            setCurrentWorkout(r.data.workouts[workoutIndex])
                        }
                        else
                        {
                            setPrograms(r.data.programs)
                            const currentIndex = r.data.currentProgram
                            setCurrentProgram(r.data.programs[currentIndex])
                            setWorkouts(r.data.workouts)
                        }
                        setChoice('')
                        setLoading(false)
                        setAddNew(false)
                        setAddedNew(false)
                    })
                    .catch(err=>{
                        setChoice('')
                        setLoading(false)
                        setAddNew(false)
                        setAddedNew(false)
                    })
                })
            }
        }
    },[choice])

    function AddNewExercise(e) {
        e.preventDefault()
        const postObj = {
            name: e.target[0].value,
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
            })
        })
    }   

    function AddAttribute(value) {
        setAttributes([...attributes,value])
    }

    function RemoveAttribute(index) {
        const arrTemp = [...attributes]
        if(arrTemp.length <= 1)
        {
            setAttributes([])
        }
        else
        {
            arrTemp.splice(index,1)
            setAttributes(arrTemp)
        }
    }

    return(
        <div className='grid grid-cols-3 lg:flex lg:justify-between rounded-md px-3 py-2 items-center bg-neutral-200 bg-opacity-80'>
            { !loading ?
            <>
                <p>Add Exercise</p>
                <select className='border border-gray-400 rounded-md p-1 bg-stone-50 col-span-2'
                    onChange={(e)=>setChoice(e.target.value)} value={choice}
                >
                    <option value='' disabled>Select Exercise</option>
                    <option value='custom'>Custom Exercise</option>
                    {groupedEx.map((group,id)=>
                        <>
                            <optgroup label={muscleGroups[id]}>
                            { group.map((ex,ind)=>
                                <option value={ex.id} key={ex.id}>{ex.name}</option>
                            )}
                            </optgroup>
                        </>
                    )}
                </select>
            </>
            :
            <>
                <div className="animate-pulse rounded-full bg-gray-200 h-4 w-full"></div>
            </>
            }
            <Dialog open={addNew} onClose={()=>setAddNew(false)}>
                <div className='px-4 py-3'>
                    <p className='font-semibold mb-2'>Add Custom Exercise</p>
                    <form onSubmit={(e)=>AddNewExercise(e)} className='grid grid-cols-3 gap-4 items-center'>
                        <p className='text-sm'>Name</p>
                        <input id="name" name="name" className='col-span-2 px-2 py-1 border border-neutral-300 rounded-md' required/>
                        <p className='text-sm col-span-3'>Muscle Group(s)</p>
                        <div className='col-span-3 flex gap-1 flex-wrap'>
                            {['Chest','Shoulder','Tricep','Back','Bicep','Legs','Mobility'].map((item,id)=>
                                attributes.includes(item) ?
                                <button onClick={()=>RemoveAttribute(id)} type="button"
                                    className='rounded-full bg-blue-500 text-gray-200 px-2 py-1 shadow-md'
                                    key={id}
                                    value={item}
                                >
                                    {item}
                                </button>
                                :
                                <button onClick={()=>AddAttribute(item)} type="button"
                                    className='rounded-full bg-gray-100 px-2 py-1 shadow-md'
                                    key={id}
                                    value={item}
                                >
                                    {item}
                                </button>
                            )}
                        </div>
                        {attributes.length < 1 ? <p className='text-xs text-red-500 col-span-3 text-center'>Please select at least 1 muscle group</p> : <></>}
                        {/* <p className='text-sm'>Compound/Accessory</p> */}
                        <button type="submit" disabled={addedNew || attributes.length < 1}
                            className={`block mx-auto mb-2 col-span-3 w-max ${addedNew || attributes.length < 1 ? 'bg-gray-300' : 'bg-green-600'} px-3 py-1.5 rounded-md shadow-md text-white`}
                        >
                            Create Custom Exercise
                        </button>
                    </form>
                    { addedNew ?
                        <div className='w-1/2 mx-auto text-center'>
                                <p>New Exercise Added!</p>
                                <p className='text-sm'>Add to this workout?</p>
                            <div className='flex justify-between'>
                                <button className='px-3 py-1 rounded-md shadow-md border border-neutral-300' onClick={()=>{setAddNew(false);setAddedNew(false)}}
                                >No</button>
                                <button className='px-3 py-1 rounded-md shadow-md bg-green-600 text-white' onClick={()=>setChoice(exercises.length-1)}
                                >Yes</button>
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

export function DeleteExercise ({item, id, currentWorkout, setCurrentWorkout, currentWorkoutIndex, username, homepage, setPrograms, setCurrentProgram, setWorkouts, exercises}){
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
        axios.post('/api/workouts',postObj, {params:{workout: currentWorkoutIndex, user: username }})
        .then(res=>{
            axios.get('/api/workouts', { params: { user: username } })
            .then(r=>{
                const currentIndex = r.data.currentProgram
                const dayIndex = r.data.currentDay
                const workoutIndex = r.data.programs[currentIndex].schedule[dayIndex]
                if(homepage)
                {
                    setCurrentWorkout(r.data.workouts[workoutIndex])
                }
                else
                {
                    setPrograms(r.data.programs)
                    const currentIndex = r.data.currentProgram
                    setCurrentProgram(r.data.programs[currentIndex])
                    setWorkouts(r.data.workouts)
                }
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
        <div className='p-2 text-red-500 block ml-auto cursor-pointer' onClick={()=>setDeleting(id)}><BsTrash size={15} /></div>
        { exercises.length > 0 && deleting !== null ? 
          <Dialog open={deleting !== null} onClose={()=>setDeleting(null)} maxWidth="sm" fullWidth>
              <p className='font-semibold text-lg px-3 py-3'>Remove exercise</p>
              <div className='px-3 py-3'>
                <p className='text-md'>Are you sure you want to remove {exercises[item].name}?</p>
              </div>
              <div className='flex justify-end px-3 py-3 gap-3'>
                  <button className='border border-gray-400 py-1 px-3 rounded-xl hover:bg-red-100 hover:border-red-200 hover:text-red-500 hover:scale-105 transition duration-200'
                    onClick={()=>setDeleting(null)}
                  >Cancel</button>
                  <button className='block shadow-md py-1 px-3 rounded-xl bg-red-600 hover:bg-opacity-80 text-white hover:scale-105 transition duration-200'
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

