const Seller = require('../models/seller')
    , Razorpay = require("razorpay")
    , crypto = require("crypto")
    , writeResponse = require('../helpers/response').writeResponse
    , writeError = require('../helpers/response').writeError
    , loginRequired = require('../middlewares/loginRequired')
    , adminRequired = require('../middlewares/adminRequired')
    , dbUtils = require('../neo4j/dbUtils')
    , _ = require('lodash');


/**
* @swagger
* definitions:
*   Seller:
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
 * /api/v0/seller/register:
 *   post:
 *     tags:
 *     - products
 *     description: Register the user as seller
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
 *             name:
 *                type: string
 *             type:
 *               type: string
 *             email:
 *               type: string
 *             address:
 *               type: object
 *             gst:
 *               type: string
 *     responses:
 *       201:
 *         description: Registered the user as seller
 *         schema:
 *           $ref: '#/definitions/Product'
 *       400:
 *         description: Error message(s)
 */

exports.registerSeller = function (req, res, next) {
    const id = _.get(req.body, 'id');
    const company_name = _.get(req.body, 'company_name');
    const company_type = _.get(req.body, 'company_type');
    const company_email = _.get(req.body, 'company_email');
    const company_address = _.get(req.body, 'company_address');
    const company_gst = _.get(req.body, 'company_gst');
    const body = { id, company_name, company_type, company_email, company_address, company_gst };

    if (!id) {
        throw { id: 'This field is required.', status: 400 };
    }
    if (!company_name) {
        throw { name: 'This field is required.', status: 400 };
    }
    if (!company_type) {
        throw { type: 'This field is required.', status: 400 };
    }
    if (!company_email) {
        throw { email: 'This field is required.', status: 400 };
    }
    if (!company_address) {
        throw { address: 'This field is required.', status: 400 };
    }

    Seller.registerSeller(dbUtils.getSession(req), body)
        .then(response => writeResponse(res, response, 201))
        .catch(next);
}

exports.getAllRelationships = function (req, res, next) {
    const seller_id = _.get(req.query, 'seller_id');
    const id = _.get(req.query, 'id');
    console.log(id, seller_id);

    if (!seller_id || !id) {
        throw { seller_id: 'This field is required.', status: 400 };
    }

    Seller.getAllRelationships(dbUtils.getSession(req), id, seller_id)
        .then(response => writeResponse(res, response))
        .catch(next);
}

exports.getSellerInfo = function (req, res, next) {
    const seller_id = _.get(req.query, 'seller_id');
    if (!seller_id) {
        throw { seller_id: 'This field is required.', status: 400 };
    }

    Seller.getSellerInfo(dbUtils.getSession(req), seller_id)
        .then(response => writeResponse(res, response))
        .catch(next);
}

exports.getSellerListings = function (req, res, next) {
    const seller_id = _.get(req.query, 'seller_id');
    const page = _.get(req.query, 'page');
    const size = _.get(req.query, 'size');
    if (!seller_id) {
        throw { seller_id: 'This field is required.', status: 400 };
    }

    Seller.getSellerListings(dbUtils.getSession(req), seller_id, page, size)
        .then(response => writeResponse(res, response))
        .catch(next);
}

exports.orderRequest = function (req, res, next) {
    const seller_id = _.get(req.body, 'seller_id');
    const amount_in_rupees = _.get(req.body, 'amount_in_rupees');
    if (!seller_id) {
        throw { seller_id: 'This field is required.', status: 400 };
    }
    if (!amount_in_rupees) {
        throw { amount_in_rupees: 'This field is required.', status: 400 };
    }

    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY,
        key_secret: process.env.RAZORPAY_SECRET,
    });
    const options = {
        amount: amount_in_rupees * 100,  // amount in the smallest currency unit
        currency: "INR",
        notes: {
            reason: 'Payment for Seller Registration'
        },
        // receipt: id + '_' + Date.now(),
    };

    instance.orders.create(options, function (err, order) {
        console.log(order);
        if (err) {
            console.log(err);
            return writeError(res, err, 400);
        } else {
            return writeResponse(res, { order }, 201);
        }

    });
}

exports.orderSuccess = function (req, res, next) {
    // console.log(req.body);
    const order_id = _.get(req.body, 'razorpay_order_id');
    const payment_id = _.get(req.body, 'razorpay_payment_id');
    const signature = _.get(req.body, 'razorpay_signature');
    const seller_id = _.get(req.body, 'seller_id');
    const amount = _.get(req.body, 'amount');
    // console.log(amount)
    if (!order_id) {
        throw { order_id: 'This field is required.', status: 400 };
    }
    if (!payment_id) {
        throw { payment_id: 'This field is required.', status: 400 };
    }
    if (!seller_id) {
        throw { seller_id: 'This field is required.', status: 400 };
    }
    if (!amount) {
        throw { amount: 'This field is required.', status: 400 };
    }
    if (!signature) {
        throw { signature: 'This field is required.', status: 400 };
    }

    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY,
        key_secret: process.env.RAZORPAY_SECRET,
    });
    const body = order_id + "|" + payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest('hex');
    if (expectedSignature === signature) {
        Seller.orderSuccess(dbUtils.getSession(req), order_id, payment_id, seller_id, signature, amount)
            .then(response => writeResponse(res, response))
            .catch(next);
    } else {
        writeError(res, { message: 'Payment not captured' }, 400);
    }
}

exports.returnSellerFeeAmount = function (req, res, next) {
    const AMOUNT = 100;
    return writeResponse(res, { amount: AMOUNT }, 201);
}