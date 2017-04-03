const mongoose = require('mongoose');
const config = require('config');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

mongoose.Promise = Promise;
mongoose.plugin(beautifyUnique);

mongoose.plugin((schema) => {
  schema.options.toObject = Object.assign({}, schema.options.toObject, { versionKey: false });
});

mongoose.connect(config.get('dbConnection'));

module.exports = mongoose;
