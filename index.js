const AmoCRM = require( 'amocrm-js' );
var AWS = require("aws-sdk");

AWS.config.update({region: 'eu-central-1'});

const crm = new AmoCRM({
    domain: process.env.domain, 
    auth: {
        login: process.env.auth_login,
        hash: process.env.auth_hash
    }
});

exports.handler = (event, context, callback) => {
    
    event.Records.forEach((record) => {
        
        if(record.dynamodb.NewImage == undefined){
            console.log("Remove Lead");
        }else{
            
        console.log("Start Insert");
        crm.Contact.insert([{
                name: record.dynamodb.NewImage.customName.S,
                responsible_user_id: "3316417",
                tags: "купить майнер",
                custom_fields: [
                    { 
                        id: "543953",
                        name: 'Телефон',
                        code: 'PHONE',
                        values: [{
                            value: record.dynamodb.NewImage.phone.S,
                            enum: 907777
                        }],
                        is_system: true 
                    },
                    { 
                        id: "543955",
                        name: 'Email',
                        code: 'EMAIL',
                        values: [{
                            value: record.dynamodb.NewImage.email.S,
                            enum: 907789
                        }],
                        is_system: true 
                    }
                ]
            }])
            .then(contact => {
                console.log("Contanct ID", contact._response._embedded.items[0].id );
                console.log(record.dynamodb.NewImage.TxAssetID.S, ": Add to Lead");
                crm.Lead.insert([{
                    name: 'Покупка майнеров с client`а',
                    status_id: "29857402",
                    responsible_user_id: "55014691",
                    sale: 115,
                    tags: "buy_miner",
                    contacts_id: [
                        contact._response._embedded.items[0].id 
                    ],
                    custom_fields: [
                        {
                            id: 657873,
                            name: "Адрес доставки",
                            values: [{ 
                                value: record.dynamodb.NewImage.postCode.S + ', ' + record.dynamodb.NewImage.country.S + ', ' + record.dynamodb.NewImage.countryState.S + ', ' + record.dynamodb.NewImage.city.S + ', ' + record.dynamodb.NewImage.address.S, 
                            }],
                            is_system: false 
                        },
                        {
                            id: 664225,
                            name: "TxAssetID",
                            values: [{ 
                                value: record.dynamodb.NewImage.TxAssetID.S
                            }],
                            is_system: false
                        },
                        {
                            id: 664227,
                            name: "countMiners",
                            values: [{ 
                                value: record.dynamodb.NewImage.countMiners.N
                            }],
                            is_system: false
                        },
                        {
                            id: 664381,
                            name: "referal",
                            values: [{ 
                                value: record.dynamodb.NewImage.referal.S
                            }],
                            is_system: false
                        },
                    ]
                }]);
            });
        console.log("Stop Insert");
        
        }

    });

}