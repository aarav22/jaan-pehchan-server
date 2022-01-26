const Products = require('../models/products')
    , writeResponse = require('../helpers/response').writeResponse
    , writeError = require('../helpers/response').writeError
    , loginRequired = require('../middlewares/loginRequired')
    , adminRequired = require('../middlewares/adminRequired')
    , dbUtils = require('../neo4j/dbUtils')
    , _ = require('lodash');


/**
* @swagger
* definitions:
*   Product:
*     type: object
*     properties:
*       id:
*         type: string
*       name:
*         type: string
*       price:
*         type: string
*       description:
*         type: string
*       sellerID:
*         type: string
*       categoryID:
*         type: string
*       thumbnail:
*         type: string
*/

/**
 * @swagger
 * /api/v0/products/recommended:
 *   get:
 *     tags:
 *     - products
 *     description: Get recommended products
 *     produces:
 *       - application/json
 *     parameters:
 *       - id: body
 *         in: body
 *         type: object
 *         schema:
 *           properties:
 *             id:
 *                type: string
 *     responses:
 *       201:
 *         description: Your products
 *         schema:
 *           $ref: '#/definitions/Product'
 *       400:
 *         description: Error message(s)
 */

exports.getRecommnededProducts = function (req, res, next) {
    const id = _.get(req.query, 'id');
    const page = _.get(req.query, 'page');
    const size = _.get(req.query, 'size');
    if (!id | !page || !size) {
        throw { id: 'This id is required.', status: 400 };
    }
    Products.getRecommnededProducts(dbUtils.getSession(req), id)
        .then(response => writeResponse(res, response, 201))
        .catch(next);
}


/**
 * @swagger
 * /api/v0/products/post:
 *   post:
 *     tags:
 *     - products
 *     description: Post a prodcut
 *     produces:
 *       - application/json
 *     parameters:
 *       - id: body
 *         in: body
 *         type: object
 *         schema:
 *           properties:
 *               id:
 *                 type: string
 *               categoryID: 
 *                 type: string
 *               product_name:
 *                 type: string
 *               price:
 *                 type: string
 *               description:
 *                 type: string
 *               picture:
 *                 type: string
 *     responses:
 *       201:
 *         description: Your products
 *         schema:
 *           $ref: '#/definitions/Product'
 *       400:
 *         description: Error message(s)
 */

exports.postProduct = function (req, res, next) {
    const id = _.get(req.body, 'id');
    const category_id = _.get(req.body, 'category_id');
    const product_name = _.get(req.body, 'product_name');
    const price = _.get(req.body, 'price');
    const description = _.get(req.body, 'description');
    const picture = _.get(req.body, 'picture');
    const seller_name = _.get(req.body, 'seller_name');
    console.log(seller_name, 'seller_name', id, 'id', category_id, 'category_id', product_name, 'product_name', price, 'price', description, 'description', picture, 'picture');
    if (!id || !category_id || !product_name || !price || !description || !picture || !seller_name) {
        throw { id: 'This field is required.', status: 400 };
    }
    Products.postProduct(dbUtils.getSession(req), id, category_id, product_name, price, description, picture, seller_name)
        .then(response => writeResponse(res, response, 201))
        .catch(next);
}

exports.modifyProduct = function (req, res, next) {
    const id = _.get(req.body, 'id');
    const category_id = _.get(req.body, 'category_id');
    const product_name = _.get(req.body, 'product_name');
    const price = _.get(req.body, 'price');
    const description = _.get(req.body, 'description');
    const picture = _.get(req.body, 'picture');
    const product_id = _.get(req.body, 'product_id');
    console.log(id, 'id', category_id, 'category_id', product_name, 'product_name', price, 'price', description, 'description', picture, 'picture');
    if (!id || !category_id || !product_name || !price || !description || !picture || !product_id) {
        // throw { id: 'This field is required.', status: 400 };
        switch (true) {
            case !id:
                throw { id: 'This field is required.', status: 400 };
                break;
            case !category_id:
                throw { category_id: 'This field is required.', status: 400 };
                break;
            case !product_name:
                throw { product_name: 'This field is required.', status: 400 };
                break;
            case !price:
                throw { price: 'This field is required.', status: 400 };
                break;
            case !description:
                throw { description: 'This field is required.', status: 400 };
                break;
            case !picture:
                throw { picture: 'This field is required.', status: 400 };
                break;
            case !product_id:
                throw { product_id: 'This field is required.', status: 400 };
                break;
        }
    }
    Products.modifyProduct(dbUtils.getSession(req), id, product_id, product_name, price, description, picture, category_id)
        .then(response => writeResponse(res, response, 201))
        .catch(next);
}

