const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model')
const { Op } = require('sequelize')
const { getProfile } = require('./middleware/getProfile')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)