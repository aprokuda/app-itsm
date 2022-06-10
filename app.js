require('custom-env').env();        // Файл со всеми данными сервера и бд
const express = require("express");
const app = express();
const cors = require('cors');
const path = require('path');
const template = require('./templateResponse');
const bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: '50kb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '50kb' }))
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'upload')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use(cors(''));

const db = require('./models');
<<<<<<< HEAD

=======
>>>>>>> b1e074a651351ced519d4fe82fde9457af6f75ab
// Строка для синхронизации изменении с БД
db.sequelize.sync();

// Строки для полного изменения БД, сохраняя при этом уже существующие данные
// db.sequelize.sync({ alter: true }).then(() => {       // alter: true,     force: false
//    console.log('Altered and Re-synced Database');
// });

////////////////////    ROUTES      //////////////////////
require('./routes/auth.route')(app);
require('./routes/user.route')(app);
require('./routes/role.route')(app);
require('./routes/request.route')(app);
<<<<<<< HEAD

app.use((req, res) => { template(404, "Route '" + req.url + "' not found!", [], false, res); })

// if (process.env.HOST_PORT == 'development') {
//   app.listen(PORT, () =>
//     console.log(`Example auth is listening on port ${PORT}!`, Date())
//   )
// } else if (NODE_ENV == 'production') {
//   let httpsOptions = {
//     key: fs.readFileSync('/home/askar/certs/m-lombard.key'),
//     cert: fs.readFileSync('/home/askar/certs/m-lombard.crt')
//   }
//   const server = https.createServer(httpsOptions, app).listen(PORT, () => {
//     console.log(`App auth is running on port ${PORT}...`, Date())
//   })
// }
=======
>>>>>>> b1e074a651351ced519d4fe82fde9457af6f75ab

app.listen(process.env.HOST_PORT, () => {
    console.log("Server started on port " + process.env.HOST_PORT + "!", Date());
});