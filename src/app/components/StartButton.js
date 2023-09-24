import React from 'react'

export default function StartButton({text, loading, loadingText, action}) {

    return (
        <button onClick={action}
                className={`w-full lg:w-[10vw] shadow-md py-2 my-4 lg:my-2 mx-auto lg:ml-auto lg:mr-0 block px-5 rounded-full bg-green-600 lg:hover:bg-opacity-80
                  text-white lg:hover:scale-105 transition duration-300 ${loading ? 'animate-pulse' : ''}`}
        >
            {loading ? loadingText : text}
        </button> 
    )
}