require('custom-env').env();        // Файл со всеми данными сервера и бд
const express = require("express");
const app = express();
const cors = require('cors');
const path = require('path');
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'upload')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use(cors(''));

const db = require('./models');
// Строка для синхронизации изменении с БД
db.sequelize.sync();

// Строки для полного изменения БД, сохраняя при этом уже существующие данные
// db.sequelize.sync({ alter: true }).then(() => {       // alter: true,     force: false
//    console.log('Altered and Re-synced Database');
// });

require('./routes/auth.route')(app);
require('./routes/user.route')(app);
require('./routes/role.route')(app);
require('./routes/request.route')(app);

app.listen(process.env.HOST_PORT, () => {
    console.log("Server start!")
});