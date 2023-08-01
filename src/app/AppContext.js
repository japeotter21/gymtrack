"use client"
import { createContext, useState } from 'react'

const AppContext = createContext()

export function AppProvider({children}) {
    const [activeUser, setActiveUser] = useState(null)

    return (
        <AppContext.Provider value={{activeUser, setActiveUser}} >{children}</AppContext.Provider>
    )
}
export default AppContext