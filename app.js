require('custom-env').env();
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
db.sequelize.sync();
// db.sequelize.sync({ alter: true }).then(() => {       // alter: true,     force: false
//    console.log('Alter and Re-sync Database');
// });

require('./routes/auth.route')(app);
require('./routes/user.route')(app);
require('./routes/role.route')(app);
require('./routes/request.route')(app);
// require('')(app);

app.listen(process.env.HOST_PORT, () => {
    console.log("Server start!")
});