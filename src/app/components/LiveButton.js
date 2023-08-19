import React from 'react'

export default function LiveButton({text, disabled, loading, loadingText}) {

    return (
        <button type="submit"  disabled={disabled}
            className={`${disabled ? 'bg-gray-300' : 'bg-gradient-to-r to-green-500 from-green-600'} rounded-full px-5 py-1 w-full block mx-auto mt-4 mb-2 text-white ${loading ? 'animate-pulse' : ''}`}
        >
            {loading ? loadingText : text}
        </button>
    )
}