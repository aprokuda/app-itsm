const db = require("../models");
const User = db.user;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
let template = require('../templateResponse')

exports.signup = (req, res) => {
    // Save User to Database
    try {
        User.create({
            phone: req.body.phone,
            password: bcrypt.hashSync(req.body.password, 8),
            roleId:req.body.role===undefined ?1:req.body.role
            })
            .then(user => {
                if (user) template(200, "User has been successfully registered",[],false, res)
                else template(500, "",[],false, res)
            })
            .catch(err => { template(500, err.message,[],false,res) });
    }
    catch(err) { template(500, err.message,[],false,res) }
};

exports.signin = (req, res) => {
    User.findOne({ where: { phone: req.body.phone } })
        .then(user => {
            if (!user) {
                return  template(401, "Wrong phone or password",[],true, res)
            }

            var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
            if (!passwordIsValid) return template(401, "Wrong phone or password", [], true, res)

            var token = jwt.sign({ id: user.id }, process.env.key, {
                expiresIn: 86400 // 24 hours
            });
            delete user.dataValues.password
            template(200, "", { accessToken: token, user }, false, res)
        })
        .catch(err => { template(500, err.message , [], false, res) });
};