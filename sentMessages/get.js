'use strict';

const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.get = (event, context, callback) => {
  console.log('event: ',event);
  const params = {
    TableName: 'sentMessages',
    Key: {
      number: Number(event.pathParameters.number),
    },
  };
  
  // fetch todo from the database
  dynamoDB.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t fetch the todo item.'));
      return;
    }
    
    console.log('result: ',result);

    // create a response
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result.Item),
    };
    callback(null, response);
  });
};
