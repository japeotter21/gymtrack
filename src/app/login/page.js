"use client"
import React, { useState, useEffect, useContext } from 'react'
import Image from 'next/image'
import axios from 'axios'
import AppContext from '../AppContext'
import { useRouter } from 'next/navigation'
import { Alert, Snackbar } from '@mui/material'

export default function Schedule() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [newUser, setNewUser] = useState(false)
    const [warning, setWarning] = useState(null)
    const [passWarning, setPassWarning] = useState(false)
    const [loggingIn, setLoggingIn] = useState(false)
    const [success, setSuccess] = useState(null)
    const {setActiveUser} = useContext(AppContext)
    const router = useRouter()

    function TryLogin(e) {
        e.preventDefault()
        if(newUser)
        {
            if(password.length < 8)
            {
                setWarning('Password must be at least 8 characters.')
            }
            else
            {
                axios.get('/api/login',{params: {username:username}})
                .then(res=>{
                    if(!res.data.document)
                    {
                        const postObj = {
                        username: username,
                        password: password
                        }
                        axios.post('/api/signup', postObj)
                        .then(res=>{
                            if(res.data)
                            {
                                setSuccess('Account created. Returning to Login')
                                setNewUser(false)
                            }
                        })
                        .catch(err=>{
                            console.error(err)
                            setWarning('Signup failed. Please try again later')
                        })
                    }
                    else
                    {
                        setWarning('username already exists. Returning to login.')
                        setNewUser(false)
                    }
                })
                .catch(err=>{
                    console.error(err.message)
                })
            }
        }
        else
        {
            const postObj = {
            username: username,
            password: password
            }
            setLoggingIn(true)
            axios.post('/api/login', postObj)
            .then(res=>{
                if(res.data)
                {
                    setActiveUser(true)
                    setSuccess('Logged In successfully!')
                    router.push('/')
                }
                setLoggingIn(false)
            })
            .catch(err=>{
                console.error(err)
                setWarning(err.response.data.data)
                setLoggingIn(false)
            })
        }
    }

    return (
        <main className="flex min-h-screen grid place-items-center">
            <div className='bg-stone-50 border border-gray-300 rounded-lg px-6 py-4 lg:py-12 flex flex-col gap-4 h-1/2 shadow-xl'>
                <p className='text-center text-xl font-semibold text-zinc-600'>{newUser ? <>Sign Up</> : <>Log In</>}</p>
                <form onSubmit={(e)=>TryLogin(e)} className=' flex flex-col gap-4'>
                    <input type='text' placeholder='Username' required className='border border-gray-200 rounded-lg py-2 px-3'
                        onChange={(e)=>setUsername(e.target.value)}
                    />
                    { newUser ? 
                    <div className='w-full' onFocus={()=>setPassWarning(true)}>
                        <input type='password' placeholder='Password' required className={`border ${password.length < 8 && passWarning ? 'border-red-400' : 'border-gray-200' } w-full rounded-lg py-2 px-3`}
                            onChange={(e)=>setPassword(e.target.value)}
                        />
                        { password.length < 8 && passWarning ?
                        <p className='text-red-500 text-xs text-right mr-1 mt-1'>{password.length}/8 characters</p>
                        :
                        <></>
                        }
                    </div>
                    :
                        <input type='password' placeholder='Password' required className='border border-gray-200 rounded-lg py-2 px-3'
                            onChange={(e)=>setPassword(e.target.value)}
                        />
                    }
                    <button
                        className='w-full bg-gradient-to-r from-neutral-700 to-neutral-300 shadow-lg text-white py-2 rounded-full grayscale'
                    >
                        {newUser ? <>Create Account</> : <>Log In</>}
                    </button>
                </form>
                <button onClick={()=>setNewUser(!newUser)} className='text-gray-500'>
                    {newUser ? <p>Already have an Account? <span className='underline'>Sign In</span></p> : <p>New User? <span className='underline'>Sign Up</span></p>}
                </button>
            </div>
            <Snackbar
            open={warning !== null}
            autoHideDuration={5000}
            onClose={()=>setWarning(null)}
            anchorOrigin={{vertical: 'top', horizontal:'center'}}
            >
                <Alert severity='error'>{warning}</Alert>
            </Snackbar>
            <Snackbar
            open={success !== null}
            autoHideDuration={5000}
            onClose={()=>setSuccess(null)}
            anchorOrigin={{vertical: 'top', horizontal:'center'}}
            >
                <Alert severity='success'>{success}</Alert>
            </Snackbar>
        </main>
    )
}
