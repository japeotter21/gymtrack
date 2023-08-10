import React, { useState } from 'react'
import { DeleteExercise } from '../components/EditWorkout'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import axios from 'axios';
import { BsChevronDown, BsChevronExpand, BsChevronUp, BsThreeDotsVertical } from 'react-icons/bs';
import { RiDraggable, RiPencilLine } from 'react-icons/ri'
import PostExercise from '../components/EditWorkout'
import { repConstant, setConstant } from '@/globals';
import { Dialog } from '@mui/material';

export default function WorkoutList({exercises, setExercises, currentWorkout, setCurrentWorkout, day, i, profile, workouts, setPrograms, setCurrentProgram, setWorkouts, activeUser, currentProgram, HandleDelete}) {
    const [loading, setLoading] = useState(0)
    const [edited, setEdited] = useState(false)
    const [show, setShow] = useState(false)
    const [deleteWorkout, setDeleteWorkout] = useState(false)

    const getListStyle = isDraggingOver => ({
        // background: isDraggingOver && mode === 'light' ? 'linear-gradient(#2997ff55, white)' : isDraggingOver && mode === 'dark' ? 'linear-gradient(#010304, #2997ff55)' : 'none',
        boxShadow: isDraggingOver ? '0 0 10px 2px #2997ff55' : 'none',
        padding: 0,
        width: '100%',
        minHeight: 50
    })
    const getItemStyle = (isDragging, draggableStyle) => ({
        userSelect: 'none',
        ...draggableStyle
    })

    function PostExercises(e) {
        e.preventDefault()
        const endIndex = e.target.length
        const startIndex = 3
        const targetObj = []
        for (let index = startIndex; index < endIndex; index += 3)
        {
            const setTemp = Array.from({length:e.target[index].value}, i => 0)
            setTemp.forEach((item,id)=>setTemp[id] = ({reps: parseInt(e.target[index+1].value), weight: parseInt(e.target[index+2].value)}))
            targetObj.push(setTemp)
        }
        let exercisesTemp = [...exercises]
        let workoutObj = currentWorkout
        workoutObj.exercises.forEach((w,id)=>{
            exercisesTemp[w].target.sets = targetObj[id]
        })
        const postObj = exercisesTemp
        setLoading(true)
        axios.post('/api/exercise',postObj,{ params: { batch:true, user:activeUser }})
        .then(res=>{
            axios.get('/api/workouts', { params: { user: activeUser } })
            .then(r=>{
                const currentIndex = r.data.currentProgram
                const dayIndex = r.data.currentDay
                const workoutIndex = r.data.programs[currentIndex].schedule[dayIndex]
                setPrograms(r.data.programs)
                setCurrentProgram(r.data.programs[currentIndex])
                setWorkouts(r.data.workouts)
                setLoading(false)
                setEdited(false)
                
            })
            .catch(err=>{
                setLoading(false)
                setEdited(false)
            })
            
        })
        .catch(err=>{
            setLoading(false)
            setEdited(false)
        })
    }


    const reorder = (list, startIndex, endIndex) => {
        const result = list
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, parseInt(removed));
        return result;
    };

    function onDragEnd(result) {
        const { source, destination } = result;
        // dropped outside the list
        if (!destination) {
          return;
        }
        //sInd: index of source group
        const sInd = source.droppableId
        const postObj = reorder(currentWorkout.exercises, source.index, destination.index);
        axios.post('/api/workouts',postObj, {params:{workout: day}})
        .then(res=>{
          axios.get('/api/workouts')
          .then(r=>{
              const currentIndex = r.data.currentProgram
              const dayIndex = r.data.currentDay
              const workoutIndex = r.data.programs[currentIndex].schedule[dayIndex]
              setCurrentWorkout(r.data.workouts[workoutIndex])
          })
        })
    }


    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <form id={`${i}`} onSubmit={(e)=>PostExercises(e)}>
                <div className={`flex items-center justify-between ${show ? 'border-b-2' : ''} p-2 cursor-pointer`}>
                    <div className='flex items-center gap-2 w-full' onClick={()=>setShow(!show)}>
                        { !show ? 
                            <BsChevronDown />
                        :
                            <BsChevronUp />
                        }
                        <p>{workouts[day].name}</p>
                        <button className='text-gray-500' type="button">
                            <RiPencilLine />
                        </button>
                    </div>
                    { !loading && !edited && show ?
                        <div className='flex gap-2'>
                            <button disabled className='bg-gray-300 text-white shadow-md px-3 py-0.5 rounded-md' type="button">Save</button>
                            <button className='bg-stone-50 text-red-600 border border-red-100 shadow-md px-3 py-0.5 rounded-md' type="button"
                                onClick={()=>setDeleteWorkout(true)}
                            >Delete</button>
                        </div>
                    : !loading && show ?
                        <div className='flex gap-2'>
                            <button className='bg-green-600 text-white shadow-md px-3 py-0.5 rounded-md' type="submit">Save</button>
                            <button className='bg-stone-50 text-red-600 border border-red-100 shadow-md px-3 py-0.5 rounded-md' type="button"
                                onClick={()=>setDeleteWorkout(true)}
                            >Delete</button>
                        </div>
                    : show ?
                        <button className='bg-green-600 text-white shadow-md px-3 py-0.5 rounded-md' disabled>Saving...</button>
                    :
                        <button className='bg-stone-50 text-red-600 border border-red-100 shadow-md px-3 py-0.5 rounded-md' type="button"
                            onClick={()=>setDeleteWorkout(true)}
                        >Delete</button>
                    }
                </div>
                    <div className={`transition duration-100 ease-in ${!show ? 'h-[0px] opacity-0 invisible' : 'h-max opacity-1'}`}>
                    <Droppable droppableId={`${i}`} key={0}>
                        {(provided, snapshot)=>(
                            <div className='divide-y flex flex-col'
                                ref={provided.innerRef}
                                style={getListStyle(snapshot.isDraggingOver)}
                                {...provided.droppableProps}
                            >
                                { workouts[day].exercises.map((ex,ind)=>
                                    <Draggable key={exercises[ex].name} draggableId={exercises[ex].name} index={ind}>
                                        {(provided, snapshot)=>(
                                            <div className={`text-sm flex items-stretch  ${!show ? 'h-[0px]' : 'h-max'}`}
                                                ref={provided.innerRef}
                                                style={getItemStyle(snapshot.isDragging,
                                                    provided.draggableProps.style)}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                <div className='w-full border-l-2 p-2'>
                                                    <div className='flex items-center justify-between'>
                                                        <p>{exercises[ex].name}</p>
                                                        <DeleteExercise currentWorkout={workouts[day]} currentWorkoutIndex={day}
                                                            setPrograms={setPrograms} setCurrentProgram={setCurrentProgram} homepage={false}
                                                            username={activeUser} item={ex} id={ind} setWorkouts={setWorkouts} exercises={exercises}
                                                        />
                                                    </div>
                                                    <div className='flex flex-col gap-1 text-sm'>
                                                        <div className='grid grid-cols-3 gap-x-6 mb-2'>
                                                            <p>Sets</p>
                                                            <p>Reps</p>
                                                            <p>Weight</p>
                                                            <select defaultValue={exercises[ex].target.sets.length} className='border border-gray-400 rounded-md'
                                                                onChange={()=>setEdited(true)}
                                                                name={`set-${ind}`} id={`set-${ind}`}
                                                            >
                                                                {setConstant.map((num,setNum)=>
                                                                    <option value={num} key={setNum}>{num}</option>
                                                                )}
                                                            </select>
                                                            <select defaultValue={exercises[ex].target.sets[0].reps} className='border border-gray-400 rounded-md'
                                                                onChange={()=>setEdited(true)}
                                                                name={`rep-${ind}`} id={`rep-${ind}`}
                                                            >
                                                                {repConstant.map((num,setNum)=>
                                                                    <option value={num} key={setNum}>{num}</option>
                                                                )}
                                                            </select>
                                                            <input type="number" defaultValue={exercises[ex].target.sets[0].weight} className='border border-gray-400 rounded-md px-1'
                                                                onChange={()=>setEdited(true)}
                                                                name={`weight-${ind}`} id={`weight-${ind}`}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='text-white bg-neutral-300 flex flex-col justify-center px-1'>
                                                    <RiDraggable size={25} />
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                )}
                                {provided.placeholder}
                            </div>
                        )}
                        </Droppable>
                        <PostExercise currentWorkout={workouts[day]} currentWorkoutIndex={day} setCurrentWorkout={setCurrentWorkout} setCurrentProgram={setCurrentProgram}
                            username={activeUser} exercises={exercises} setPrograms={setPrograms} setWorkouts={setWorkouts} homepage={false}
                        />
                    </div>
            </form>
            { workouts.length > 0 && deleteWorkout ? 
                <Dialog open={deleteWorkout} onClose={()=>setDeleteWorkout(false)}>
                    <div className='px-4 py-3'>
                        <p>Are you sure you want to delete {workouts[day].name}?</p>
                        <div className='flex justify-between mt-4'>
                            <button className='border border-gray-400 py-1 px-3 rounded-xl hover:bg-red-100 hover:border-red-200 hover:text-red-500 hover:scale-105 transition duration-200'
                                onClick={()=>setDeleteWorkout(false)}
                            >Cancel</button>
                            <button className='block shadow-md py-1 px-3 rounded-xl bg-red-600 hover:bg-opacity-80 text-white hover:scale-105 transition duration-200'
                                onClick={()=>HandleDelete(i)}
                            >Remove</button>
                        </div>
                    </div>
                </Dialog>
            :
                <></>
            }
        </DragDropContext>
    )
}