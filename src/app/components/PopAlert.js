import React, {useState, useEffect} from 'react'
import { BsX } from 'react-icons/bs'

export default function PopAlert({open,autoHideDuration, onClose, message, type }) {


    return ( 
        <>
            { open ?
                <div
                    className={`fixed bottom-12 left-1/12 w-11/12 ${type === 'Warning' ? 'bg-red-200 text-red-700' : type === 'Success' ? 'bg-green-200 text-green-700' : 'bg-neutral-700 text-gray-100' } py-2 px-3 rounded-md flex items-center`}
                >
                    {/* <strong className=''>{type}:&nbsp;</strong> */}
                    <p className='text-xs'>{message}</p>
                    <button className={`${type === 'Warning' ? 'text-red-700' : type === 'Success' ? 'text-green-700' : 'text-gray-200' }`} onClick={onClose}><BsX size={30}/></button>
                </div>
                :
                <></>
            }
            
        </>
            
    )
}