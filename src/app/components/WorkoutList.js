import React from 'react'
import { DeleteExercise } from '../components/EditWorkout'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import axios from 'axios';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { RiDraggable, RiPencilLine } from 'react-icons/ri'
export default function WorkoutList({exercises, currentWorkout, setCurrentWorkout, day, i, profile, workouts, setPrograms, setCurrentProgram, setWorkouts}) {
  
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
        axios.post('/api/workouts',postObj, {params:{workout: day, user:profile.username}})
        .then(res=>{
        axios.get('/api/user')
        .then(r=>{
            const currentIndex = r.data.documents[0].currentProgram
            const dayIndex = r.data.documents[0].currentDay
            const workoutIndex = r.data.documents[0].programs[currentIndex].schedule[dayIndex]
            setPrograms(r.data.documents[0].programs)
            setCurrentProgram(r.data.documents[0].programs[currentIndex])
            setWorkouts(r.data.documents[0].workouts)
        })
        })
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

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div>
                <div className='flex items-center gap-2 border-b-2 p-2'>
                    <p>{workouts[day].name}</p>
                    <button className='text-gray-500'>
                        <RiPencilLine />
                    </button>
                </div>
                <Droppable droppableId={`${i}`} key={0}>
                    {(provided, snapshot)=>(
                        <div className='divide-y flex flex-col'
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                            {...provided.droppableProps}
                        >
                            { workouts[day].exercises.map((ex,ind)=>
                                <Draggable key={ex.name} draggableId={ex.name} index={ind}>
                                    {(provided, snapshot)=>(
                                        <div className='text-sm flex items-stretch'
                                            ref={provided.innerRef}
                                            style={getItemStyle(snapshot.isDragging,
                                                provided.draggableProps.style)}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            <div className='w-full border-l-2 p-2'>
                                                <div className='flex items-center justify-between'>
                                                    <p>{ex.name}</p>
                                                    <DeleteExercise currentWorkout={workouts[day]} currentWorkoutIndex={day}
                                                        setPrograms={setPrograms} setCurrentProgram={setCurrentProgram} homepage={false}
                                                        username={profile.username} id={ind} setWorkouts={setWorkouts}
                                                    />
                                                </div>
                                                <div className='flex flex-col gap-1 text-sm text-gray-500'>
                                                    <div className='grid grid-cols-2 gap-x-6 mb-2'>
                                                        <p>Sets</p>
                                                        <p>Reps</p>
                                                        <select defaultValue={ex.target.sets.length} className='border border-gray-400 rounded-md'>
                                                            {[1,2,3,4,5,6].map((num,setNum)=>
                                                                <option value={num} key={setNum}>{num}</option>
                                                            )}
                                                        </select>
                                                        <select defaultValue={ex.target.sets[0][0]} className='border border-gray-400 rounded-md'>
                                                            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map((num,setNum)=>
                                                                <option value={num} key={setNum}>{num}</option>
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='text-white bg-gray-500 bg-opacity-60 flex flex-col justify-center'>
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
            </div>
        </DragDropContext>
    )
}