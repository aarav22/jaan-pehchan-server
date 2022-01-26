// extracts just the data from the query results

const _ = require('lodash');

module.exports = function (_node) {
    _.extend(this, {
        'id': _node.properties['id'],
        'requirement_id': _node.properties['requirement_id'],
        'category_id': _node.properties['category_id'],
        'requirement_name': _node.properties['requirement_name'],
        'description': _node.properties['description'],
        'price': _node.properties['price'],
        'user_name': _node.properties['user_name'],
    });
};

