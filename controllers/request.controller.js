const fetch = require('node-fetch');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require("path");
const {stringify} = require("nodemon/lib/utils");
const template = require('../templateResponse');
const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.user;

// Jg2ihnVIMajoXgKpmKT58D63
// flnba9jJxh31aO1QCrSu818E - new token

async function sampleMethod(url, method, body) {
    let result;
    if(!body) {
        await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Basic ${Buffer.from('k.jigitekov@m-lombard.kz:flnba9jJxh31aO1QCrSu818E').toString('base64')}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(response => { return response.text(); })
            .then(text => { result = text; })
            .catch(err => template(500, err.message, [], true, res));
    }
    else {
        await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Basic ${Buffer.from('k.jigitekov@m-lombard.kz:flnba9jJxh31aO1QCrSu818E').toString('base64')}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: body
        })
            .then(response => { return response.text(); })
            .then(text => { result = text; })
            .catch(err => template(500, err.message, [], true, res));
    }
    return result;
}

exports.getRequest = async (req, res) => {
    try {
        let {id} = req.params
        if(!id) {
            let val = await sampleMethod('https://mklombard.atlassian.net/rest/servicedeskapi/request', 'GET')
            const arr = []
            const textObj = JSON.parse(val);
            arr.push(textObj.values);
            template(200, "", arr, true, res);
        }
        else {
            let val = await sampleMethod('https://mklombard.atlassian.net/rest/servicedeskapi/request/' + id, 'GET')
            const textObj = JSON.parse(val);
            template(200, "", textObj, true, res)
        }
    }
    catch(e) { template(500, e.message, [], true, res) }
};

exports.createRequest = async (req, res) => {
    try {
        let {body} = req
        const bodyData = '{' +
            '"serviceDeskId": "2",' +
            '"requestTypeId": "17",' +
            '"requestFieldValues": {' +
                '"summary": "' + body.summary + '",' +
                '"description": "' + body.description + '"' + 
            '}' +
        '}';
        let val = await sampleMethod('https://mklombard.atlassian.net/rest/servicedeskapi/request', 'POST', bodyData)
        const textObj = JSON.parse(val);
        template(200, "", textObj, true, res)
    }
    catch(e) { template(500, e.message, [], true, res) }
};

exports.getAttachment = (req, res) => {
    try {
        fetch('https://mklombard.atlassian.net/rest/servicedeskapi/request/ITSAMPLE-27/attachment', {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${Buffer.from('k.jigitekov@m-lombard.kz:Jg2ihnVIMajoXgKpmKT58D63').toString('base64')}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                console.log(`Response: ${response.status} ${response.statusText}`);
                return response.text();
            })
            .then(text => template(200, "", text, true, res))
            .catch(err => template(500, err.message, [], true, res));
    }
    catch(e) { template(500, e.message, [], true, res) }
};

exports.createAttachment = (req, res) => {
    try {
        let {id} = req.params
        let {body} = req
        const url = `http://mklombard.atlassian.net/rest/servicedeskapi/request/${id}/attachment`;
        let data = new FormData();
        data.append('file', fs.createReadStream(path.join(__dirname + '/upload/test.jpg')));

        var config = {
            method: 'POST',
            url: url,
            headers: {
                'Authorization': `Basic ${Buffer.from('k.jigitekov@m-lombard.kz:Jg2ihnVIMajoXgKpmKT58D63').toString('base64')}`,
                ...data.getHeaders()
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                console.log(`Response: ${response.status} ${response.statusText}`);
                return response.text();
                // res.send({ JSON.stringify(response.data, 0, 2) });
            })
            .catch(function (error) {
                console.log(error);
            });
    }
    catch(e) { template(500, e.message, [], true, res) }
};

