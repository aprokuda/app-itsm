const db = require("../models");
const template = require("../templateResponse");
const jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const User = db.user, Role = db.role;

exports.getObject = (req, res) => {
    try {
        let {id} = req.params
        if(!id) {
            User.findAll()
                .then(async users => {
                    if(users.length === 0) template(200, "", [], true, res)
                    else {
                        let userArr = []
                        for(let user of users) {
                            try {
                                delete user.dataValues.password
                                user.dataValues.roleId = await Role.findByPk(user.dataValues.roleId)
                                userArr.push(user.dataValues)
                            }
                            catch(e) { template(500, e.message, [], true, res) }
                        }
                        template(200, "", userArr, true, res)
                    }
                })
                .catch(err => template(500, err.message, [], true, res));
        }
        else {
            User.findOne({where: {id: id}})
                .then(async user => {
                    if(!user) template(404, "User not found", [], true, res)
                    try {
                        delete user.dataValues.password
                        user.dataValues.roleId = await Role.findByPk(user.dataValues.roleId)
                        template(200, "", user, true, res)
                    }
                    catch(e) { template(500, e.message, [], true, res) }
                })
                .catch(err => template(500, err.message, [], true, res));
        }
    }
    catch(e) { template(500, e.message, [], true, res) }
};

exports.objectCreate = (req, res) => {
    try {
        let token = req.headers["x-access-token"];
        let {body} = req
        if(!token) return template(401, "Token not provided", [],false, res)

        jwt.verify(token, process.env.key, (err, decoded) => {
            if(err) return template(401, "Unauthorised!", [],false, res)
            User.findByPk(decoded.id)
                .then(async obj => {
                    if(!obj) template(404, "User not found", [], true, res)
                    try {
                        if (obj.roleId === 2) {
                            if (body.roleId === 3) {
                                template(403, "Required Administrator role", [], true, res)
                            }
                            else {
                                body.password = bcrypt.hashSync(body.password, 8)
                                body.roleId = body.roleId !== undefined ? body.roleId: 1
                                User.create(body).then(user => {
                                    if(user) template(200, "User has been successfully registered",[],false, res)
                                    else template(500, "",[],false, res)
                                }).catch(err => { template(500, err.message,[],false, res) });
                            }
                        }
                        else {
                            body.password = bcrypt.hashSync(body.password, 8)
                            body.roleId = body.roleId !== undefined ? body.roleId: 1
                            User.create(body).then(user => {
                                if(user) template(200, "User has been successfully registered",[],false, res)
                                else template(500, "",[],false, res)
                            }).catch(err => {template(500, err.message,[],false, res)});
                        }
                    }
                    catch(e) { template(500, e.message, [], true, res) }
                })
                .catch(err => template(500, err.message, [], true, res));
        })
    }
    catch(e) { template(500, e.message, [], true, res) }
};

