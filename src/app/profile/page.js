"use client"
import React, { useState, useEffect, useContext } from 'react'
import Image from 'next/image'
import { Avatar, Dialog } from '@mui/material'
import { RiDraggable, RiPencilLine } from 'react-icons/ri'
import axios from 'axios'
import Pagenav from '../components/Pagenav'
import AppContext from '../AppContext'
import { redirect } from 'next/navigation'

export default function Schedule() {
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState({})
    const [newName, setNewName] = useState('')
    const [newBio, setNewBio] = useState('')
    const [newGoal, setNewGoal] = useState('')
    const [editProfile, setEditProfile] = useState(false)
    const [updating, setUpdating] = useState(false)
    const {activeUser} = useContext(AppContext)

    useEffect(()=>{
        if (activeUser)
        {
            axios.get('/api/user', {params:{user:activeUser}})
            .then(res=>{
            setLoading(false)
            setProfile(res.data.profile)
            })
            .catch(err=>{
            console.error(err.message)
            })
        }
        else
        {
            redirect('/login')
        }
    },[])
    
    useEffect(()=>{
        if(editProfile)
        {
            setNewBio(profile.bio)
            setNewGoal(profile.goal)
            setNewName(profile.name)
        }
    },[editProfile])
        
    function UpdateProfile() {
        const postObj = {
            name: newName,
            bio: newBio
            // goal: newGoal
        }
        setUpdating(true)
        axios.put('/api/user', postObj, { params: {user:activeUser}})
        .then(res=>{
            axios.get('/api/user', { params: {user:activeUser}})
            .then(r=>{
                setProfile(r.data.profile)
                setUpdating(false)
                setEditProfile(false)
            })
        })
    }

    if(loading)
    {
        return (
            <></>
        )
    }

    return (
        <main className="flex min-h-screen flex-col items-center py-6 lg:pt-12 px-2 lg:p-12 gap-4">
            <div className='w-full gap-3 lg:w-1/2'>
                <div className='flex w-full items-center gap-2 lg:gap-6'>
                    <div>
                        <Avatar sx={{height:60, width:60}}>{profile.name ? profile.name.charAt(0) : activeUser.charAt(0)}</Avatar>
                    </div>
                    <div className='w-full border border-gray-300 rounded-lg bg-stone-50 px-4 py-2'>
                        <div className='text-sm flex justify-between'>
                        <strong>{profile.name ? profile.name : activeUser}</strong>
                        <button className='text-gray-500'
                            onClick={()=>setEditProfile(true)}
                        ><RiPencilLine size={18}/></button>
                        </div>
                        <p className='text-sm mt-0.5'>{profile.bio ? profile.bio : <>Add a Bio!</>}</p>
                        <hr className='my-2'/>
                        <div className='flex gap-2 items-center justify-start'>
                        <p className={profile.streak.current > 0 ? 'text-red-500' : 'text-neutral-400'}>🔥&nbsp;{profile.streak.current}</p>
                        <p className='text-sm'>Best: {profile.streak.best}</p>
                        </div>
                        {/* <p className='text-sm'>Goal: {profile.goal}</p> */}
                    </div>
                </div>
            </div>
            <Pagenav page='profile' />
            <Dialog open={editProfile} onClose={()=>setEditProfile(false)}>
                <div className='px-4 py-2'>
                <p className='font-semibold text-lg py-2'>Edit Profile</p>
                <div className='grid grid-cols-4 gap-1'>
                    <p>Name</p>
                    <input type="text" defaultValue={profile.name} placeholder='Name' className='border border-gray-400 rounded-md p-1 col-span-4'
                        onChange={(e)=>setNewName(e.target.value)}
                    />
                    <p>Bio</p>
                    <textarea type="text" defaultValue={profile.bio} placeholder='Bio' className='border border-gray-400 rounded-md p-1 col-span-4'
                        onChange={(e)=>setNewBio(e.target.value)}
                    />
                    <p>Goal</p>
                    <textarea type="text" defaultValue={profile.goal} placeholder='Goal' className='border border-gray-400 rounded-md p-1 col-span-4'
                        onChange={(e)=>setNewGoal(e.target.value)}
                    />
                </div>
                <div className='flex justify-between mt-4'>
                    <button className='shadow-md border border-neutral-500 rounded-md py-1 px-3'
                    onClick={()=>setEditProfile(false)}
                    >Cancel</button>
                    { updating ?
                    <button disabled className='shadow-md bg-green-600 text-white rounded-md py-1 px-4'
                    >Saving...
                    </button>
                    :
                    <button className='shadow-md bg-green-600 text-white rounded-md py-1 px-4'
                        onClick={UpdateProfile}
                    >Save
                    </button>
                    }
                    
                </div>
                </div>
            </Dialog>
        </main>
    )
}
