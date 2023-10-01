import { inProgressObj } from '@/globals';

require('dotenv').config()
const axios = require('axios')

export default function handler(req, res) {
    // let auth = false
    // if (req.headers.authorization)
    // {
    //     auth = req.headers.authorization.split(' ')[1] === btoa(process.env.EDIT_USE+':'+process.env.EDIT_PW)
    // }
    // else if(auth)
    // {
        if (req.method === 'POST')
        {
            let currentName = ''
            let workoutObj = []
            const workoutTemp = req.body.workout
            workoutTemp.results.forEach((item,id)=>{
                if(item.name.split('-')[0] === currentName)
                {
                    const wIndex = workoutObj.findIndex((w)=>w.name === currentName)
                    workoutObj[wIndex].sets.push({reps:item.reps, weight: item.weight})
                }
                else
                {
                    currentName = item.name.split('-')[0]
                    workoutObj.push({
                        name: currentName,
                        notes: "",
                        rpe: 6,
                        sets: [{reps: item.reps, weight: item.weight}]
                    })
                }
            })
            console.log(workoutObj)
            const resultObj = {
                date: workoutTemp.date,
                title: workoutTemp.title,
                end: workoutTemp.end,
                results: workoutObj
            }
            console.log(resultObj)
            const user = req.query.user
            const rest = req.query.rest
            const data = JSON.stringify({
                "collection": "workoutObj",
                "database": "gymtrack",
                "dataSource": "link0",
                "filter": {
                    [`key`]: 'workouts',
                    [`user`]: user
                },
                "update": rest ? {
                    "$set": {
                        [`currentDay`]: req.body.day,
                    }
                } 
                :   
                {
                    "$set": {
                        [`currentDay`]: req.body.day,
                        [`inProgress.results`]: []
                    },
                    "$push": {
                        [`record`]: resultObj
                    }
                }
            });
            const config = {
                method: 'post',
                url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-hdjhg/endpoint/data/v1/action/updateOne',
                headers: {
                'Content-Type': 'application/json',
                'Access-Control-Request-Headers': '*',
                'api-key': process.env.API_KEY,
                },
                data: data
            }; 
            axios(config)
            .then(function (response) {
                res.status(200).json(response.data);
            })
            .catch(function (error) {
                res.status(400).json({data: 'request failed'})
            });
        }
        else
        {
            res.status(405).send({ message: `${req.method} not allowed` })
            return
        }
    // }
    // else
    // {
    //     res.status(403).send({ message: `${req.method} not allowed` })
    //     return
    // }
    
  }