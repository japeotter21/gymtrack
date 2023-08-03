import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BsTrash } from 'react-icons/bs'
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'

export default function PostExercise({username, currentWorkoutIndex, currentWorkout, setCurrentWorkout, exercises, homepage, setWorkouts, setPrograms, setCurrentProgram, setCurrentWorkoutIndex}) {
    const [loading, setLoading] = useState(false)
    const [groupedEx, setGroupedEx] = useState([])
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

    function AddExercise(e) {
        const newExercise = parseInt(e.target.value)
        const newWorkout = currentWorkout.exercises
        newWorkout.push(newExercise)
        const postObj = newWorkout
        setLoading(true)
        axios.post('/api/workouts',postObj, {params:{workout: currentWorkoutIndex}})
        .then(res=>{
            axios.get('/api/workouts')
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
            })
            .catch(err=>{
                setLoading(false)
            })
        })
    } 
    

    return(
        <div className='grid grid-cols-3 lg:flex lg:justify-between rounded-md px-3 py-2 items-center bg-neutral-200 bg-opacity-80'>
            { !loading ?
            <>
                <p>Add Exercise</p>
                <select className='border border-gray-400 rounded-md p-1 bg-stone-50 col-span-2'
                    onChange={(e)=>AddExercise(e)} defaultValue=''
                >
                    <option value='' disabled>Select Exercise</option>
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
        axios.post('/api/workouts',postObj, {params:{workout: currentWorkoutIndex}})
        .then(res=>{
            axios.get('/api/workouts')
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

