import React, { useState, useEffect } from 'react'
import { DeleteExercise } from '../components/EditWorkout'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import axios from 'axios';
import { BsChevronDown, BsChevronExpand, BsChevronUp, BsThreeDotsVertical, BsTrash } from 'react-icons/bs';
import { RiDraggable, RiPencilLine } from 'react-icons/ri'
import PostExercise from '../components/EditWorkout'
import { repConstant, setConstant } from '@/globals';
import { Dialog, Tooltip } from '@mui/material';
import { HiArrowUp, HiArrowUpLeft, HiChevronUpDown, HiLink } from 'react-icons/hi2';
import GroupExercises from './GroupExercises'
import DialogButton from './DialogButton';

export default function WorkoutList({exercises, setExercises, currentWorkout, setCurrentWorkout, day, i, profile, workouts, setPrograms, setCurrentProgram, setWorkouts, activeUser, currentProgram, HandleDelete}) {
    const [loading, setLoading] = useState(0)
    const [edited, setEdited] = useState(false)
    const [show, setShow] = useState(false)
    const [deleteWorkout, setDeleteWorkout] = useState(false)
    const [currentSS, setCurrentSS] = useState([])
    const [superset, setSuperset] = useState('')
    const [updating, setUpdating] = useState(false)
    const [editName, setEditName] = useState(null)

    function HandleClose() {
        setUpdating(false)
    }

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

    const reorder = (list, startIndex, endIndex) => {
        const result = list
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
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
        axios.post('/api/workouts',postObj, {params:{workout: day, user:activeUser}})
        .then(res=>{
          axios.get('/api/workouts', {params: {user: activeUser}})
          .then(r=>{
              const currentIndex = r.data.currentProgram
              const dayIndex = r.data.currentDay
              const workoutIndex = r.data.programs[currentIndex].schedule[dayIndex]
              setCurrentWorkout(r.data.workouts[workoutIndex])
          })
        })
    }

    function AddSuperset(ind) {
        const postObj = {exercise: parseInt(ind)}
        axios.post('api/superset',postObj,{ params: { workout:day, user:activeUser }})
        .then(res=>{
            axios.get('/api/workouts', { params: { user: activeUser } })
            .then(r=>{
                setWorkouts(r.data.workouts)
            })
            .catch(err=>{
            })
        })
    }

    function RemoveSS(ind) {
        const arrObj = workouts[day].superset
        const index = arrObj.findIndex((item)=>item==ind)
        arrObj.splice(index,1)
        const postObj = {superset:arrObj}
        axios.put('api/superset',postObj,{ params: { workout:day, user:activeUser }})
        .then(res=>{
            axios.get('/api/workouts', { params: { user: activeUser } })
            .then(r=>{
                setWorkouts(r.data.workouts)
            })
            .catch(err=>{
            })
        })
    }

    function EditWorkoutName() {
        setUpdating(true)
        const postObj = {name: editName}
        axios.put('/api/workouts',postObj,{params:{workout: day, user:activeUser}})
        .then(res=>{
          axios.get('/api/workouts', { params: {user:activeUser}})
          .then(r=>{
              const currentIndex = r.data.currentProgram
              const dayIndex = r.data.currentDay
              const workoutIndex = r.data.programs[currentIndex].schedule[dayIndex]
              setWorkouts(r.data.workouts)
              setEditName(null)
                setUpdating(false)
          })
        })
    }
    const ConditionalWrapper = ({ condition, wrapper, children }) =>
    condition ? wrapper(children) : children;

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            {/* <form id={`${i}`} onSubmit={(e)=>PostExercises(e)}> */}
            <form id={`${i}`} onSubmit={(e)=>e.preventDefault()}>
                <div className={`flex items-center justify-between ${show ? 'border-b-2' : ''} p-2 cursor-pointer`}>
                    <div className='flex items-center gap-2 w-full' onClick={()=>setShow(!show)}>
                        { !show ? 
                            <BsChevronDown />
                        :
                            <BsChevronUp />
                        }
                        <p>{workouts[day].name}</p>
                        <button className='text-gray-500' type="button"
                            onClick={(e)=>{e.stopPropagation();setEditName(currentWorkout.name)}}
                        >
                            <RiPencilLine />
                        </button>
                    </div>
                    { !loading && !edited && show ?
                        <div className='flex gap-2'>
                            {/* <button disabled className='bg-gray-300 text-white shadow-md px-3 py-0.5 rounded-md' type="button">Save</button> */}
                            <button className='bg-stone-50 text-red-600 px-3 py-0.5 rounded-md' type="button"
                                onClick={()=>setDeleteWorkout(true)}
                            ><BsTrash /></button>
                        </div>
                    : !loading && show ?
                        <div className='flex gap-2'>
                            {/* <button className='bg-green-600 text-white shadow-md px-3 py-0.5 rounded-md' type="submit">Save</button> */}
                            <button className='bg-stone-50 text-red-600 px-3 py-0.5 rounded-md' type="button"
                                onClick={()=>setDeleteWorkout(true)}
                            ><BsTrash /></button>
                        </div>
                    : show ?
                        <></>
                        // <button className='bg-green-600 text-white shadow-md px-3 py-0.5 rounded-md' disabled>Saving...</button>
                    :
                        <button className='bg-stone-50 text-red-600 px-3 py-0.5 rounded-md' type="button"
                            onClick={()=>setDeleteWorkout(true)}
                        ><BsTrash /></button>
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
                                    workouts[day].superset.includes(workouts[day].exercises[ind-1]) ?
                                    <></>
                                    :
                                    <Draggable key={exercises[ex].name} draggableId={exercises[ex].name} index={ind}>
                                        {(provided, snapshot)=>(
                                            <div className={`text-sm ${!show ? 'h-[0px]' : 'h-max'}`}
                                                ref={provided.innerRef}
                                                style={getItemStyle(snapshot.isDragging,
                                                    provided.draggableProps.style)}
                                                {...provided.draggableProps}
                                            >
                                                 <ConditionalWrapper
                                                    condition={!(workouts[day].superset.includes(ex))}
                                                    wrapper={children => <a {...provided.dragHandleProps}>{children}</a>}
                                                >
                                                    <div className='w-full p-2'>
                                                        <div className='flex items-start gap-6'>
                                                            <div className={`items-center gap-3 ${workouts[day].superset.includes(ex) ? 'w-full px-2 grid grid-cols-3' : 'flex justify-normal'} `}>
                                                                <p className='break-words w-fit'>{exercises[ex].name}</p>
                                                                {  workouts[day].superset.includes(ex) ?
                                                                    <>
                                                                        <button onClick={()=>RemoveSS(ex)} className='block mx-auto'>
                                                                            <HiLink size={20} className='text-blue-500' />
                                                                        </button>
                                                                        <span>{exercises[workouts[day].exercises[ind+1]].name}</span>
                                                                    </>
                                                                : ind === 0 || workouts[day].superset.includes(workouts[day].exercises[ind-1]) || workouts[day].superset.includes(workouts[day].exercises[ind-2]) ?
                                                                    <></>
                                                                :
                                                                    // <p className="underline text-xs text-blue-500">
                                                                    //     <button type='button' className='text-blue-500 flex items-center'
                                                                    //         onClick={()=>AddSuperset(workouts[day].exercises[ind-1])}
                                                                    //     ><HiArrowUpLeft />&nbsp;Superset</button>
                                                                    // </p>
                                                                    <></>
                                                                }
                                                            </div>
                                                            {  !workouts[day].superset.includes(ex) ?
                                                            <>
                                                                <div className='grid grid-cols-3 gap-x-2 text-xs w-max'>
                                                                    <p>{exercises[ex].target.sets.length}</p>
                                                                    <p>{exercises[ex].target.sets[0]?.reps}</p>
                                                                    <p>{exercises[ex].target.sets[0]?.weight}</p>
                                                                    <p className='text-gray-400'>Sets</p>
                                                                    <p className='text-gray-400'>Reps</p>
                                                                    <p className='text-gray-400'>Weight</p>
                                                                </div>
                                                                <DeleteExercise currentWorkout={workouts[day]} currentWorkoutIndex={day}
                                                                    setPrograms={setPrograms} setCurrentProgram={setCurrentProgram} homepage={false}
                                                                    username={activeUser} item={ex} id={ind} setWorkouts={setWorkouts} exercises={exercises}
                                                                />
                                                            </>
                                                            :
                                                            <></>
                                                            }
                                                        </div>
                                                        {  workouts[day].superset.includes(ex) ?
                                                            <div className='flex w-full justify-between px-2 mt-2'>
                                                                <div className='grid grid-cols-3 gap-x-2 text-xs w-max'>
                                                                    <p>{exercises[ex].target.sets.length}</p>
                                                                    <p>{exercises[ex].target.sets[0]?.reps}</p>
                                                                    <p>{exercises[ex].target.sets[0]?.weight}</p>
                                                                    <p className='text-gray-400'>Sets</p>
                                                                    <p className='text-gray-400'>Reps</p>
                                                                    <p className='text-gray-400'>Weight</p>
                                                                </div>
                                                                <div className='grid grid-cols-3 gap-x-2 text-xs w-max'>
                                                                    <p>{exercises[workouts[day].exercises[ind+1]].target.sets.length}</p>
                                                                    <p>{exercises[workouts[day].exercises[ind+1]].target.sets[0]?.reps}</p>
                                                                    <p>{exercises[workouts[day].exercises[ind+1]].target.sets[0]?.weight}</p>
                                                                    <p className='text-gray-400'>Sets</p>
                                                                    <p className='text-gray-400'>Reps</p>
                                                                    <p className='text-gray-400'>Weight</p>
                                                                </div>
                                                            </div>
                                                            :
                                                            <></>
                                                        }
                                                    </div>
                                                </ConditionalWrapper>
                                            </div>
                                        )}
                                    </Draggable>
                                )}
                                {provided.placeholder}
                            </div>
                        )}
                        </Droppable>
                        <PostExercise currentWorkout={workouts[day]} currentWorkoutIndex={day} setCurrentWorkout={setCurrentWorkout} setCurrentProgram={setCurrentProgram}
                            username={activeUser} exercises={exercises} setPrograms={setPrograms} setWorkouts={setWorkouts} homepage={false} setExercises={setExercises}
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
            <Dialog open={editName !== null} onClose={()=>setEditName(null)}>
                <div className='px-4 py-3'>
                    <p>Rename Workout</p>
                    <input type="text" value={editName} onChange={(e)=>setEditName(e.target.value)}
                        className='rounded-sm border border-neutral-500 px-2 py-1'
                    />
                    <div className='flex justify-between mt-8'>
                        <button className={`shadow-md border ${updating ? 'text-gray-200 border-gray-200' : ' border-neutral-500'} rounded-md py-1 px-3`} disabled={updating}
                            onClick={()=>setEditName(null)}
                        >Cancel</button>
                        <DialogButton type='button' text='Save' loadingText='Saving...' loading={updating} setLoading={setUpdating}
                            disabled={updating} action={EditWorkoutName}
                        />
                    </div>
                </div>
            </Dialog>
        </DragDropContext>
    )
}