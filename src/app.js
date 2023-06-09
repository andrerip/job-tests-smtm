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

/**
 * Add a new product to the inventory
 * 
 * @body {string} title - The title of the product
 * @body {string} description - The description of the product
 * @body {number} price - The price of the product
 * @body {number} inventory - The inventory count of the product
 * @body {string} [sku] - The SKU of the product
 * @body {string} [mainImageUrl] - The URL of the product image
 * @body {number[]} [categoryIds] - The IDs of the categories to add the product to
 * @body {number[]} [tagIds] - The IDs of the tags to add the product to
 * @returns {object} product - The product that was created
 * @throws {object} 400 - Bad request
 * @throws {object} 500 - Server error
 * 
*/
app.post('/products', async (req, res) => {
    const { Product, Category, Tag } = req.app.get('models')

    if(!req.body || Object.keys(req.body).length === 0) {
        return clientError(res, 'No body found!')
    }
    const validKeys = ['title', 'description', 'price', 'inventory', 'sku', 'mainImageUrl', 'categoryIds', 'tagIds']
    const bodyKeys = Object.keys(req.body)
    const isValidOperation = bodyKeys.every((key) => validKeys.includes(key))
    if (!isValidOperation) {
        return clientError(res, 'Invalid body attributes!')
    }

    const { title, description, price, inventory, sku, mainImageUrl, categoryIds, tagIds } = req.body

    const t = await sequelize.transaction();
    try {
        const product = await Product.create({
            title,
            description,
            price,
            inventory,
            sku,
            mainImageUrl
        })
        if (categoryIds) {
            const categories = await Category.findAll({
                where: {
                    id: {
                        [Op.in]: categoryIds
                    }
                }
            })
            await product.addCategories(categories)
        }
        if (tagIds) {
            const tags = await Tag.findAll({
                where: {
                    id: {
                        [Op.in]: tagIds
                    }
                }
            })
            await product.addTags(tags)
        }
        t.commit();
        return res.status(201).send(product);

    } catch (error) {
        console.log(error);
        t.rollback();
        return res.status(500).send({ message: 'Server error' })
    }

})

function clientError(res, message) {
    return res.status(400).send({ message: message });
}

module.exports = app;
