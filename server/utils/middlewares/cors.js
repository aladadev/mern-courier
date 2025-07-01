const cors = require('cors');
const config = require('../config');

var corsOptionsDelegate = function (req, callback) {
  var corsOptions = {
    credentials: true,
    exposedHeaders: ['X-Redirect-Uri'],
    optionsSuccessStatus: 200,
    preflightContinue: false,
  };
  if (config.origin.allowedClients.indexOf(req.header('Origin')) !== -1) {
    corsOptions.origin = true; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions.origin = false; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};

module.exports = cors(corsOptionsDelegate);
