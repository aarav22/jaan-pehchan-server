// extracts just the data from the query results

const _ = require('lodash');
const md5 = require('md5');

const User = module.exports = function (_node) {
    const phoneNumber = _node.properties['phoneNumber'];

    _.extend(this, {
        'id': _node.properties['id'],
        'phoneNumber': phoneNumber,
        'name': _node.properties['name'],
        'avatar': {
            'full_size': `https://ui-avatars.com/api/?name=${_node.properties['name']}&background=random&rounded=true`
        },
        'api_key': _node.properties['api_key'],
        'company_address': _node.properties['company_address'],
        'company_name': _node.properties['company_name'],
        'company_email': _node.properties['company_email'],
        'company_gst': _node.properties['company_gst'],
        'company_type': _node.properties['company_type'],
        'isSeller': _node.properties['isSeller'],
        'seller_payment_status': _node.properties['seller_payment_status'] ? _node.properties['seller_payment_status'] : '',
    });
};

