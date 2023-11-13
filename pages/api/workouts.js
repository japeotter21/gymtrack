require('dotenv').config()
const axios = require('axios')

export default async function handler(req, res) {
    // let auth = false
    // if (req.headers.authorization)
    // {
    //     auth = req.headers.authorization.split(' ')[1] === btoa(process.env.EDIT_USE+':'+process.env.EDIT_PW)
    // }
        if (req.method === 'GET')
        {
            const data = JSON.stringify({
                "collection": "workoutObj",
                "database": "gymtrack",
                "dataSource": "link0",
                "filter": {
                    [`key`]: 'workouts',
                    [`user`]: req.query.user
                }
            });
            const config = {
                method: 'post',
                url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-hdjhg/endpoint/data/v1/action/find',
                headers: {
                'Content-Type': 'application/json',
                'Access-Control-Request-Headers': '*',
                'api-key': process.env.API_KEY,
                },
                data: data
            }; 
            axios(config)
            .then(function (response) {
                res.status(200).json(response.data.documents[0]);
            })
            .catch(function (error) {
                res.status(400).json({data: 'request failed'})
            });
        }
    // else if(auth)
    // {
        else if (req.method === 'PUT')
        {
            const data = JSON.stringify({
                "collection": req.body.newDay >= 0 || req.body.newProgram >= 0 ? "user0" : "workoutObj",
                "database": "gymtrack",
                "dataSource": "link0",
                "filter": {
                    [`user`]: req.query.user
                },
                "update": req.body.newDay >= 0 ?  {
                    "$set": {
                        [`currentDay`]: req.body.newDay
                    }
                }
                : req.body.newProgram >= 0 ? 
                {
                    "$set": {
                        [`currentProgram`]: req.body.newProgram,
                        [`currentDay`]: 0
                    }
                }
                :
                {
                    "$set": {
                        [`workouts.${req.query.workout}.name`]: req.body.name
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
        else if (req.method === 'POST')
        {
            const workout = req.query.workout
            
            const data = JSON.stringify({
                "collection": "workoutObj",
                "database": "gymtrack",
                "dataSource": "link0",
                "filter": {
                    [`key`]: 'workouts',
                    [`user`]: req.query.user
                },
                "update": {
                    "$set": {
                        [`workouts.${workout}.exercises`]: req.body
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