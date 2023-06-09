const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models/model');
const routes = require('./routes/v1');

const app = express();

app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

module.exports = app;
