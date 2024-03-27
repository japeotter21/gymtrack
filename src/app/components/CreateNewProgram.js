import React, { useState, useEffect, useContext} from 'react'
import axios from 'axios'
import DialogButton from './DialogButton'
export default function CreateNewProgram({AddProgram, setNewProgram, updating}) {
    const [templates, setTemplates] = useState([])
    useEffect(()=>{
        axios.get('/api/programs',{params:{default: 'default'}})
        .then(res=>{
            setTemplates(res.data.programs)
        })
    },[])

    return (
        <div className='bg-stone-50 px-4 py-3'>
            <p className='font-semibold mb-4'>Add New Program</p>
            <form id='newProgram' onSubmit={(e)=>AddProgram(e)} className='w-full flex flex-col items-center gap-2'>
                <input id="name" name="name" type="text" placeholder='Name' className='border border-gray-400 rounded-md p-1'
                />
                <textarea id="description" name="description" type="text" placeholder='Description' className='w-full border border-gray-400 rounded-md p-1'
                />
                <p>Or</p>
                <p className='text-xs'>Choose from Template</p>
                <select id="template" name="template" className='border border-gray-400 rounded-md p-1' defaultValue={-1}
                    onChange={(e)=>AddProgram(e, e.target.value)}
                >
                    <option value={-1} disabled>Select...</option>
                    {/* <option value={1}>Push/Pull/Legs</option>
                    <option value={2}>Arnold Split</option>
                    <option value={3}>5-Day Split</option> */}
                    {templates.map((template,index)=>
                        <option key={index} value={JSON.stringify(template)}>{template.name}</option>
                    )}
                </select>
                <div className='flex justify-between mt-4 w-full'>
                    <button className='px-3 py-2 rounded-lg shadow-md bg-opacity-90 bg-gray-300' type='button'
                        onClick={()=>setNewProgram(false)}
                    >Cancel</button>
                    <DialogButton text="Add" loading={updating} loadingText="Adding..." type="submit" action={null} disabled={false} />
                </div>
            </form>
        </div>
    )
}