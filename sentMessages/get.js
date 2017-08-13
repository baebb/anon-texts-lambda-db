const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
  // console.log('event: ',event);
  // convert stuff to json if needed
  let eventData;
  try {
    eventData = JSON.parse(event);
  } catch (e) {
    eventData = event;
  }
  
  getNumberMessages(eventData, callback)
};

function getNumberMessages(eventData, callback) {
  console.log(`NEW_SENT_MESSAGES_LOOKUP ${eventData.pathParameters.number}`);
  const params = {
    TableName: 'sentMessages',
    Key: {
      number: Number(eventData.pathParameters.number),
    },
  };
  
  dynamoDB.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.log(`SENT_MESSAGES_LOOKUP_ERROR: ${error.code} ${error.message}`);
      const errResponse = {
        statusCode: 500,
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
    // create a response
    else {
      console.log(`SENT_MESSAGES_LOOKUP_SUCCESS ${eventData.pathParameters.number}`);
      const response = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(result.Item),
      };
      callback(null, response);
    }
  });
}
