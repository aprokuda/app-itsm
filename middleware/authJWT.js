const jwt = require("jsonwebtoken");
const db = require("../models");
const template = require("../templateResponse");
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        return template(400, "Token not provided!",[],false,res)
    }

    jwt.verify(token, process.env.key, (err, decoded) => {
        if (err) {
            return template(400, "Unauthorised",[],false,res)
        }
        req.userId = decoded.id;
        next();
    });
};

isModerator = (req, res, next) => {
    User.findByPk(req.userId).then(user => {
        Role.findByPk(roleID).then(role => {
            if (role.value === "Moderator") {
                next();
                return;
            }
            template(403, "Required Moderator Role",[],true, res)
        })
            .catch(error => { template(500, error.message,[],true, res) });
    });
};

isAdmin = (req, res, next) => {
    User.findByPk(req.userId).then(user => {
        Role.findByPk(user.roleId).then(role => {
            if(role.value === "Administrator") {
                next();
                return;
            }
            template(403, "Required Administrator Role",[],true, res)
        }).catch(error => { template(500, error.message,[],true, res) });
    });
};

isAdminOrModerator = (req, res, next) => {
    try{
        User.findByPk(req.userId).then(user => {
            Role.findByPk(user.roleId).then(role => {
                if(role.value === "Administrator") {
                    next();
                    return;
                }
                if(role.value === "Moderator") {
                    next();
                    return;
                }
                template(403, "Required Administrator Role",[],true, res)
            }).catch(error => { template(500, error.message,[],true, res) });
        });
    }
    catch (e) { console.log(e) }
};

const authJwt = {
    verifyToken: verifyToken,
    isModerator: isModerator,
    isAdmin: isAdmin,
    isAdminOrModerator: isAdminOrModerator
};
module.exports = authJwt;