"use client"
import { createContext, useState } from 'react'
import { redirect } from 'next/navigation'

const AppContext = createContext()

export function AppProvider({children}) {
    const [activeUser, setActiveUser] = useState(null)

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
        <AppContext.Provider value={{activeUser, setActiveUser, Refresh}} >{children}</AppContext.Provider>
    )
}
export default AppContext