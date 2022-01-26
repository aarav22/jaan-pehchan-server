const _ = require('lodash');
const User = require('../models/neo4j/user');
const Seller = require('../models/neo4j/seller');
const Product = require('../models/neo4j/product');
const neo4j = require('neo4j-driver');


const registerSeller = (session, sellerData) => {
    const {
        id,
        company_type,
        company_name,
        company_address,
        company_email,
        company_gst
    } = sellerData;

    return session.writeTransaction(txc => txc.run(`
    MERGE(user: User { id: $id })
    ON MATCH
            SET 
            user.isSeller = $isSeller,
            user.company_type = $company_type,
            user.company_name = $company_name,
            user.company_address = $company_address,
            user.company_email = $company_email,
            user.company_gst = $company_gst
    RETURN user
    `, {
        id,
        isSeller: true,
        company_type,
        company_name,
        company_address,
        company_email,
        company_gst
    }
    ))
        .then(results => {
            if (_.isEmpty(results.records)) {
                throw { registration: 'error in registering the seller', status: 400 };
            }
            else {
                console.log(results.records);
                return new User(results.records[0].get('user'));
            }
        }
        );
}

// get all relationships between the user and the seller:
const getAllRelationships = (session, id, seller_id) => {
    // all the relationships between the user and the seller where the type of relationships
    // are only direct_friend between everyone
    return session.readTransaction(txc => txc.run(`
    MATCH
        (user:User {id: $id} ),
        (seller:User {id: $seller_id}),
    p = allShortestPaths((user)-[*1..3]->(seller))
    WHERE all(r IN relationships(p) WHERE type(r) = 'DIRECT_FRIEND')
    RETURN p, user, seller
    `, {
        id,
        seller_id
    }
    )).then(results => {
        if (id === seller_id) {
            return []
        }
        if (_.isEmpty(results.records)) {
            console.log(results);
            return [];
        }
        else {
            const relationships = [];
            results.records.map(record => {
                const segments = record.get('p').segments;
                const relationship = {};
                const users = [];
                // console.log(segments);
                users.push(new Seller(results.records[0].get('user')));
                if (segments && segments.length > 0) {
                    segments.map(segment => {
                        users.push(new Seller(segment.end));
                    })
                }
                relationship.users = users;
                relationship.numDegrees = users.length;
                relationships.push(relationship);
            });
            return relationships;
        }
    }).catch(err => {
        if (id === seller_id) {
            return [];
        }
        console.log(err);
        throw { relationship: `error in getting the relationships: ${err}`, status: 400 };
    }
    );
}
const getSellerInfo = (session, id) => {
    console.log("id:", id)
    return session.readTransaction(txc => txc.run(`
    MATCH (user:User {id: $id})
    RETURN user
    `, {
        id
    }
    )).then(results => {
        if (_.isEmpty(results.records)) {
            throw { seller: 'No seller found', status: 400 };
        }
        else {
            return new Seller(results.records[0].get('user'));
        }
    }).catch(err => {
        console.log(err);
        throw { seller: `error in getting the seller: ${err}`, status: 400 };
    });
}

const getSellerListings = (session, id, page, size) => {
    const offset = page * size;
    return session.readTransaction(txc => txc.run(`
    MATCH (user:User {id: $id})-[:SELLER]->(product:Product)
    RETURN product SKIP $offset LIMIT $size
    `, {
        id,
        offset: neo4j.int(offset),
        size: neo4j.int(size)
    }
    )).then(results => {
        if (_.isEmpty(results.records)) {
            throw { seller: 'error in getting the seller', status: 400 };
        }
        else {
            const listings = [];
            console.log(results.records);
            results.records.map(record => {
                listings.push(new Product(record.get('product')));
            });
            return listings;
        }
    }).catch(err => {
        console.log(err);
        throw { seller: `error in getting the seller: ${err}`, status: 400 };
    });
}

const orderSuccess = (session, order_id, payment_id, seller_id, signature, amount) => {
    return session.writeTransaction(txc => txc.run(`
    MATCH (user:User {id: $seller_id})
    CREATE (user)-[:REGISTRATION_PAYMENT]->(payment:Payment {id: $payment_id, order_id: $order_id, signature: $signature, amount: $amount})
    set user.seller_payment_status = 'PAID'
    RETURN user
    `, {
        order_id,
        payment_id,
        seller_id,
        signature,
        amount
    }
    )).then(results => {
        if (_.isEmpty(results.records)) {
            throw { order: 'error in order success', status: 400 };
        }
        else {
            return new User(results.records[0].get('user'));
        }
    }).catch(err => {
        console.log(err);
        throw { order: `error in order success: ${err}`, status: 400 };
    });
}


module.exports = {
    registerSeller,
    getAllRelationships,
    getSellerInfo,
    getSellerListings,
    orderSuccess

}
