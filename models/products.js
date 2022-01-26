const _ = require('lodash');
const Product = require('../models/neo4j/product');
const DetailedProduct = require('../models/neo4j/detailedProduct');
const Category = require('../models/neo4j/category');
const Requirement = require('../models/neo4j/requirement');

const neo4j = require('neo4j-driver');

const randomstring = require("randomstring");



const getRecommnededProducts = (session, id) => {
    return session.readTransaction(txc => txc.run(`
    MATCH(user: User { id: $id }) - [r: DIRECT_FRIEND * 0..3] -> (seller: User) - [s: SELLER] - (product: Product)
    where seller <> user
    RETURN  product, count(r) AS n
    ORDER BY n DESC LIMIT 5`,
        {
            id
        }))
        .then(results => {
            if (_.isEmpty(results.records)) {
                throw { message: 'no results', status: 400 }
            }
            else {
                const products = [];
                console.log(results.records);
                results.records.map(record => {
                    products.push(new Product(record.get('product')));
                }
                )
                return products;
            }
        }
        ).catch(err => {
            console.log(err);
            throw err;
        });
}

// create a new product and add a relationship SELLER to the user
const postProduct = (session, id, category_id, product_name, price, description, picture, seller_name) => {
    return session.writeTransaction(txc => txc.run(
        `CREATE (product:Product 
            {id: $id, category_id: $category_id, product_id: $product_id, product_name: $product_name, 
                price: $price, description: $description, picture: $picture, seller_name: $seller_name}) 
            MERGE (seller: User { id: $id })
            MERGE (category: Category { category_id: $category_id })
            MERGE (seller)-[:SELLER]->(product)
            MERGE (product)-[:IN_CATEGORY]->(category)
        RETURN product`, {
        id,
        product_id: randomstring.generate({
            length: 20,
            charset: 'hex'
        }),
        category_id,
        product_name,
        price,
        description,
        picture,
        seller_name
    }))
        .then(results => {
            if (_.isEmpty(results.records)) {
                throw { message: 'no results', status: 400 }
            }
            else {
                // console.log(results.records);
                return new Product(results.records[0].get('product'));
            }
        }).catch(err => {
            console.log(err);
            throw err;
        });
}
const modifyProduct = (session, id, product_id, product_name, price, description, picture, category_id) => {
    return session.writeTransaction(txc => txc.run(
        `MATCH (product:Product {product_id: $product_id}) WHERE product.id = $id
        SET product.product_name = $product_name, product.price = $price,
         product.description = $description, product.picture = $picture, product.category_id = $category_id
        RETURN product`, {
        product_id,
        id,
        product_name,
        category_id,
        price,
        description,
        picture
    }))
        .then(results => {
            if (_.isEmpty(results.records)) {
                throw { message: 'no results', status: 400 }
            }
            else {
                // console.log(results.records);
                return new Product(results.records[0].get('product'));
            }
        }).catch(err => {
            console.log(err);
            throw err;
        });
}

const postRequirements = (session, id, category_id, product_name, price, description, seller_name) => {
    return session.writeTransaction(txc => txc.run(
        `CREATE (product:Requirement 
            {id: $id, category_id: $category_id, requirement_id: $requirement_id, requirement_name: $product_name,
                price: $price, description: $description, user_name: $seller_name})
            MERGE (seller: User { id: $id })
            MERGE (category: Category { category_id: $category_id })
            MERGE (seller)-[:POSTED_REQUIREMENT]->(product)
            MERGE (product)-[:REQUIREMENT_IN_CATEGORY]->(category)
            return product`, {
        id,
        requirement_id: randomstring.generate({
            length: 20,
            charset: 'hex'
        }),
        category_id,
        product_name,
        price,
        description,
        seller_name
    }))
        .then(results => {
            if (_.isEmpty(results.records)) {
                throw { message: 'no results', status: 400 }
            }
            else {
                // console.log(results.records);
                return [];
            }
        }).catch(err => {
            console.log(err);
            throw err;
        });
}

const saveProduct = (session, id, product_id) => {
    return session.writeTransaction(txc => txc.run(
        `MERGE (product:Product {id: $product_id})
        MERGE (seller: User { id: $id })
        MERGE (seller)-[:SAVED]->(product)
        RETURN product`, {
        id,
        product_id
    }))
        .then(results => {
            if (_.isEmpty(results.records)) {
                throw { message: 'no results', status: 400 }
            }
            else {
                // console.log(results.records);
                return [];
            }
        }).catch(err => {
            console.log(err);
            throw err;
        });
}


const getSavedProducts = (session, id) => {
    return session.readTransaction(txc => txc.run(
        `MATCH (seller:User { id: $id })
        MATCH (product:Product)
        WHERE (seller)-[:SAVED]->(product)
        RETURN product`, {
        id
    }))
        .then(results => {
            if (_.isEmpty(results.records)) {
                return [];
            }
            else {
                // console.log(results.records);
                const products = [];
                // console.log(results.records);
                results.records.map(record => {
                    products.push(new Requirement(record.get('product')));
                }
                )
                return products;
            }
        }).catch(err => {
            console.log(err);
            throw err;
        });
}









