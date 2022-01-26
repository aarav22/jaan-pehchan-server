var writeError = require('../helpers/response').writeResponse;

module.exports = function adminRequired(req, res, next) {
    var authHeader = req.headers['admin-auth'];
    console.log("Here: ", req.headers);
    if (authHeader !== 'Token YWRtaW46YWRtaW4') {
        return writeError(res, { detail: 'no admin authorization provided' }, 401);
    }
    next();
};

