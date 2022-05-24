const { authJwt,verifySignUp } = require("../middleware");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/user/getObject/:id?",
        [authJwt.verifyToken],
        controller.getObject
    );

    app.post("/user/createObject",
        [authJwt.verifyToken, authJwt.isAdminOrModerator],
        controller.objectCreate
    );

    app.put("/user/updateObject/:id",
        [authJwt.verifyToken, authJwt.isAdminOrModerator],
        controller.objectUpdate
    );

    app.delete("/user/deleteObject/:id",
        [authJwt.verifyToken, authJwt.isAdminOrModerator],
        controller.objectDelete
    );
};
