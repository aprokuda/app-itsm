const fetch = require('node-fetch');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require("path");
const template = require('../templateResponse');
const jwt = require("jsonwebtoken");
const db = require("../models");
const { timeStamp } = require('console');
const User = db.user;

async function sampleMethod(url, method, body) {
    let result;
    if(!body) {
        await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Basic ${Buffer.from(process.env.jiraEmail + ':' + process.env.jiraToken).toString('base64')}`,
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
                'Authorization': `Basic ${Buffer.from(process.env.jiraEmail + ':' + process.env.jiraToken).toString('base64')}`,
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
                'Authorization': `Basic ${Buffer.from(process.env.jiraEmail + ':' + process.env.jiraToken).toString('base64')}`,
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

exports.createAttachment = async (req, res) => {
    try {
        let {id} = req.params;
        const filePath = path.join(__dirname + '../../uploads/' + req.file.originalname);
        const form = new FormData();
        const stats = fs.statSync(filePath);
        const fileSizeInBytes = stats.size;
        const fileStream = fs.createReadStream(filePath);
        form.append('file', fileStream, {knownLength: fileSizeInBytes});
        
        let token = req.headers["x-access-token"];
        if(!token) return template(401, "Token not provided", [], false, res);

        jwt.verify(token, process.env.key, (err, decoded) => {
            if(err) return template(401, "Unauthorised", [],false, res)
            User.findByPk(decoded.id)
                .then(async user => {
                    if(!user) template(404, "User not found", [], true, res);
                    try {
                        fetch('https://mklombard.atlassian.net/rest/api/3/issue/' + id + '/attachments', {
                            method: 'POST',
                            body: form,
                            headers: {
                                'Authorization': `Basic ${Buffer.from(process.env.jiraEmail + ':' + process.env.jiraToken).toString('base64')}`,
                                'Accept': 'application/json',
                                'X-Atlassian-Token': 'no-check'
                            }
                        })
                            .then(response => { return response.text(); })
                            .then(text => {
                                const textObj = JSON.parse(text);
                                template(200, "", textObj, true, res);
                            })
                            .catch(err => template(500, err.message, [], true, res));
                    }
                    catch(e) { template(500, e.message, [], true, res) }
                }).catch(err => template(500, err.message, [], true, res));
        });
    }
    catch(e) { template(500, e.message, [], true, res) }
};

exports.getIncident = async (req, res) => {
    try {
        let {id} = req.params
        let token = req.headers["x-access-token"];
        if(!token) return template(401, "Token not provided", [], false, res)

        jwt.verify(token, process.env.key, (err, decoded) => {
            if(err) return template(401, "Unauthorised", [],false, res)
            User.findByPk(decoded.id)
                .then(async user => {
                    if(!user) template(404, "User not found", [], true, res);
                    try {
                        if(!id) {
                            let val = await sampleMethod('https://mklombard.atlassian.net/rest/api/3/search/?jql=summary%20~%20%22' + user.phone + '*%22', 'GET')
                            const textObj = JSON.parse(val);
                            let result = [], resultObject;
                            for(let each of textObj.issues) {
                                resultObject = {
                                    id: each.id,
                                    key: each.key,
                                    fields: {
                                        statuscategorychangedate: each.fields.statuscategorychangedate,
                                        summary: each.fields.summary,
                                        description: each.fields.description.content.map(item => item.content.map(item => item.text)[0])[0],
                                        status: each.fields.status.name,
                                        issuetype: each.fields.issuetype,
                                        priority: each.fields.priority,
                                        duedate: each.fields.duedate,
                                        progress: each.fields.progress,
                                        resolution: each.fields.customfield_10051,
                                        response: each.fields.customfield_10052,
                                        post_resolution: each.fields.customfield_10053,
                                        review: each.fields.customfield_10054,
                                        requesttype: each.fields.customfield_10010,
                                        resolutiondate: each.fields.resolutiondate,
                                        timespent: each.fields.timespent,
                                        created: each.fields.created,
                                        updated: each.fields.updated
                                    }
                                }
                                result.push(resultObject);
                            }
                            template(200, "", result, true, res);
                        }
                        else {
                            let val = await sampleMethod('https://mklombard.atlassian.net/rest/api/3/issue/' + id, 'GET')
                            const textObj = JSON.parse(val);
                            textObj.fields.description = textObj.fields.description.content.map(item => item.content.map(item => item.text)[0])[0];
                            textObj.fields.attachment = textObj.fields.attachment.map(item => ({id: item.id, filename: item.filename, created: item.created, author: item.author.displayName}));
                            for(let each of textObj.fields.comment.comments) {
                                each.author = each.author.displayName;
                                each.updateAuthor = each.updateAuthor.displayName;
                                each.body = each.body.content.map(item => item.content.map(item => item.text)[0])[0];
                            }

                            let result = {
                                    id: textObj.id,
                                    key: textObj.key,
                                    fields: {
                                        statuscategorychangedate: textObj.fields.statuscategorychangedate,
                                        summary: textObj.fields.summary,
                                        description: textObj.fields.description,
                                        status: textObj.fields.status.name,
                                        attachment: textObj.fields.attachment,
                                        comment: textObj.fields.comment,
                                        issuetype: textObj.fields.issuetype,
                                        priority: textObj.fields.priority,
                                        duedate: textObj.fields.duedate,
                                        progress: textObj.fields.progress,
                                        resolution: textObj.fields.customfield_10051,
                                        response: textObj.fields.customfield_10052,
                                        post_resolution: textObj.fields.customfield_10053,
                                        review: textObj.fields.customfield_10054,
                                        requesttype: textObj.fields.customfield_10010,
                                        resolutiondate: textObj.fields.resolutiondate,
                                        timespent: textObj.fields.timespent,
                                        created: textObj.fields.created,
                                        updated: textObj.fields.updated
                                    }
                                }
                            template(200, "", result, true, res);
                        }
                    }
                    catch(e) { template(500, e.message, [], true, res) }
                }).catch(err => template(500, err.message, [], true, res));
        });
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
                .then(async user => {
                    if(!user) template(404, "User not found", [], true, res)
                    try {
                        const bodyData = '{' +
                            '"fields": {' +
                                '"summary": "' + user.phone + '",' +
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
                            '}' +
                        '}';

                        let val = await sampleMethod('https://mklombard.atlassian.net/rest/api/3/issue', 'POST', bodyData)
                        const textObj = JSON.parse(val);
                        template(200, "", textObj, true, res)
                    }
                    catch(e) { template(500, e.message, [], true, res) }
                }).catch(err => template(500, err.message, [], true, res));
        });
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
                .then(async user => {
                    if(!user) template(404, "User not found", [], true, res)
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

exports.createIncidentWithAttachment = async (req, res) => {
    try {
        let {body} = req
        let token = req.headers["x-access-token"];
        if(!token) return template(401, "Token not provided", [], false, res)

        jwt.verify(token, process.env.key, (err, decoded) => {
            if(err) return template(401, "Unauthorised", [],false, res)
            User.findByPk(decoded.id)
                .then(async user => {
                    if(!user) template(404, "User not found", [], true, res)
                    try {
                        const bodyData = '{' +
                            '"fields": {' +
                                '"summary": "' + user.phone + '",' +
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
                            '}' +
                        '}';

                        let val = await sampleMethod('https://mklombard.atlassian.net/rest/api/3/issue', 'POST', bodyData)
                        const textObj = JSON.parse(val);

                        if(textObj) {
                            const fileObjects = []
                            const obj = {
                                fileObj: null,
                                textObj: textObj
                            }
                            for(let eachFile of req.files) {
                                const filePath = path.join(__dirname + '../../uploads/' + eachFile.originalname);
                                const form = new FormData();
                                const stats = fs.statSync(filePath);
                                const fileSizeInBytes = stats.size;
                                const fileStream = fs.createReadStream(filePath);
                                form.append('file', fileStream, {knownLength: fileSizeInBytes});
                
                                await fetch('https://mklombard.atlassian.net/rest/api/3/issue/' + textObj.key + '/attachments', {
                                    method: 'POST',
                                    body: form,
                                    headers: {
                                        'Authorization': `Basic ${Buffer.from(process.env.jiraEmail + ':' + process.env.jiraToken).toString('base64')}`,
                                        'Accept': 'application/json',
                                        'X-Atlassian-Token': 'no-check'
                                    }
                                })
                                    .then(response => { return response.text(); })
                                    .then(text => {
                                        let arr = JSON.parse(text);
                                        fileObjects.push(arr[0]);
                                    })
                                    .catch(err => template(500, err.message, [], true, res));
                            }
                            obj.fileObj = fileObjects
                            template(200, "", obj, true, res);
                        }
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
        if(!token) return template(401, "Token not provided", [], false, res)

        jwt.verify(token, process.env.key, (err, decoded) => {
            if(err) return template(401, "Unauthorised", [],false, res)
            User.findByPk(decoded.id)
                .then(async user => {
                    if(!user) template(404, "User not found", [], true, res)
                    try {
                        if(!id) {
                            let val = await sampleMethod('https://mklombard.atlassian.net/rest/api/3/issue/' + req.params.id1 + '/comment', 'GET')
                            const textObj = JSON.parse(val);
                            for(let each of textObj.comments) {
                                each.author = each.author.displayName;
                                each.updateAuthor = each.updateAuthor.displayName;
                                each.body = each.body.content.map(item => item.content.map(item => item.text)[0])[0];
                            }
                            template(200, "", textObj, true, res);
                        }
                        else {
                            let val = await sampleMethod('https://mklombard.atlassian.net/rest/api/3/issue/' + req.params.id1 + '/comment/' + id, 'GET')
                            const textObj = JSON.parse(val);
                            textObj.author = textObj.author.displayName;
                            textObj.updateAuthor = textObj.updateAuthor.displayName;
                            textObj.body = textObj.body.content.map(item => item.content.map(item => item.text)[0])[0];
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
                .then(async user => {
                    if(!user) template(404, "User not found", [], true, res)
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