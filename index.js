require("dotenv").config();

var express = require("express"),
    swaggerJSDoc = require("swagger-jsdoc"),
    methodOverride = require("method-override"),
    routes = require("./routes"),
    nconf = require("./config"),
    swaggerUi = require("swagger-ui-express"),
    setAuthUser = require("./middlewares/setAuthUser"),
    neo4jSessionCleanup = require("./middlewares/neo4jSessionCleanup"),
    writeError = require("./helpers/response").writeError;


var app = express(),
    api = express();

app.use(nconf.get("api_path"), api);

var swaggerDefinition = {
    info: {
        title: "Jaan Pehchan Neo4j(Node/Express)",
        version: "1.0.0",
        description: "",
    },
    host: "localhost:5000",
    basePath: "/",
};

// options for the swagger docs
var options = {
    // import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // path to the API docs
    apis: ["./routes/*.js"],
};

// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);

// serve swagger
api.get("/swagger.json", function (req, res) {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.set("port", nconf.get("PORT"));

api.use(express.urlencoded({ extended: true }));
api.use(express.json());
api.use(methodOverride());

//enable CORS
api.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
        "Access-Control-Allow-Methods",
        "GET,HEAD,OPTIONS,POST,PUT,DELETE"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
});

//api custom middlewares:
api.use(setAuthUser);
api.use(neo4jSessionCleanup);

//api routes
app.get('/', function (req, res) {
    res.send('Backend is live')
})

api.post("/register", routes.users.register);
api.post("/login", routes.users.login);
api.get("/users/me", routes.users.me);
api.post("/users/me/name", routes.users.updateName);
api.post("/users/registerContacts", routes.users.registerContacts);
api.get("/users/check", routes.users.checkUser);

// seller: 
api.post("/sellers/order-request", routes.sellers.orderRequest);
api.post("/sellers/order-success", routes.sellers.orderSuccess);
api.post("/seller/register", routes.sellers.registerSeller);
api.get("/seller/relationships", routes.sellers.getAllRelationships);
api.get("/seller/info", routes.sellers.getSellerInfo);
api.get("/seller/listings", routes.sellers.getSellerListings);
api.get("/seller/seller-fee", routes.sellers.returnSellerFeeAmount);
// products: 
api.get("/category/all", routes.products.getCategories);
api.post("/category/posts", routes.products.postCategories);
api.post("/category/post", routes.products.postCategory);
api.post("/requirements/post", routes.products.postRequirements);
api.post("/products/post", routes.products.postProduct);
api.post("/products/update", routes.products.modifyProduct);
api.post("/products/save", routes.products.saveProduct);
api.get("/products/save", routes.products.getSavedProducts);
api.get("/products/read", routes.products.getProduct);
api.get("/products/details", routes.products.getDetailedProduct);
api.get("/products/recommended", routes.products.getRecommnededProducts);
api.get("/products/category", routes.products.getProductsByCategory);
api.get("/products/search", routes.products.searchProducts);


// api.get("/movies", routes.movies.list);
// api.get("/movies/recommended", routes.movies.getRecommendedMovies);
// api.get("/movies/rated", routes.movies.findMoviesRatedByMe);
// api.get("/movies/:id", routes.movies.findById);
// api.get("/movies/genre/:id", routes.movies.findByGenre);
// api.get("/movies/daterange/:start/:end", routes.movies.findMoviesByDateRange);
// api.get("/movies/directed_by/:id", routes.movies.findMoviesByDirector);
// api.get("/movies/acted_in_by/:id", routes.movies.findMoviesByActor);
// api.get("/movies/written_by/:id", routes.movies.findMoviesByWriter);
// api.post("/movies/:id/rate", routes.movies.rateMovie);
// api.delete("/movies/:id/rate", routes.movies.deleteMovieRating);
// api.get("/people", routes.people.list);
// api.get("/people/:id", routes.people.findById);
// api.get("/people/bacon", routes.people.getBaconPeople);
// api.get("/genres", routes.genres.list);

//api error handler
api.use(function (err, req, res, next) {
    if (err && err.status) {
        writeError(res, err);
    } else next(err);
});

app.listen(app.get("port"), () => {
    console.log(
        "Express server listening on port " + app.get("port") + " see docs at /docs"
    );
});
