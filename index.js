const AmoCRM = require( 'amocrm-js' );
var AWS = require("aws-sdk");
require('dotenv').config();

AWS.config.update({region: 'eu-central-1'});

var dynamoDb = new AWS.DynamoDB.DocumentClient();

//Get array with objects from database
const getDataDynamoDB = new Promise((resolve, reject) => {
    dynamoDb.scan({TableName: process.env.TableName}).promise()
    .then(data => resolve(data.Items));
});

const crm = new AmoCRM({
    domain: process.env.domain, 
    auth: {
        login: process.env.auth_login,
        hash: process.env.auth_hash
    }
});

const addCRM = async (data) => {
    //Search TxAssetID in CRM 
    await console.log(data.TxAssetID, ": CRM search");

    let queryRes1 = await crm.Lead.find({query: data.TxAssetID});
    let queryRes2 = await crm.Lead.find({query: data.TxAssetID});
    
    if ( queryRes1.length == 0 && queryRes2.length == 0 ){
        await console.log(data.TxAssetID, ": Add to the CRM");
        //add contact
        await crm.Contact.insert([{
            name: data.customName,
            responsible_user_id: "3316417",
            tags: "купить майнер",
            custom_fields: [
                { 
                    id: "543953",
                    name: 'Телефон',
                    code: 'PHONE',
                    values: [{
                        value: data.phone,
                        enum: 907777
                    }],
                    is_system: true 
                },
                { 
                    id: "543955",
                    name: 'Email',
                    code: 'EMAIL',
                    values: [{
                        value: data.email,
                        enum: 907789
                    }],
                    is_system: true 
                }
            ]
        }])
        .then(result => {
            //add lead
            crm.Lead.insert([{
                name: 'Покупка майнеров с client`а',
                status_id: "29857402",
                responsible_user_id: "55014691",
                sale: 115,
                tags: "buy_miner",
                contacts_id: [
                    result._response._embedded.items[0].id 
                ],
                custom_fields: [
                    {
                        id: 657873,
                        name: "Адрес доставки",
                        values: [{ 
                            value: data.postCode + ', ' + data.country + ', ' + data.countryState + ', ' + data.city + ', ' + data.address, 
                        }],
                        is_system: false 
                    },
                    {
                        id: 664225,
                        name: "TxAssetID",
                        values: [{ 
                            value: data.TxAssetID
                        }],
                        is_system: false
                    },
                    {
                        id: 664227,
                        name: "countMiners",
                        values: [{ 
                            value: data.countMiners
                        }],
                        is_system: false
                    },
                    {
                        id: 664381,
                        name: "referal",
                        values: [{ 
                            value: data.referal
                        }],
                        is_system: false
                    },
                ]
            }])
            .catch(error => console.error('Error with add lead: ', error));;
        })
        .catch(error => console.error('Error with add contact: ', error));
    }else{
        console.log(data.TxAssetID, ': is in the CRM');
    }
}

exports.handler = (event, context, callback) => {
        getDataDynamoDB.then(result => {   
            result.map(data => addCRM(data));
        }); 
}