exports.objectUpdate = (req, res) => {
    try {
        let token = req.headers["x-access-token"];
        let {id} = req.params
        let {body} = req
        if(!token) return template(401, "Token not provided", [], false, res)

        jwt.verify(token, process.env.key, (err, decoded) => {
            if(err) return template(401, "Unauthorised", [],false, res)
            User.findByPk(decoded.id)
                .then(async obj => {
                    if(!obj) template(404, "User not found", [], true, res)
                    try {
                        if(obj.roleId === 2) {
                            User.findByPk(id)
                                .then(async user => {
                                    if(user.roleId === 3) {
                                        template(403, "Required Administrator role", [], true, res)
                                    }
                                    else {
                                        try {
                                            if(body.email !== user.dataValues.email && body.email !== "") {
                                                let DBemail = await User.findAll({where: {email: body.email}})
                                                if(DBemail.length > 0) {
                                                    template(409, "Email already exists", [], true, res)
                                                    return false;
                                                }
                                            }
                                            if(body.oldpassword && body.password) {
                                                let passwordIsValid = bcrypt.compareSync(body.oldpassword, user.password);
                                                if(passwordIsValid) body.password = bcrypt.hashSync(body.password, 8)
                                                else {
                                                    template(400, "Incorrect old password", [], true, res)
                                                    return false
                                                }
                                                User.update(body, {where: {id: id}})
                                                    .then(async (response) => {
                                                        if (response[0]) template(200, "Object has been successfully updated", [], true, res)
                                                    })
                                                    .catch(e => {template(500, e.message, [], true, res)});
                                            }
                                            else {
                                                delete body.password
                                                User.update(body, {where: {id: id}})
                                                    .then(async (response) => {
                                                        if (response[0]) template(200, "Object has been successfully updated", [], true, res)
                                                    })
                                                    .catch(e => {template(500, e.message, [], true, res)});
                                            }
                                        }
                                        catch(e) { template(500, e.message, [], true, res) }
                                    }
                                }).catch(err => template(500, err.message, [], true, res));
                        }
                        else {
                            User.findByPk(id)
                                .then(async user => {
                                    try {
                                        if(body.email !== user.dataValues.email && body.email !== "") {
                                            let emailDatabase = await User.findAll({where: {email: body.email}})
                                            if (emailDatabase.length > 0) {
                                                template(409, "Email already exists", [], true, res)
                                                return false;
                                            }
                                        }
                                        if(body.oldpassword && body.password) {
                                            let passwordIsValid = bcrypt.compareSync(body.oldpassword, user.password);
                                            if (passwordIsValid) body.password = bcrypt.hashSync(body.password, 8)
                                            else {
                                                template(400, "Incorrect old password", [], true, res)
                                                return false
                                            }
                                            User.update(body, {where: {id: id}})
                                                .then(async (response) => {
                                                    if (response[0]) template(200, "Object has been successfully updated", [], true, res)
                                                })
                                                .catch(e => {template(500, e.message, [], true, res)});
                                        }
                                        else {
                                            delete body.password
                                            User.update(body, {where: {id: id}})
                                                .then(async (response) => {
                                                    if (response[0]) template(200, "Object has been successfully updated", [], true, res)
                                                })
                                                .catch(e => {template(500, e.message, [], true, res)});
                                        }
                                    }
                                    catch(e) { template(500, e.message, [], true, res) }
                                }).catch(err => template(500, err.message, [], true, res));
                        }
                    }
                    catch(e) { template(500, e.message, [], true, res) }
                }).catch(err => template(500, err.message, [], true, res));
        })
    }
    catch(e) { template(500, e.message, [], true, res) }
};

exports.objectDelete = (req, res) => {
    try {
        let token = req.headers["x-access-token"];
        let {id} = req.params
        if (!token) return template(401, "Token not provided", [], false, res)

        jwt.verify(token, process.env.key, (err, decoded) => {
            if (err) return template(401, "Unauthorised", [], false, res)
            User.findByPk(decoded.id)
                .then(async user => {
                    if (!user) template(404, "User not found", [], true, res)
                    try {
                        if(user.roleId === 3) {
                            User.destroy({where: {id: id}})
                                .then((response) => {
                                    if (response === 1) template(200, "Object has been deleted", [], true, res)
                                    else template(404, "User not found", [], true, res)
                                }).catch(e => {template(500, e.message, [], true, res)});
                        }
                        else {
                            User.findByPk(id).then(
                                async object => {
                                    if(object.roleId === 3) {
                                        template(403, "Required Administrator role", [], true, res)
                                    }
                                    else {
                                        User.destroy({where: {id: id}})
                                            .then((response) => {
                                                if (response === 1) template(200, "Object has been deleted", [], true, res)
                                                else template(404, "User not found", [], true, res)
                                            }).catch(e => {template(500, e.message, [], true, res)});
                                    }
                                }).catch(e => {template(500, e.message, [], true, res)});
                        }
                    }
                    catch(e) { template(500, e.message, [], true, res) }
                }).catch(err => template(500, err.message, [], true, res));
        });
    }
    catch(e) { template(500, e.message, [], true, res) }
};
