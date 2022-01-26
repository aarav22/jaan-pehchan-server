"use strict"

const randomstring = require("randomstring");
const _ = require('lodash');
const User = require('../models/neo4j/user');

const register = function (session, name, phoneNumber, id) {
    try {
        return session.writeTransaction(txc =>
            txc.run(`
        MERGE (user:User {phoneNumber: $phoneNumber})
        ON MATCH
            SET 
            user.name = $name,
            user.id = $id,
            user.api_key = $api_key
        ON CREATE 
            SET
            user.name = $name,
            user.id = $id,
            user.api_key = $api_key
        RETURN user`,
                {
                    phoneNumber,
                    name,
                    id,
                    api_key: randomstring.generate({
                        length: 20,
                        charset: 'hex'
                    })
                }))
            .then(results => {
                console.log("ADSADA:", results.records);
                if (!_.isEmpty(results.records)) {
                    return new User(results.records[0].get('user'));
                } else {
                    throw { registration: 'error in registering the user', status: 400 };
                }
            });
    } catch (err) {
        console.log(err);
        throw { registration: 'error in registration process', status: 400 };
    }
};

/* 
* Create a realationsip (DIRECT_FRIEND) between users with phone_number in phone_numbers and a user 
* with api_key, if a user with phonemb_number is not already registered, register it
* Make another relationship between the user with api_key and the users who have 
* a DIRECT_FRIEND relationship with the user with phone_number, call this relationship SECONDARY_FRIEND
* and finally, make a relationship between the user with api_key and the DIRECT_FRIEND of people 
* who are SECONDARY_FRIEND of the user with api_key and call the realtionship TERTIARY_FRIEND
* and return the user with api_key
*/

/*
* Note:
* If a DIRECT_FRIEND relationship already exists then do not create SECONDARY_FRIEND or TERTIARY_FRIEND relationship
* If a TERTIARY_FRIEND relationship already exists and SECONDARY_FRIEND relationship is given precedence and 
* DIRECT_FRIEND over SECONDARY_FRIEND and TERTIARY_FRIEND.
*/
const registerContacts = function (session, api_key, phone_numbers) {
    try {
        return session.writeTransaction(txc =>
            txc.run(`
            UNWIND $phone_numbers AS phoneNumber
            MATCH (user:User {api_key: $api_key})
            WHERE NOT user.phoneNumber = phoneNumber
            MERGE(contact: User { phoneNumber: phoneNumber })
            MERGE (user)-[:DIRECT_FRIEND]->(contact)
            WITH user, contact
            MATCH (user)-[sf:SECONDARY_FRIEND]->(contact)
            DELETE sf
            WITH user, contact
            MATCH (user)-[tf:TERTIARY_FRIEND]->(contact)
            DELETE tf
            WITH user, contact
            
            MATCH (contact)-[:DIRECT_FRIEND]->(secondary_contact:User)
            WHERE NOT(user)-[:DIRECT_FRIEND]->(secondary_contact) 
            MERGE (user)-[:SECONDARY_FRIEND]->(secondary_contact)
            WITH user, secondary_contact
            MATCH (user)-[ttf:TERTIARY_FRIEND]->(secondary_contact)
            DELETE ttf
            
            WITH user, secondary_contact
            MATCH (secondary_contact)-[:DIRECT_FRIEND]->(tertiary_contact:User)
            WHERE NOT(user)-[:DIRECT_FRIEND]->(tertiary_contact) 
            OR NOT(user)-[:SECONDARY_FRIEND]->(tertiary_contact)
            MERGE (user)-[:TERTIARY_FRIEND]->(tertiary_contact)
            RETURN user`,
                {
                    api_key,
                    phone_numbers
                }
            )).then(results => {
                console.log("Results from registering the contact:", results.records);
                if (!_.isEmpty(results.records)) {
                    return new User(results.records[0].get('user'));
                } else {
                }
            });
    } catch (err) {
        console.log(err);
        throw { registration: 'error in registration process', status: 400 };
    }
};

const me = function (session, apiKey) {
    return session.readTransaction(txc => txc.run('MATCH (user:User {api_key: $api_key}) RETURN user', { api_key: apiKey }))
        .then(results => {
            console.log(apiKey)
            if (_.isEmpty(results.records)) {
                throw { message: 'invalid authorization key', status: 401 };
            }
            return new User(results.records[0].get('user'));
        });
};

const login = function (session, id) {
    return session.readTransaction(txc => txc.run('MATCH (user:User {id: $id}) RETURN user', { id }))
        .then(results => {
            if (_.isEmpty(results.records)) {
                throw { id: 'id does not exist', status: 400 }
            }
            else {
                return new User(results.records[0].get('user'));
            }
        }
        );
};

const updateName = function (session, api_key, name) {
    return session.writeTransaction(txc => txc.run('MATCH (user:User {api_key: $api_key}) SET user.name = $name RETURN user', { api_key, name }))
        .then(results => {
            if (_.isEmpty(results.records)) {
                throw { api_key: 'api_key does not exist', status: 400 }
            }
            else {
                return new User(results.records[0].get('user'));
            }
        });
};

const checkUser = function (session, id) {
    return session.readTransaction(txc => txc.run('MATCH (user:User {id: $id}) where user.api_key IS NOT NULL RETURN user', { id }))
        .then(results => {
            if (_.isEmpty(results.records)) {
                return false;
            }
            else {
                return true;
            }
        }).catch(error => {
            console.log(error);
            return false;
        });
};


module.exports = {
    register,
    me,
    login,
    updateName,
    registerContacts,
    checkUser
};
