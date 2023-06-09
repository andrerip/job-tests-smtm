const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model')
const { Op } = require('sequelize')
// const { getProfile } = require('./middleware/getProfile')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)


/**
 * Retrieve a collection of products
 * 
 * @param {string} [keyword] - The title keyword to filter products by
 * @param {number} [priceFrom] - The minimum price to filter products by
 * @param {number} [priceTo] - The maximum price to filter products by
 * @param {number} [limit] - The maximum number of products to return
 * @param {number} [offset] - The number of products to skip
 * @param {string} [orderBy] - The property to order the products by
 * @param {string} [orderByDesc] - Whether to order the products in descending order
 * @returns {object[]} products - An array of products
 */
app.get('/products', async (req, res) => {
    const { Product, Category, Tag } = req.app.get('models')
    const { keyword, priceFrom, priceTo, limit = 10, offset = 0, orderBy = 'createdAt', orderByDesc = 'true' } = req.query
    const where = {};
    const orderByDirection = orderByDesc === 'true' ? 'DESC' : 'ASC';

    if (priceFrom && priceTo) {
        where.price = {
            [Op.between]: [priceFrom, priceTo]
        };
    }

    if (keyword) {
        where.title = {
            [Op.like]: `%${keyword}%`
        };
    }

    const products = await Product.findAll({
        where,
        order: [
            [orderBy, orderByDirection]
        ],
        limit,
        offset,
        include: [{
            model: Category,
            attributes: ['id', 'name'],
            through: { attributes: [] }

        },
        {
            model: Tag,
            attributes: ['id', 'name'],
            through: { attributes: [] }
        }]
    })
    res.status(200).send(products)
})

module.exports = app;