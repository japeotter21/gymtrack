import axios from 'axios'

export function FinishWorkout(dayNum, user) {
    const postObj = {day: dayNum}
    
    return axios.post('/api/finished',postObj,{ params: {user}})
    .then(res=>{
        sessionStorage.removeItem('completed')
        console.log('doing')
    })
    .catch(err=>{
        console.error(err.message)
    })
}