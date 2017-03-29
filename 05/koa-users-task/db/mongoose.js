const mongoose = require('mongoose');
const config = require('config');

mongoose.Promise = Promise;

mongoose.connect(config.get('dbConnection'));

module.exports = mongoose;
