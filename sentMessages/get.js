'use strict';

const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.get = (event, context, callback) => {
  // console.log('event: ',event);
  const params = {
    TableName: 'sentMessages',
    Key: {
      number: Number(event.pathParameters.number),
    },
  };
  
  dynamoDB.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.log(`error: ${error.code}`);
      console.log(`message: ${error.message}`);
      const errResponse = {
        statusCode: error.statusCode,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: error.code,
          message: error.message
        }),
      };
      return callback(null, errResponse);
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