exports.getIncident = async (req, res) => {
    try {
        let {id} = req.params
        let token = req.headers["x-access-token"];
        let {body} = req;
        if(!token) return template(401, "Token not provided", [], false, res)

        jwt.verify(token, process.env.key, (err, decoded) => {
            if(err) return template(401, "Unauthorised", [],false, res)
            User.findByPk(decoded.id)
                .then(async obj => {
                    if(!obj) template(404, "User not found", [], true, res)
                    try {
                        if(!id) {
                            let val = await sampleMethod('https://mklombard.atlassian.net/rest/api/3/search/?jql=summary%20~%20%22' + obj.phone + '*%22', 'GET')
                            const textObj = JSON.parse(val);
                            template(200, "", textObj.issues, true, res);
                        }
                        else {
                            let val = await sampleMethod('https://mklombard.atlassian.net/rest/api/3/issue/' + id, 'GET')
                            const textObj = JSON.parse(val);
                            template(200, "", textObj, true, res)
                        }
                    }
                    catch(e) { template(500, e.message, [], true, res) }
                }).catch(err => template(500, err.message, [], true, res));
        });

        // if(!id) {
        //     let val = await sampleMethod('https://mklombard.atlassian.net/rest/api/3/search/?jql=summary%20~%20%22JIRA*%22', 'GET')
        //     const arr = []
        //     const textObj = JSON.parse(val);
        //     arr.push(textObj.issues);
        //     template(200, "", arr, true, res);
        // }
        // else {
        //     let val = await getMethod('https://mklombard.atlassian.net/rest/api/3/issue/' + id, 'GET')
        //     const textObj = JSON.parse(val);
        //     template(200, "", textObj, true, res)
        // }
    }
    catch(e) { template(500, e.message, [], true, res) }
};

exports.createIncident = async (req, res) => {
    try {
        let {body} = req
        let token = req.headers["x-access-token"];
        if(!token) return template(401, "Token not provided", [], false, res)

        jwt.verify(token, process.env.key, (err, decoded) => {
            if(err) return template(401, "Unauthorised", [],false, res)
            User.findByPk(decoded.id)
                .then(async obj => {
                    if(!obj) template(404, "User not found", [], true, res)
                    try {
                        const bodyData = '{' +
                            '"fields": {' +
                                '"summary": "' + obj.phone + '",' +
                                '"issuetype": {"id": "10001"},' +
                                '"project": {"id": "10001"},' +
                                '"description": {' +
                                    '"type": "doc",' +
                                    '"version": 1,' +
                                    '"content": [{' +
                                        '"type": "paragraph",' +
                                        '"content": [{' +
                                            '"text": "' + body.description + '",' +
                                            '"type": "text"' +
                                        '}]' +
                                    '}]' +
                                '}' +
                                // '"reporter": {"id": "6260dc6926478a00681ee975"},' +
                            '}' +
                        '}';

                        let val = await sampleMethod('https://mklombard.atlassian.net/rest/api/3/issue', 'POST', bodyData)
                        const textObj = JSON.parse(val);
                        template(200, "", textObj, true, res)
                    }
                    catch(e) { template(500, e.message, [], true, res) }
                }).catch(err => template(500, err.message, [], true, res));
        });


        // let {body} = req
        // const bodyData = '{' +
        //     '"fields": {' +
        //         '"summary": "' + body.summary + '",' +
        //         '"issuetype": {"id": "10001"},' +
        //         '"project": {"id": "10001"},' +
        //         '"description": {' +
        //             '"type": "doc",' +
        //             '"version": 1,' +
        //             '"content": [{' +
        //                 '"type": "paragraph",' +
        //                 '"content": [{' +
        //                     '"text": "' + body.description + '",' +
        //                     '"type": "text"' +
        //                 '}]' +
        //             '}]' +
        //         '}' +
        //         // '"reporter": {"id": "6260dc6926478a00681ee975"},' +
        //     '}' +
        // '}';

        // let val = await sampleMethod('https://mklombard.atlassian.net/rest/api/3/issue', 'POST', bodyData)
        // const textObj = JSON.parse(val);
        // template(200, "", textObj, true, res)
    }
    catch(e) { template(500, e.message, [], true, res) }
};

