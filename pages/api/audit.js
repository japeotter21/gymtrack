
require('dotenv').config()
const axios = require('axios')

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        // ----------------------------------------------------------------------------------------------------------------
        // post to audit collection
        // ----------------------------------------------------------------------------------------------------------------
        const audit = JSON.stringify({
            "collection": `inProgress_history`,
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
        const auditConfig = {
            method: 'post',
            url: 'https://us-east-2.aws.data.mongodb-api.com/app/data-hdjhg/endpoint/data/v1/action/updateOne',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Request-Headers': '*',
                'api-key': process.env.API_KEY,
            },
            data: audit
        };
        axios(auditConfig)
        .then(function (response) {
            res.status(200).json({ data: 'audit recorded successfully' });
        })
        .catch(function (error) {
            res.status(400).json({ data: 'request failed' })
        });
    }
    else {
        res.status(405).send({ message: `${req.method} not allowed` })
        return
    }

}