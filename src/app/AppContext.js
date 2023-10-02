"use client"
import { createContext, useState } from 'react'
import { redirect } from 'next/navigation'

const AppContext = createContext()

export function AppProvider({children}) {
    const [activeUser, setActiveUser] = useState(null)
    const [paused, setPaused] = useState(false) 
    const [orientation, setOrientation] = useState("right")
    const [inputType, setInputType] = useState(true)
    function Refresh() {
        if(sessionStorage.getItem('user') && sessionStorage.getItem('user') !== undefined)
        {
            setActiveUser(sessionStorage.getItem('user'))
        }
        else
        {
            redirect('/login')
        }
    }

    return (
        <AppContext.Provider value={{activeUser, setActiveUser, Refresh, paused, setPaused, inputType, setInputType, orientation, setOrientation}} >{children}</AppContext.Provider>
    )
}
export default AppContext