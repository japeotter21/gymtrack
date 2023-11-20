const axios = require('axios')
require('dotenv').config()
 
export default function handler(req, res) {
    const { programId } = req.query
    if (req.method === 'PUT')
    {
        const user = req.query.user
        const data = JSON.stringify({
            "collection": "programs",
            "database": "gymtrack",
            "dataSource": "link0",
            "filter": {
                [`user`]: user
            },
            "update":{
                "$set": {
                    [`programs.${programId[0]}.schedule.${programId[1]}.exercises.${programId[2]}.target`]: req.body
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
        const user = req.query.user
        const data = JSON.stringify({
            "collection": "programs",
            "database": "gymtrack",
            "dataSource": "link0",
            "filter": {
                [`user`]: user
            },
            "update":{
                "$set": {
                    [`programs.${programId[0]}.schedule.${programId[1]}.exercises`]: req.body
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
}