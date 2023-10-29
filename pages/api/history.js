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
            const user = req.query.user
            const data = JSON.stringify({
                "collection": `inProgress_${req.query.user.split('@')[0]}`,
                "database": "gymtrack",
                "dataSource": "link0"
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
                res.status(200).json(response.data.documents);
            })
            .catch(function (error) {
                res.status(400).json({data: 'request failed'})
            });
        }
        else if (req.method === 'PUT')
        {
            const data = JSON.stringify({
                "collection": `inProgress_${req.query.user.split('@')[0]}`,
                "database": "gymtrack",
                "dataSource": "link0",
                "filter": { name: req.query.name },
                "update": {
                    "$set": {
                        name: req.query.name, reps: req.body.reps, weight: req.body.weight
                    }
                },
                "upsert": true
                
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
            const graphUrl = process.env.GRAPH_URL
            const postObj = {
                query:
                `query {
                    workoutObj (query:{user:"${req.query.user}"}) {
                    record {
                        title
                        date
                        end
                        results {
                            name
                            notes
                            rpe
                            sets {
                                reps
                                weight
                            }
                        }
                    }
                  }
                }`
            }
            axios.post(graphUrl, JSON.stringify(postObj), { headers: {apiKey: process.env.GRAPH_KEY}})
            .then(function (response) {
                const responseTemp = response.data
                const workoutsTemp = []
                responseTemp.data.workoutObj.record.forEach((item,id)=>{
                    if(item.date > 0)
                    {
                        workoutsTemp.push(item)
                    }
                })
                res.status(200).json(workoutsTemp);
            })
            .catch(function (error) {
                console.error(error.message)
                res.status(400).json({data: 'request failed'})
            });
        }
        else if (req.method === 'DELETE')
        {
            const data = JSON.stringify({
                "collection": `inProgress_${req.query.user.split('@')[0]}`,
                "database": "gymtrack",
                "dataSource": "link0",
                "filter": {}
            });
            const config = {
                method: 'post',
                url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-hdjhg/endpoint/data/v1/action/deleteMany',
                headers: {
                'Content-Type': 'application/json',
                'Access-Control-Request-Headers': '*',
                'api-key': process.env.API_KEY,
                },
                data: data
            }; 
            axios(config)
            .then(function (response) {
                res.status(200).send({message: 'Cleared all exercises from workout log.'})
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