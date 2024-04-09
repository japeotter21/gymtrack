require('dotenv').config()
const axios = require('axios')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

export default function handler(req, res) {
    if (req.method === 'GET')
    {
        const username = req.query.username
        const data = JSON.stringify({
            "collection": "users",
            "database": "gymtrack",
            "dataSource": "link0",
            "filter": {
                [`username`]: username
            }
        });
        const config = {
            method: 'post',
            url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-hdjhg/endpoint/data/v1/action/findOne',
            headers: {
            'Content-Type': 'application/json',
            'Access-Control-Request-Headers': '*',
            'api-key': process.env.API_KEY,
            },
            data: data
        }; 
        axios(config)
        .then(function (response) {
            res.status(200).json(response.data)
        })
        .catch(function (error) {
            console.error(error.message)
            res.status(403).json({data: 'Username not found'})
        });
    }
    else if (req.method === 'POST')
    {
        const username = req.body.username
        const password = req.body.password
        const data = JSON.stringify({
            "collection": "users",
            "database": "gymtrack",
            "dataSource": "link0",
            "filter": {
                [`username`]: username
            }
        });
        const config = {
            method: 'post',
            url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-hdjhg/endpoint/data/v1/action/findOne',
            headers: {
            'Content-Type': 'application/json',
            'Access-Control-Request-Headers': '*',
            'api-key': process.env.API_KEY,
            },
            data: data
        }; 
        axios(config)
        .then(function (response) {
            bcrypt.compare(password, response.data.document.password, function(err, result) {
                if(result == true)
                {
                    res.status(200).json({data:jwt.sign({username: username}, process.env.JWT_TOKEN, {expiresIn: '30m'})});
                }
                else
                {
                    res.status(403).json({data: 'login failed. please check username and password'})
                }
            });
        })
        .catch(function (error) {
            console.error(error.message)
            res.status(403).json({data: 'login failed. please check username and password'})
        });
    }
    else
    {
        res.status(405).send({ message: `${req.method} not allowed` })
        return
    }
  }