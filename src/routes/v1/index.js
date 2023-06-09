const express = require('express');
const productsRoute = require('./product.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/products',
    route: productsRoute,
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
