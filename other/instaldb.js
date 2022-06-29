/***********************************************************************************************/
/*                                                                                             */
/*                       Создает основные данные пользовательских ролей                        */
/*                       А также пользователя с правами администратора                         */
/*                                                                                             */
/***********************************************************************************************/
const db = require("../models/index")
const User = db.user
const Role = db.role
const bcrypt = require("bcryptjs");

function initial() {
    /************************   USER   ****************************/
    setTimeout(() => {
        User.create({
            name: "admin",
            surname: "admin",
            patronymic: "",
            password: bcrypt.hashSync("admin", 8),
            phone: "77770001100",
            email: "",
            roleId: 3
        })
    }, 100)
    setTimeout(() => {
    
    }, 200)
    /***********************   ROLE   ***************************/
    setTimeout(() => {
        Role.create({
            name: "User",
            value: "User"
        })
        Role.create({
            name: "Moderator",
            value: "Moderator"
        })
        Role.create({
            name: "Administrator",
            value: "Administrator"
        })
    }, 200)
}
module.exports  =  initial