import React from 'react'

export default function DialogButton ({text, loading, loadingText, disabled, action, type}) {
    function DoNothing() {

    }
    return (
        <button
            type={type}
            className={`block shadow-md py-1 px-3 rounded-lg ${disabled ? 'bg-gray-400' : 'bg-green-600 lg:hover:bg-opacity-80'} text-white transition duration-200 ${loading ? 'animate-pulse' : ''}`}
            onClick={disabled || !action ? DoNothing : action}
        >
            {loading ? loadingText : text}
        </button>
    )
}