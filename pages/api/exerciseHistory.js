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
            const name = req.query.name.includes('+') ? req.query.name.split('+').join(' ') : req.query.name
            const data = JSON.stringify({
                "collection": `record`,
                "database": "gymtrack",
                "dataSource": "link0",
                "filter": { user: req.query.user },
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
                const responseTemp =response.data.documents[0].record
                const workoutsTemp = []
                console.log(responseTemp)
                responseTemp.forEach((item,id)=>{
                    let resultTemp = item.results.find((result)=>result.name === name)
                    if(resultTemp && resultTemp !== undefined)
                    {
                        item.results = resultTemp
                        workoutsTemp.push(item)
                    }
                })
                res.status(200).json(workoutsTemp);
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