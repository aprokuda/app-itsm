const controller = require("../controllers/request.controller");
const { authJwt } = require("../middleware");
const path = require('path');
const template = require("../templateResponse");
const multer = require('multer');

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/request/getObject/:id?", controller.getRequest);
    app.post("/request/createObject", controller.createRequest);

    app.get("/attachment/getObject/:id?", controller.getAttachment);
    /******************************     API FOR UPLOADING THE FILES     **********************************/
    let storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname + '../../uploads/'))
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })
    let upload = multer({
        storage: storage,
        fileFilter: function (req, file, cb) {
            var filetypes = /pdf|doc|xml|png|jpg|jpeg|docx|docm|dotx|xps|txt|xlsx|xlsm/;
            var mimetype = filetypes.test(file.mimetype);
            var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            if (mimetype && extname) {
                return cb(null, true);
            }
            else { cb("Error: File upload only supports the following filetypes - " + filetypes); }
        }
    })
    app.post("/attachment/createObject/:id",
        [authJwt.verifyToken,
            (req, res, next) => {
                upload.single('file')(req, res, (err) => {
                    var filetypes = /pdf|doc|xml|png|jpg|jpeg|docx|docm|dotx|xps|txt|xlsx|xlsm/;
                    if(err) return template(500, "Error: File upload only supports the following filetypes - " + filetypes, err.message, true, res);
                    else next();
                })
            }
        ],
        controller.createAttachment
    );
    ///////////////////////////////////////////////////////////////////////////////////

    app.get("/incident/getObject/:id?", controller.getIncident);
    app.post("/incident/createObject", controller.createIncident);
    app.put("/incident/updateObject/:id", controller.updateIncident);

    app.get("/comment/getObject/:id1/comment/:id2?", controller.getComment);
    app.post("/comment/createObject/:id", controller.createComment);
};
