require('dotenv').config()
const axios = require('axios')
const jwt = require('jsonwebtoken')

export default async function handler(req, res) {
    // let auth = false
    // if (req.headers.authorization)
    // {
    //     auth = req.headers.authorization.split(' ')[1] === btoa(process.env.EDIT_USE+':'+process.env.EDIT_PW)
    // }
    try {
        console.log(jwt.verify(req.headers?.authorization.split(' ')[1], process.env.JWT_TOKEN))
    }
    catch {
        console.log('error')
    }
        if (req.method === 'GET')
        {
            const user = req.query.user
            const data = JSON.stringify({
                "collection": "exercises",
                "database": "gymtrack",
                "dataSource": "link0",
                "filter": {
                    [`key`]: 'exercises',
                    [`user`]: user
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
            const defaultData = JSON.stringify({
                "collection": "exercises",
                "database": "gymtrack",
                "dataSource": "link0",
                "filter": {
                    [`key`]: 'exercises',
                    [`user`]: 'default'
                }
            });
            const defaultConfig = {
                method: 'post',
                url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-hdjhg/endpoint/data/v1/action/find',
                headers: {
                'Content-Type': 'application/json',
                'Access-Control-Request-Headers': '*',
                'api-key': process.env.API_KEY,
                },
                data: defaultData
            }; 
            axios(defaultConfig)
            .then(function (r) {
                const defaultExercises = r.data.documents[0].exercises
                axios(config)
                .then(function (response) {
                    const allExercises = defaultExercises.concat(response.data.documents[0].exercises)
                    const returnObj = {
                        key: response.data.documents[0].key,
                        user: response.data.documents[0].user,
                        exercises: allExercises
                    }
                    res.status(200).json(returnObj);
                })
                .catch(function (error) {
                    const returnObj = {
                        key: r.data.documents[0].key,
                        user: r.data.documents[0].user,
                        exercises: defaultExercises
                    }
                    res.status(200).json(returnObj);
                });
            })
            .catch(function (error) {
                res.status(400).json({data: 'request failed'})
            });
        }
    // else if(auth)
    // {
        else if (req.method === 'PUT')
        {
            const user = req.query.user
            const batch = req.query.batch
            const loggingWorkout = req.query.log
            const exercise = req.query.exercise
            const index = req.query.index
            const updateData = loggingWorkout == 1 ? {
                "$set": {
                    [`exercises.${exercise}.results.${index}`]: req.body
                }
            }
            : batch ? 
            {
                "$set": {
                    [`exercises`]: req.body
                }
            }
            :
            {
                "$set": {
                    [`exercises.${exercise}.results.${index}`]: req.body
                }
            }
            const data = JSON.stringify({
                "collection": "exercises",
                "database": "gymtrack",
                "dataSource": "link0",
                "filter": {
                    [`key`]: 'exercises',
                    [`user`]: user
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
        else if (req.method === 'POST')
        {
            const user = req.query.user
            const batch = req.query.batch
            const loggingWorkout = req.query.log
            const exercise = req.query.exercise
            const updateData = loggingWorkout == 1 ? {
                "$push": {
                    [`exercises.${exercise}.results`]: req.body
                }
            }
            : batch ? 
            {
                "$set": {
                    [`exercises`]: req.body
                }
            }
            :
            {
                "$set": {
                    [`exercises.${exercise}.target`]: req.body
                }
            }
            const data = JSON.stringify({
                "collection": "exercises",
                "database": "gymtrack",
                "dataSource": "link0",
                "filter": {
                    [`key`]: 'exercises',
                    [`user`]: user
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