exports.postRequirements = function (req, res, next) {
    const id = _.get(req.body, 'id');
    const category_id = _.get(req.body, 'category_id');
    const product_name = _.get(req.body, 'product_name');
    const price = _.get(req.body, 'price');
    const description = _.get(req.body, 'description');
    const seller_name = _.get(req.body, 'seller_name');
    if (!id || !category_id || !product_name || !price || !description || !seller_name) {
        throw { id: 'This field is required.', status: 400 };
    }
    Products.postRequirements(dbUtils.getSession(req), id, category_id, product_name, price, description, seller_name)
        .then(response => writeResponse(res, response, 201))
        .catch(next);
}


exports.saveProduct = function (req, res, next) {
    const id = _.get(req.body, 'id');
    const product_id = _.get(req.body, 'product_id');
    if (!product_id || !id) {
        throw { id: 'This field is required.', status: 400 };
    }
    Products.saveProduct(dbUtils.getSession(req), id, product_id)
        .then(response => writeResponse(res, response, 201))
        .catch(next);
}

exports.getSavedProducts = function (req, res, next) {
    const id = _.get(req.query, 'id');
    if (!id) {
        throw { id: 'This field is required.', status: 400 };
    }
    Products.getSavedProducts(dbUtils.getSession(req), id)
        .then(response => writeResponse(res, response, 201))
        .catch(next);
}


exports.getProduct = function (req, res, next) {
    const product_id = _.get(req.query, 'product_id');
    if (!product_id) {
        throw { id: 'This product_id is required.', status: 400 };
    }
    Products.getProduct(dbUtils.getSession(req), product_id)
        .then(response => writeResponse(res, response, 201))
        .catch(next);
}

exports.getDetailedProduct = function (req, res, next) {
    const id = _.get(req.query, 'id');
    const product_id = _.get(req.query, 'product_id');
    if (!product_id || !id) {
        throw { id: 'This product_id is required.', status: 400 };
    }
    Products.getDetailedProduct(dbUtils.getSession(req), id, product_id)
        .then(response => writeResponse(res, response, 201))
        .catch(next);
}

exports.getProductsByCategory = function (req, res, next) {
    const category_id = _.get(req.query, 'category_id');
    const page = _.get(req.query, 'page');
    const size = _.get(req.query, 'size');
    if (!category_id | !page || !size) {
        throw { id: 'This category_id is required.', status: 400 };
    }
    Products.getProductsByCategory(dbUtils.getSession(req), category_id, Math.trunc(parseInt(page)), Math.trunc(parseInt(size)))
        .then(response => writeResponse(res, response, 201))
        .catch(next);
}

exports.postCategory = function (req, res, next) {
    const category_name = _.get(req.body, 'category_name');
    const category_image = _.get(req.body, 'category_image');
    if (!category_name || !category_image) {
        throw { id: 'This field is required.', status: 400 };
    }
    Products.postCategory(dbUtils.getSession(req), category_name, category_image)
        .then(response => writeResponse(res, response, 201))
        .catch(next);
}

exports.postCategories = function (req, res, next) {
    const categories = _.get(req.body, 'categories');
    if (!categories) {
        throw { id: 'This field is required.', status: 400 };
    }
    Products.postCategories(dbUtils.getSession(req), categories)
        .then(response => writeResponse(res, response, 201))
        .catch(next);
}

exports.getCategories = function (req, res, next) {
    Products.getCategories(dbUtils.getSession(req))
        .then(response => writeResponse(res, response, 201))
        .catch(next);
}

exports.searchProducts = function (req, res, next) {
    const search_text = _.get(req.query, 'search_text');
    console.log(req.query)
    if (!search_text) {
        throw { search_text: 'This field is required.', status: 400 };
    }
    Products.searchProducts(dbUtils.getSession(req), search_text)
        .then(response => writeResponse(res, response, 201))
        .catch(next);
}