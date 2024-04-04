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

export default function WorkoutList({exercises, setExercises, currentWorkout, setCurrentWorkout, day, i, profile, workouts, setPrograms, setCurrentProgram, setWorkouts, activeUser, programIndex, HandleDelete}) {
    const [loading, setLoading] = useState(0)
    const [edited, setEdited] = useState(false)
    const [show, setShow] = useState(false)
    const [deleteWorkout, setDeleteWorkout] = useState(false)
    const [currentSS, setCurrentSS] = useState([])
    const [superset, setSuperset] = useState('')
    const [editing, setEditing] = useState(null)
    const [editSets, setEditSets] = useState(0)
    const [editReps, setEditReps] = useState(0)
    const [editWeight, setEditWeight] = useState(0)
    const [editNotes, setEditNotes] = useState('')
    const [updating, setUpdating] = useState(false)
    const [editName, setEditName] = useState(null)
    
    useEffect(()=>{
        if(editing !== null)
        {
            setEditSets(editing.target?.sets?.length || 0)
            setEditReps(editing.target?.sets[0]?.reps || 0)
            setEditWeight(editing.target?.sets[0]?.weight || 0)
            setEditNotes(editing.target?.notes)
        }
    },[editing])

    function HandleEditClose() {
        setEditSets(0)
        setEditReps(0)
        setEditWeight(0)
        setEditNotes('')
        setEditing(null)
    }

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
        axios.post(`/api/program/${programIndex}/${day}`,postObj, {params:{user:activeUser}})
        .then(res=>{
          axios.get('/api/programs', {params: {user: activeUser}})
          .then(r=>{
              setCurrentWorkout(r.data.programs[programIndex].schedule[day])
          })
        })
    }

    function HandleEdit() {
        const newSets = parseInt(editSets)
        const newReps = parseInt(editReps)
        const newWeight = editWeight
        let newPostArr = Array.from({length: newSets}, x=>0)
        newPostArr.forEach((item,id)=>newPostArr[id]={reps:newReps, weight:newWeight})
        const postObj = {
            sets: newPostArr,
            notes: editNotes,
            reminder: ""
        }
        setUpdating(true)
        const exIndex = currentWorkout.exercises.findIndex((item)=>item.name === editing.name)
        axios.put(`/api/program/${programIndex}/${programIndex}/${exIndex}`,postObj, { params: {user: activeUser } })
        .then(res=>{
            axios.get('/api/programs',{ params: { user:activeUser }})
            .then(r=>{
                const workoutIndex = r.data.programs[programIndex]
                setCurrentProgram(workoutIndex)
                HandleEditClose()
                setUpdating(false)
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
        const arrObj = currentWorkout.superset
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
                        <p>{currentWorkout.name}</p>
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
                                { currentWorkout.exercises.map((ex,ind)=>
                                    <Draggable key={ex.name} draggableId={ex.name} index={ind}>
                                        {(provided, snapshot)=>(
                                            <div className={`text-sm ${!show ? 'h-[0px]' : 'h-max'}`}
                                                ref={provided.innerRef}
                                                style={getItemStyle(snapshot.isDragging,
                                                    provided.draggableProps.style)}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                <div className='w-full p-2'>
                                                    <div className='flex justify-between items-start gap-6'>
                                                        <div className={`items-center gap-3 ${currentWorkout?.superset.includes(ex) ? 'w-full px-2 grid grid-cols-3' : 'flex justify-normal'} `}>
                                                            <p className='break-words w-fit'>{ex.name}</p>
                                                        </div>
                                                        <div className='flex'>
                                                            <div className='grid grid-cols-3 gap-x-2 text-xs w-max' onClick={()=>setEditing(ex)}>
                                                                <p>{ex.target.sets.length}</p>
                                                                <p>{ex.target.sets[0]?.reps}</p>
                                                                <p>{ex.target.sets[0]?.weight}</p>
                                                                <p className='text-gray-400'>Sets</p>
                                                                <p className='text-gray-400'>Reps</p>
                                                                <p className='text-gray-400'>Weight</p>
                                                            </div>
                                                            <DeleteExercise currentWorkout={currentWorkout} currentWorkoutIndex={day} programIndex={programIndex}
                                                                setPrograms={setPrograms} setCurrentProgram={setCurrentProgram} homepage={false}
                                                                username={activeUser} item={ex} id={ind} setWorkouts={setWorkouts} exercises={exercises}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                )}
                                {provided.placeholder}
                            </div>
                        )}
                        </Droppable>
                        <PostExercise currentWorkout={currentWorkout} currentWorkoutIndex={day} setCurrentWorkout={setCurrentWorkout} setCurrentProgram={setCurrentProgram}
                            username={activeUser} exercises={exercises} setPrograms={setPrograms} setWorkouts={setWorkouts} homepage={false} setExercises={setExercises}
                            programIndex={programIndex}
                        />
                    </div>
            </form>
            { workouts.length > 0 && deleteWorkout ? 
                <Dialog open={deleteWorkout} onClose={()=>setDeleteWorkout(false)}>
                    <div className='px-4 py-3'>
                        <p>Are you sure you want to delete {currentWorkout.name}?</p>
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
            { exercises.length > 0 && editing !== null ? 
                <Dialog open={editing !== null} onClose={HandleEditClose} maxWidth="lg" fullWidth>
                <p className='font-semibold text-lg px-3 py-3'>{editing.name}</p>
                <div className='grid grid-cols-2 px-3 py-3 gap-3'>
                    <p className='text-md'>Sets</p>
                    <select className='text-md border rounded-lg w-full py-1 px-2' value={editSets}
                    onChange={(e)=>setEditSets(e.target.value)}
                    >
                    {setConstant.map((num,setNum)=>
                        <option value={num} key={setNum}>{num}</option>
                    )}
                    </select>
                    <p className='text-md'>Reps</p>
                    <select className='text-md border rounded-lg w-full py-1 px-2' value={editReps}
                    onChange={(e)=>setEditReps(e.target.value)}
                    >
                    {repConstant.map((num,setNum)=>
                        <option value={num} key={setNum}>{num}</option>
                    )}
                    </select>
                    <p className='text-md'>Weight (lbs)</p>
                    <input className='text-md border rounded-lg w-full py-1 px-2' value={editWeight}
                    onChange={(e)=>setEditWeight(e.target.value)}
                    />
                </div>
                <div className='flex justify-end px-3 py-3 gap-3'>
                    <button className='border border-gray-400 py-1 px-3 rounded-xl lg:hover:bg-red-100 lg:hover:border-red-200 lg:hover:text-red-500 lg:hover:scale-105 transition duration-200'
                        onClick={HandleEditClose}
                    >Cancel</button>
                    <DialogButton disabled={updating} loading={updating} action={HandleEdit} text={'Update'} loadingText={'Updating...'} type="button"/>
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