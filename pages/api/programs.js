require('dotenv').config()
const axios = require('axios')

export default async function handler(req, res) {
    if (req.method === 'GET')
    {
        const user = req.query.user
        const data = JSON.stringify({
            "collection": "programs",
            "database": "gymtrack",
            "dataSource": "link0",
            "filter": {
                [`user`]: req.query.default || user
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
    else
    {
        res.status(405).send({ message: `${req.method} not allowed` })
        return
    }
}