exports.updateIncident = async (req, res) => {
    try {
        let {id} = req.params
        let {body} = req
        let token = req.headers["x-access-token"];
        if(!token) return template(401, "Token not provided", [], false, res)

        jwt.verify(token, process.env.key, (err, decoded) => {
            if(err) return template(401, "Unauthorised", [],false, res)
            User.findByPk(decoded.id)
                .then(async obj => {
                    if(!obj) template(404, "User not found", [], true, res)
                    try {
                        const bodyData = '{' +
                            '"update": {' +
                                '"fields": {' +
                                '}' + 
                            '}' +
                        '}';

                        let val = await sampleMethod('https://mklombard.atlassian.net/rest/api/3/issue/' + id, 'PUT', bodyData)
                        const textObj = JSON.parse(val);
                        template(200, "", textObj, true, res);
                    }
                    catch(e) { template(500, e.message, [], true, res) }
                }).catch(err => template(500, err.message, [], true, res));
        });
    }
    catch(e) { template(500, e.message, [], true, res) }
};

exports.getComment = async (req, res) => {
    try {
        let id;
        if(!req.params.id2) id = '';
        else id = req.params.id2;

        let token = req.headers["x-access-token"];
        let {body} = req;
        if(!token) return template(401, "Token not provided", [], false, res)

        jwt.verify(token, process.env.key, (err, decoded) => {
            if(err) return template(401, "Unauthorised", [],false, res)
            User.findByPk(decoded.id)
                .then(async obj => {
                    if(!obj) template(404, "User not found", [], true, res)
                    try {
                        if(!id) {
                            let val = await sampleMethod('https://mklombard.atlassian.net/rest/api/3/issue/' + req.params.id1 + '/comment', 'GET')
                            const textObj = JSON.parse(val);
                            template(200, "", textObj, true, res);
                        }
                        else {
                            let val = await sampleMethod('https://mklombard.atlassian.net/rest/api/3/issue/' + req.params.id1 + '/comment/' + id, 'GET')
                            const textObj = JSON.parse(val);
                            template(200, "", textObj, true, res)
                        }
                    }
                    catch(e) { template(500, e.message, [], true, res) }
                }).catch(err => template(500, err.message, [], true, res));
        });
    }
    catch(e) { template(500, e.message, [], true, res) }
};

exports.createComment = async (req, res) => {
    try {
        let {id} = req.params
        let {body} = req
        let token = req.headers["x-access-token"];
        if(!token) return template(401, "Token not provided", [], false, res)

        jwt.verify(token, process.env.key, (err, decoded) => {
            if(err) return template(401, "Unauthorised", [],false, res)
            User.findByPk(decoded.id)
                .then(async obj => {
                    if(!obj) template(404, "User not found", [], true, res)
                    try {
                        const bodyData = '{' +
                            '"visibility": {' +
                                '"type": "role",' +
                                '"value": "Administrators"' +
                            '},' +
                            '"body": {' +
                                '"type": "doc",' +
                                '"version": 1,' +
                                '"content": [{' +
                                    '"type": "paragraph",' +
                                    '"content": [{' +
                                        '"text": "' + body.description + '",' +
                                        '"type": "text"' +
                                    '}]' +
                                '}]' +
                            '}' +
                        '}';

                        let val = await sampleMethod('https://mklombard.atlassian.net/rest/api/3/issue/' + id + '/comment', 'POST', bodyData)
                        const textObj = JSON.parse(val);
                        template(200, "", textObj, true, res);
                    }
                    catch(e) { template(500, e.message, [], true, res) }
                }).catch(err => template(500, err.message, [], true, res));
        });
    }
    catch(e) { template(500, e.message, [], true, res) }
};