import React, { useState, useEffect } from 'react'

export default function GroupExercises({exercises, setChoice, choice, ss, disabled}) {
    const [groupedEx, setGroupedEx] = useState([])

    const muscleGroups = ['Chest', 'Shoulders', 'Triceps', 'Back', 'Biceps', 'Legs', 'Accessory']

    useEffect(()=>{
        if (exercises.length > 0)
        {
            const grouped = Array.from({length: muscleGroups.length},i=>[])
            const filteredTemp = [...exercises]
            filteredTemp.forEach((item,id)=>{
                const key = item.attributes[0].toLowerCase()
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
                    case ('back'):
                        grouped[3].push({name:item.name, id: id})
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

    return (
        <select className='border border-gray-400 rounded-md p-1 bg-stone-50 w-full'
        onChange={(e)=>setChoice(e.target.value)} value={choice} disabled={disabled}
        >
            <option value='' disabled>Select Exercise</option>
            {ss ? 
                <></>
            :
                <option value='custom'>Custom Exercise</option>
            }
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
    )
}