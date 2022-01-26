const Users = require('../models/users')
    , writeResponse = require('../helpers/response').writeResponse
    , writeError = require('../helpers/response').writeError
    , loginRequired = require('../middlewares/loginRequired')
    , adminRequired = require('../middlewares/adminRequired')
    , dbUtils = require('../neo4j/dbUtils')
    , _ = require('lodash');

/**
 * @swagger
 * definitions:
 *   User:
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *       username:
 *         type: string
 *       avatar:
 *         type: object
 */

/**
 * @swagger
 * /api/v0/register:
 *   post:
 *     tags:
 *     - users
 *     description: Register a new user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         type: object
 *         schema:
 *           properties:
 *             name:
 *                type: string
 *             phoneNumber:
 *                type: string
 *             id: 
 *                type: string
 *     responses:
 *       201:
 *         description: Your new user
 *         schema:
 *           $ref: '#/definitions/User'
 *       400:
 *         description: Error message(s)
 */


exports.register = function (req, res, next) {
    adminRequired(req, res, () => {
        const authHeader = req.headers['admin-auth'];
        const match = authHeader.match(/^Token (\S+)/);
        if (!match || !match[1]) {
            throw { message: 'invalid format. Follow `Token <token>`', status: 401 };
        }
        console.log("Here: ", match[1]);
        console.log("Register Request: ", req);
        const name = _.get(req.body, 'name');
        const phoneNumber = _.get(req.body, 'phone_number');
        const id = _.get(req.body, 'id');
        console.log(name, phoneNumber, id);

        if (!name) {
            throw { name: 'This field is required.', status: 400 };
        }
        if (!phoneNumber) {
            throw { phoneNumber: 'This field is required.', status: 400 };
        }
        if (!id) {
            throw { id: 'This field is required.', status: 400 };
        }

        Users.register(dbUtils.getSession(req), name, phoneNumber, id)
            .then(response => writeResponse(res, response, 201))
            .catch(next);
    })
};


/**
 * @swagger
 * /api/v0/registerContact:
 *   post:
 *     tags:
 *     - users
 *     description: Register a new user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         type: object
 *         schema:
 *           properties:
 *             name:
 *                type: string
 *             phoneNumber:
 *                type: string
 *             id: 
 *                type: string
 *     responses:
 *       201:
 *         description: Your new user
 *         schema:
 *           $ref: '#/definitions/User'
 *       400:
 *         description: Error message(s)
 */

exports.registerContacts = function (req, res, next) {
    loginRequired(req, res, () => {
        console.log("Register Contact Request: ", req);
        const authHeader = req.headers['authorization'];
        const match = authHeader.match(/^Token (\S+)/);
        if (!match || !match[1]) {
            throw { message: 'invalid format. Follow `Token <token>`', status: 401 };
        }
        console.log("Here: ", match[1]);
        const phone_numbers = _.get(req.body, 'phone_numbers');
        const api_key = match[1];
        if (phone_numbers.length < 1) {
            throw { phone_numbers: 'This field is required.', status: 400 };
        }
        if (!api_key) {
            throw { api_key: 'This field is required.', status: 400 };
        }

        Users.registerContacts(dbUtils.getSession(req), api_key, phone_numbers)
            .then(response => writeResponse(res, response, 201))
            .catch(next);
    });
};



/**
 * @swagger
 * /api/v0/login:
 *   post:
 *     tags:
 *     - users
 *     description: Login
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         type: string
 *         required: true
 *         description: Admin Token (token goes here)
 *       - name: body
 *         in: body
 *         type: object
 *         schema:
 *           properties:
 *             id:
 *               type: string
 *     responses:
 *       200:
 *         description: succesful login
 *         schema:
 *           properties:
 *             token:
 *               type: string
 *       400:
 *         description: invalid credentials
 */
exports.login = function (req, res, next) {
    // console.log("Login Request: ", req);
    const id = _.get(req.body, 'id');

    if (!id) {
        throw { id: 'This field is required.', status: 400 };
    }

    Users.login(dbUtils.getSession(req), id)
        .then(response => writeResponse(res, response))
        .catch(next);
};

/**
 * @swagger
 * /api/v0/users/me:
 *   get:
 *     tags:
 *     - users
 *     description: Get your user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         type: string
 *         required: true
 *         description: Token (token goes here)
 *     responses:
 *       200:
 *         description: the user
 *         schema:
 *           $ref: '#/definitions/User'
 *       401:
 *         description: invalid / missing authentication
 */
exports.me = function (req, res, next) {
    loginRequired(req, res, () => {
        const authHeader = req.headers['authorization'];
        const match = authHeader.match(/^Token (\S+)/);
        if (!match || !match[1]) {
            throw { message: 'invalid authorization format. Follow `Token <token>`', status: 401 };
        }

        const token = match[1];
        Users.me(dbUtils.getSession(req), token)
            .then(response => writeResponse(res, response))
            .catch(next);
    })
};


/**
 * @swagger
 * /api/v0/users/me/updateName:
 *   get:
 *     tags:
 *     - users
 *     description: Update your user name
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Authorization
 *         in: header
 *         type: string
 *         required: true
 *         description: Token (token goes here)
 *         schema:
 *           properties:
 *             id:
 *               type: string
 *             name:
*                type: string
 *     responses:
 *       200:
 *         description: the user
 *         schema:
 *           $ref: '#/definitions/User'
 *       401:
 *         description: invalid / missing authentication
 */

exports.updateName = function (req, res, next) {
    console.log("Update Name Request: ", req);
    loginRequired(req, res, () => {
        const authHeader = req.headers['authorization'];
        const match = authHeader.match(/^Token (\S+)/);
        if (!match || !match[1]) {
            throw { message: 'invalid authorization format. Follow `Token <token>`', status: 401 };
        }

        const token = match[1];
        Users.updateName(dbUtils.getSession(req), token, req.body.name)
            .then(response => writeResponse(res, response))
            .catch(next);
    })
}


exports.checkUser = function (req, res, next) {
    const id = _.get(req.query, 'id');
    if (!id) {
        throw { id: 'This field is required.', status: 400 };
    }
    Users.checkUser(dbUtils.getSession(req), id)
        .then(response => writeResponse(res, response))
        .catch(next);
};

