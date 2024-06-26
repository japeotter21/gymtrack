require('dotenv').config()
const axios = require('axios')
const bcrypt = require('bcrypt')
const saltRounds = 11
import { userProfile } from '@/globals'

export default function handler(req, res) {
    if (req.method === 'POST')
    {
        const username = req.body.username
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            if(hash)
            {

                // create user account in user table
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

                userProfile.user = username
                const userData = JSON.stringify({
                    "collection": "user0",
                    "database": "gymtrack",
                    "dataSource": "link0",
                    "document": userProfile
                });
                const userDataConfig = {
                    method: 'post',
                    url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-hdjhg/endpoint/data/v1/action/insertOne',
                    headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Request-Headers': '*',
                    'api-key': process.env.API_KEY,
                    },
                    data: userData
                };  
                axios(userDataConfig)
                .then(function (response) {
                    axios(config)
                    .then(function (response) {
                        res.status(200).json({data:true});
                    })
                    .catch(function (error) {
                        console.error(error.message)
                        res.status(400).json({data: 'failed to create user account'})
                    });
                })
                .catch(function (error) {
                    console.error(error.message)
                    res.status(400).json({data: 'failed to create user data'})
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