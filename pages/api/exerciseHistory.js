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
            const graphUrl = process.env.GRAPH_URL
            const name = req.query.name.includes('+') ? req.query.name.split('+').join(' ') : req.query.name
            const postObj = {
                query:
                `query {
                    workouts (query:{user:"${req.query.user}"}) {
                    record {
                        title
                        date
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
                console.log(responseTemp)
                responseTemp.data.workouts[0].record.forEach((item,id)=>{
                    if(item.date > 0)
                    {
                        let resultTemp = null
                        item.results.forEach((result,ind)=>{
                            if(result.name === name)
                            {
                                resultTemp = result
                            }
                        })
                        if(resultTemp)
                        {
                            item.results = resultTemp
                            workoutsTemp.push(item)
                        }
                    }
                })
                res.status(200).json(workoutsTemp);
            })
            .catch(function (error) {
                console.error(error.message)
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