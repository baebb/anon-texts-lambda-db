const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {
  // console.log('event: ',event);
  // convert stuff to json if needed
  let eventData;
  try {
    eventData = JSON.parse(event.body);
  } catch (e) {
    eventData = event.body;
  }
  
  addNumberMessage(eventData, callback)
};

function addNumberMessage(eventData, callback) {
  const messageToAdd = {
    sentMsg: eventData.message,
    timestamp: Date.now(),
    id: eventData.id
  };
  console.log(`NEW_CREATE_MESSAGE ${eventData.number} ${eventData.id}`);
  const params = {
    TableName: 'ATsentMessages',
    Key: { number: Number(eventData.number) },
    UpdateExpression: 'set #messages = list_append(if_not_exists(#messages, :empty_list), :message), #country = :country',
    ExpressionAttributeNames: {
      '#messages': 'messages',
      '#country': 'country',
    },
    ExpressionAttributeValues: {
      ':message': [messageToAdd],
      ':country': eventData.countryCode,
      ':empty_list': []
    }
  };
  
  dynamoDB.update(params, (error, data) => {
    // handle potential errors
    if (error) {
      console.log(`PUT_ERROR: ${eventData.id} ${error.code} ${error.message}`);
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
      return callback(null, errResponse)
    }
    // respond that it worked
    console.log(`MESSAGE_RECORDED ${eventData.number} ${eventData.id}`);
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        number: eventData.number,
        id: messageToAdd.id,
        message: messageToAdd.message,
        country: eventData.countryCode
      }),
    };
    callback(null, response);
  })
}