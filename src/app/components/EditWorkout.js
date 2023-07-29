import React, { useState } from 'react'
import axios from 'axios'
import { BsTrash } from 'react-icons/bs'
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'

export default function PostExercise({username, currentWorkoutIndex, currentWorkout, setCurrentWorkout, exercises}) {
    const [loading, setLoading] = useState(false)

    function AddExercise(e) {
        const newExercise = exercises[e.target.value]
        const newWorkout = currentWorkout.exercises
        newWorkout.push(newExercise)
        const postObj = newWorkout
        setLoading(true)
        axios.post('/api/workouts',postObj, {params:{workout: currentWorkoutIndex, user:username}})
        .then(res=>{
            axios.get('/api/user')
            .then(r=>{
                const currentIndex = r.data.documents[0].currentProgram
                const dayIndex = r.data.documents[0].currentDay
                const workoutIndex = r.data.documents[0].programs[currentIndex].schedule[dayIndex]
                setCurrentWorkout(r.data.documents[0].workouts[workoutIndex])
                setLoading(false)
            })
            .catch(err=>{
                setLoading(false)
            })
        })
    } 
    

    return(
        <div className='flex justify-between rounded-md px-3 py-2 items-center bg-neutral-200 bg-opacity-80'>
            { !loading ?
            <>
                <p>Add Exercise</p>
                <select className='border border-gray-400 rounded-md p-1 bg-stone-50'
                    onChange={(e)=>AddExercise(e)} defaultValue=''
                >
                    <option value='' disabled>Select Exercise</option>
                    {exercises.map((ex,id)=>
                        <option value={id} key={id}>{ex.name}</option>
                    )}
                </select>
            </>
            :
            <>
                <div class="animate-pulse rounded-full bg-gray-200 h-4 w-full"></div>
            </>
            }
            
        </div>
    )
}

export function DeleteExercise ({id, currentWorkout, setCurrentWorkout, currentWorkoutIndex, username, homepage, setPrograms, setCurrentProgram, setWorkouts}){
    const [deleting, setDeleting] = useState(null)
    const [loading, setLoading] = useState(false)

    function HandleDelete() {
        const postObj = [...currentWorkout.exercises]
        postObj.splice(deleting, 1)
        setLoading(true)
        axios.post('/api/workouts',postObj, {params:{workout: currentWorkoutIndex, user:username}})
        .then(res=>{
            axios.get('/api/user')
            .then(r=>{
                const currentIndex = r.data.documents[0].currentProgram
                const dayIndex = r.data.documents[0].currentDay
                const workoutIndex = r.data.documents[0].programs[currentIndex].schedule[dayIndex]
                if(homepage)
                {
                    setCurrentWorkout(r.data.documents[0].workouts[workoutIndex])
                }
                else
                {
                    setPrograms(r.data.documents[0].programs)
                    const currentIndex = r.data.documents[0].currentProgram
                    setCurrentProgram(r.data.documents[0].programs[currentIndex])
                    setWorkouts(r.data.documents[0].workouts)
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
        { currentWorkout.exercises.length > 0 && deleting !== null ? 
          <Dialog open={deleting !== null} onClose={()=>setDeleting(null)} maxWidth="sm" fullWidth>
              <p className='font-semibold text-lg px-3 py-3'>Remove exercise</p>
              <div className='px-3 py-3'>
                <p className='text-md'>Are you sure you want to remove {currentWorkout.exercises[deleting].name}?</p>
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

