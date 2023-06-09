const httpStatus = require('http-status');
const { sequelize } = require('../models/model');
const { Op } = require('sequelize');
const ApiError = require('../utils/ApiError');

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
const queryProducts = async (req) => {
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

    return products;
};

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
const createProduct = async (req) => {
    const { Product, Category, Tag } = req.app.get('models')

    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'No body found!');
    }
    const validKeys = ['title', 'description', 'price', 'inventory', 'sku', 'mainImageUrl', 'categoryIds', 'tagIds']
    const bodyKeys = Object.keys(req.body)
    const isValidOperation = bodyKeys.every((key) => validKeys.includes(key))
    if (!isValidOperation) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid body attributes!');
    }
    const { title, description, price, inventory, sku, mainImageUrl, categoryIds, tagIds } = req.body
    console.debug(`Fields validated. Starting to add product title '${title}'`);

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
        console.log(`Product added successfully. Product id: ${product.id}, title: ${product.title}`);
        return product;

    } catch (error) {
        console.error(error);
        t.rollback();
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error adding product!');
    }

};

module.exports = {
    queryProducts,
    createProduct
};