require('dotenv').config()
const axios = require('axios')
const bcrypt = require('bcrypt')
const saltRounds = 11

export default function handler(req, res) {
    if (req.method === 'POST')
    {
        const username = req.body.username
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            if(hash)
            {
                const data = JSON.stringify({
                    "collection": "users",
                    "database": "gymtrack",
                    "dataSource": "link0",
                    "document": {
                        username: username,
                        password: hash
                    }
                });
                const config = {
                    method: 'post',
                    url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-hdjhg/endpoint/data/v1/action/insertOne',
                    headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Request-Headers': '*',
                    'api-key': process.env.API_KEY,
                    },
                    data: data
                }; 
                axios(config)
                .then(function (response) {
                    res.status(200).json({data:true});
                })
                .catch(function (error) {
                    console.log(error.message)
                    res.status(400).json({data: 'request failed'})
                });
            }
        });
        
    }
    else
    {
        res.status(405).send({ message: `${req.method} not allowed` })
        return
    }
  }