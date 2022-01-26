// extracts just the data from the query results

const _ = require('lodash');
const md5 = require('md5');

module.exports = function (_node) {
    _.extend(this, {
        'id': _node.properties['id'],
        'phoneNumber': _node.properties['phoneNumber'],
        'name': _node.properties['name'],
        'avatar': {
            'full_size': `https://ui-avatars.com/api/?name=${_node.properties['name']}&background=random&rounded=true`
        },
        'isSeller': _node.properties['isSeller'],
        'company_address': _node.properties['company_address'],
        'company_name': _node.properties['company_name'],
        'company_email': _node.properties['company_email'],
        'company_gst': _node.properties['company_gst'],
        'company_type': _node.properties['company_type'],
    });
};

