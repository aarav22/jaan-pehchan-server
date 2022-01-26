// extracts just the data from the query results

const _ = require('lodash');

module.exports = function (_node) {
    _.extend(this, {
        'id': _node.properties['id'],
        'product_id': _node.properties['product_id'],
        'category_id': _node.properties['category_id'],
        'product_name': _node.properties['product_name'],
        'picture': _node.properties['picture'],
        'description': _node.properties['description'],
        'price': _node.properties['price'],
        'seller_name': _node.properties['seller_name'],
    });
};

