
//web-server.js(backend)
const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const path = require('path');

const app = express();
const router = express.Router();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true })); // URL-encoded parsing
app.use(bodyParser.json()); // JSON parsing

// Cross Orgin Reference Service required for multiport connection
app.use(cors());


// Route setup
router.use("/api", require("./api/api-users"));
app.use(router);

// Start server
app.listen(3000, function() {
    console.log("Listening on port 3000...");
});

