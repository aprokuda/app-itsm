const controller = require("../controllers/request.controller");

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
    app.post("/attachment/createObject/:id", controller.createAttachment);

    app.get("/incident/getObject/:id?", controller.getIncident);
    app.post("/incident/createObject", controller.createIncident);
    app.put("/incident/updateObject/:id", controller.updateIncident);

    app.get("/comment/getObject/:id1/comment/:id2?", controller.getComment);
    app.post("/comment/createObject/:id", controller.createComment);
};
