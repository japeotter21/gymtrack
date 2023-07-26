require('dotenv').config()
const axios = require('axios')

export default async function handler(req, res) {
    // let auth = false
    // if (req.headers.authorization)
    // {
    //     auth = req.headers.authorization.split(' ')[1] === btoa(process.env.EDIT_USE+':'+process.env.EDIT_PW)
    // }
        // if (req.method === 'GET')
        // {
        //     const data = JSON.stringify({
        //         "collection": "user0",
        //         "database": "gymtrack",
        //         "dataSource": "link0"
        //     });
        //     const config = {
        //         method: 'post',
        //         url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-hdjhg/endpoint/data/v1/action/find',
        //         headers: {
        //         'Content-Type': 'application/json',
        //         'Access-Control-Request-Headers': '*',
        //         'api-key': process.env.API_KEY,
        //         },
        //         data: data
        //     }; 
        //     axios(config)
        //     .then(function (response) {
        //         res.status(200).json(response.data);
        //     })
        //     .catch(function (error) {
        //         res.status(400).json({data: 'request failed'})
        //     });
        // }
    // else if(auth)
    // {
        if (req.method === 'POST')
        {
            const index = req.query.id
            const user = req.query.user
            const workout = req.query.workout
            const loggingWorkout = req.query.log
            const exercise = req.query.exercise
            const updateData = loggingWorkout == 1 ? {
                "$push": {
                    [`workouts.${workout}.exercises.${index}.results`]: req.body,
                    [`exercises.${exercise}.results`]: req.body
                }
            }
            :
            {
                "$set": {
                    [`workouts.${workout}.exercises.${index}.target`]: req.body
                }
            }
            const data = JSON.stringify({
                "collection": "user0",
                "database": "gymtrack",
                "dataSource": "link0",
                "filter": {
                    [`profile.username`]: user
                },
                "update": updateData
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