const getProduct = (session, product_id) => {
    console.log(product_id);
    return session.readTransaction(txc => txc.run(
        `MATCH (product:Product {product_id: $product_id}) RETURN product`, {
        product_id
    }))
        .then(results => {
            if (_.isEmpty(results.records)) {
                throw { message: 'no results', status: 400 }
            }
            else {
                // console.log(results.records);
                return new Product(results.records[0].get('product'));
            }
        }).catch(err => {
            console.log(err);
            throw err;
        });
}

// get product details along with seller details (basically user)
const getDetailedProduct = (session, id, product_id) => {
    return session.readTransaction(txc => txc.run(
        `MATCH (seller:User {id: $id})-[:SELLER]->(product:Product {product_id: $product_id})
        RETURN seller, product`, { id, product_id }
    ))
        .then(results => {
            if (_.isEmpty(results.records)) {
                throw { message: 'no results', status: 400 }
            }
            else {
                console.log(results.records);
                return new DetailedProduct(results.records[0]);
            }
        }).catch(err => {
            console.log(err);
            throw err;
        });
}

// get products by category along with pagination:
const getProductsByCategory = (session, category_id, page, size) => {
    const offset = page * size;
    console.log(offset, size)
    return session.readTransaction(txc => txc.run(
        `MATCH (product:Product)-[:IN_CATEGORY]->(category:Category {category_id: $category_id})
        RETURN product SKIP $offset LIMIT $size`, { category_id, offset: neo4j.int(offset), size: neo4j.int(size) }
    ))
        .then(results => {
            if (_.isEmpty(results.records)) {
                return [];
            }
            else {
                console.log(results.records);
                const products = [];
                results.records.map(record => {
                    products.push(new Product(record.get('product')));
                });
                return products;
            }
        }).catch(err => {
            console.log(err);
            throw err;
        });
}

const postCategory = (session, category_name, category_image) => {
    return session.writeTransaction(txc => txc.run(
        `CREATE (category:Category {category_id: $category_id, category_name: $category_name, category_image: $category_image})
        RETURN category`, {
        category_id: randomstring.generate({
            length: 20,
            charset: 'hex'
        }),
        category_name,
        category_image
    }))
        .then(results => {
            if (_.isEmpty(results.records)) {
                throw { message: 'category post failed', status: 400 }
            }
            else {
                // console.log(results.records);
                return new Category(results.records[0].get('category'));
            }
        }).catch(err => {
            console.log(err);
            throw err;
        });
}

const postCategories = (session, categories) => {
    return session.writeTransaction(txc => txc.run(
        `UNWIND $categories AS category_data
        CREATE (category:Category {category_id: category_data.category_id, category_name: category_data.category_name, category_image: category_data.category_image})
        RETURN category`, {
        categories: categories
    }))
        .then(results => {
            if (_.isEmpty(results.records)) {
                throw { message: 'no results', status: 400 }
            }
            else {
                // console.log(results.records);
                return new Category(results.records[0].get('category'));
            }
        }).catch(err => {
            console.log(err);
            throw err;
        });
}

const getCategories = (session) => {
    return session.readTransaction(txc => txc.run(
        `MATCH (category:Category) RETURN category`
    ))
        .then(results => {
            if (_.isEmpty(results.records)) {
                throw { message: 'no results', status: 400 }
            }
            else {
                // console.log(results.records);
                const categories = [];
                results.records.map(record => {
                    categories.push(new Category(record.get('category')));
                });
                return categories;
            }
        }).catch(err => {
            console.log(err);
            throw err;
        });
}

const searchProducts = (session, search_term) => {
    return session.readTransaction(txc => txc.run(
        `match (u:Product) where u.product_name starts with $search_term
        return u as product, u.product_name as product_name order by product_name limit 5
        UNION
        CALL db.index.fulltext.queryNodes('product_name', $search_term+'~') YIELD node, score with node as product, score
        return   
        product as product, product.product_name as product_name order by score desc limit 5`, {
        search_term
    }))
        .then(results => {
            if (_.isEmpty(results.records)) {
                return [];
            }
            else {
                console.log(results.records);
                // get product_id, product_name and picture of the product and return it as an object
                const products = [];
                results.records.map(record => {
                    products.push({
                        product_name: record.get('product_name'),
                        product: record.get('product'),
                    });
                });
                // const products = [];
                // results.records.map(record => {
                //     products.push(new Product(record.get('product')));
                // });
                return products;
            }
        }).catch(err => {
            console.error(err);
            throw err;
        });
}





module.exports = {
    getRecommnededProducts,
    postProduct,
    getProduct,
    getDetailedProduct,
    getProductsByCategory,
    postCategory,
    postCategories,
    getCategories,
    postRequirements,
    saveProduct,
    getSavedProducts,
    modifyProduct,
    searchProducts
}
