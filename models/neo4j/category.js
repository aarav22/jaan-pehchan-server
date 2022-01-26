// extracts just the data from the query results

const _ = require('lodash');

module.exports = function (_node) {
    _.extend(this, {
        'category_id': _node.properties['category_id'],
        'category_name': _node.properties['category_name'],
        'category_image': _node.properties['category_image'],
    });
};

