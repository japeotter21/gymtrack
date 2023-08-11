import axios from 'axios'

export function FinishWorkout(dayNum, user, finishObj) {
    const postObj = {
        day: dayNum,
        results: finishObj
    }
    
    return axios.post('api/finished',postObj,{ params: {user}})
    .then(res=>{
    })
    .catch(err=>{
        console.error(err.message)
    })
}