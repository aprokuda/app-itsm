const {Sequelize,DataTypes } = require("sequelize");
const sequelize = new Sequelize(`postgres://${process.env.USER_DB}:${process.env.PASSWORD_DB}@${process.env.HOST_DB}:${process.env.PORT_DB}/${process.env.DATABASE_DB}`);
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

/***********************************************************************************************************************************/
/*                                                            MODELS                                                               */
/***********************************************************************************************************************************/
db.user = require("./user.model.js")(sequelize, DataTypes);
db.role = require("./role.model.js")(sequelize, DataTypes);

/***********************************************************************************************************************************/
/*                                                          ASSOCIATIONS                                                           */
/***********************************************************************************************************************************/
db.role.hasMany(db.user);

module.exports = db;
