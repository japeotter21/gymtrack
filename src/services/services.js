import axios from 'axios'

export function FinishWorkout(dayNum, user, rest, finishObj) {
    
    if(rest) {
        const postObj = {
            day: dayNum
        }
        return axios.post('api/finished',postObj,{ params: {user: user, rest: true}})
        .then(res=>{
        })
        .catch(err=>{
            console.error(err.message)
        })
    }
    else
    {
        const postObj = {
            day: dayNum,
            results: finishObj
        }
        return axios.post('api/finished',postObj,{ params: {user: user}})
        .then(res=>{
        })
        .catch(err=>{
            console.error(err.message)
        })
    }
    
}
