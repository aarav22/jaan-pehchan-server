// extracts just the data from the query results

const _ = require('lodash');

module.exports = function (_node) {
    const _product_node = _node.get('product');
    const _seller_node = _node.get('seller');
    _.extend(this, {
        'product_id': _product_node.properties['product_id'],
        'category_id': _product_node.properties['category_id'],
        'product_name': _product_node.properties['product_name'],
        'picture': _product_node.properties['picture'],
        'description': _product_node.properties['description'],
        'price': _product_node.properties['price'],
        'seller_details': {
            'seller_id': _seller_node.properties['id'],
            'name': _seller_node.properties['name'],
            'company_name': _seller_node.properties['company_name'],
            'email': _seller_node.properties['email'],
            'company_address': _seller_node.properties['company_address'],
            'phoneNumber': _seller_node.properties['phoneNumber'],
        }
    });
};

