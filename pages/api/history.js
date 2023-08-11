require('dotenv').config()
const axios = require('axios')

export default async function handler(req, res) {
    // let auth = false
    // if (req.headers.authorization)
    // {
    //     auth = req.headers.authorization.split(' ')[1] === btoa(process.env.EDIT_USE+':'+process.env.EDIT_PW)
    // }
        if (req.method === 'POST')
        {
            const user = req.query.user
            const graphUrl = process.env.GRAPH_URL
            const postObj = {
                query:
                `query {
                    workouts (query: {user:"${user}"}) {
                            user
                        }
              }`
            }
            axios.post(graphUrl, JSON.stringify(postObj), { headers: {apiKey: process.env.GRAPH_KEY}})
            .then(function (response) {
                res.status(200).json(response.data);
            })
            .catch(function (error) {
                console.log(error.message)
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