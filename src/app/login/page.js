"use client"
import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import AppContext from '../AppContext'
import { useRouter } from 'next/navigation'

export default function Schedule() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [newUser, setNewUser] = useState(false)
    const [warning, setWarning] = useState(null)
    const [checkPassword, setCheckPassword] = useState(null)
    const [checkPassWarning, setCheckPassWarning] = useState(false)
    const [passWarning, setPassWarning] = useState(false)
    const [loggingIn, setLoggingIn] = useState(false)
    const [success, setSuccess] = useState(null)
    const {setActiveUser} = useContext(AppContext)
    const router = useRouter()

    useEffect(()=>{
        if(warning)
        {
            setTimeout(()=>{
                setWarning(null)
            },[5000])
        }
    },[warning])

    function TryLogin(e) {
        e.preventDefault()
        if(newUser)
        {
            if(password.length < 8)
            {
                setWarning('Password must be at least 8 characters')
            }
            else if(password !== checkPassword)
            {
                setWarning('Password fields must match')
                setCheckPassWarning(true)
            }
            else
            {
                setLoggingIn(true)
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
                                setLoggingIn(false)
                                setActiveUser(username)
                                sessionStorage.setItem('user',username)
                                router.push('/')
                            }
                        })
                        .catch(err=>{
                            console.error(err)
                            setWarning('Signup failed. Please try again later')
                            setLoggingIn(false)
                        })
                    }
                    else
                    {
                        setWarning('username already exists. Returning to login')
                        setNewUser(false)
                        setLoggingIn(false)
                    }
                })
                .catch(err=>{
                    console.error(err.message)
                    setLoggingIn(false)
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
                    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.data}`
                    setActiveUser(username)
                    sessionStorage.setItem('user',username)
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

    if(success)
    {
        return (
            <main className="flex flex-col py-24 h-1/2 items-center justify-center text-center gap-6 animate-pulse">
                    <strong>Hi,&nbsp;{username}!</strong>
                    <p>Loading your workouts...</p>
                    <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-400 animate-spin dark:text-gray-600 fill-green-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                    </svg>
            </main>
        )
    }

    return (
        <main className="min-h-screen grid place-items-center">
            <div className='bg-stone-50 border border-gray-300 rounded-lg px-6 py-4 flex flex-col gap-4 shadow-xl w-5/6 lg:w-1/4 row-span-6'>
                <p className='text-center text-xl font-semibold text-zinc-600'>{newUser ? <>Sign Up</> : <>Log In</>}</p>
                <form onSubmit={(e)=>TryLogin(e)} className='flex flex-col gap-4'>
                    <input type={newUser ? "email" : "text"} placeholder='Email' required className='border border-gray-200 rounded-lg py-2 px-3'
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
                        <input type='password' placeholder='Verify Password' required className={`border ${checkPassWarning && password !== checkPassword ? 'border-red-400' : 'border-gray-200' } w-full rounded-lg py-2 px-3 mt-2`}
                            onChange={(e)=>setCheckPassword(e.target.value)}
                            onFocus={()=>setCheckPassWarning(true)}
                            onBlur={()=>setCheckPassWarning(false)}
                        />
                        { checkPassWarning && password !== checkPassword ?
                        <p className='text-red-500 text-xs text-right mr-1 mt-1'>Please verify password.</p>
                        :
                        <></>
                        }
                    </div>
                    :
                        <input type='password' placeholder='Password' required className='border border-gray-200 rounded-lg py-2 px-3'
                            onChange={(e)=>setPassword(e.target.value)}
                        />
                    }
                    { loggingIn ? 
                    <button type="button"
                        className='animate-pulse w-full bg-gradient-to-r from-neutral-700 to-neutral-300 shadow-lg text-white py-2 rounded-full flex items-center justify-center gap-4'
                    >
                        <p className='invisible'>Logging In</p>
                    </button>
                    :
                    <button type='submit'
                        className='w-full bg-gradient-to-r from-neutral-700 to-neutral-300 shadow-lg text-white py-2 rounded-full'
                    >
                        {newUser ? <>Create Account</> : <>Log In</>}
                    </button>
                    }
                    
                </form>
                <div className={`text-red-600 text-xs break-words text-center ${warning === null ? 'invisible' : ''}`}>{warning}.</div>
                <button onClick={()=>setNewUser(!newUser)} className='text-gray-500'>
                    {newUser ? <p>Already have an Account? <span className='underline'>Sign In</span></p> : <p>New User? <span className='underline'>Sign Up</span></p>}
                </button>
                { newUser ? 
                    <div className='text-sm bg-blue-200 bg-opacity-80 rounded-md px-2 py-0.5 text-blue-600 border border-blue-300'
                >This app is still in Alpha and does not support password reset. Please write down your password or else you will lose your data!</div>
                :
                <></>
                }
            </div>
            {/* <PopAlert open={warning !== null} autoHideDuration={5000} onClose={()=>setWarning(null)} message={warning} type={'Warning'} /> */}
            {/* <Snackbar
            open={success !== null}
            autoHideDuration={5000}
            onClose={()=>setSuccess(null)}
            anchorOrigin={{vertical: 'top', horizontal:'center'}}
            >
                <Alert severity='success'>{success}</Alert>
            </Snackbar> */}
        </main>
    )
}
