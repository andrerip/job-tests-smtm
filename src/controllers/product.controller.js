const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const productServices = require('../services/product.service');

const getProducts = catchAsync(async (req, res) => {
    const result = await productServices.queryProducts(req);
    res.send(result);
});

const createProduct = catchAsync(async (req, res) => {
    const product = await productServices.createProduct(req);
    res.status(httpStatus.CREATED).send(product);
});

module.exports = {
    getProducts,
    createProduct
};
