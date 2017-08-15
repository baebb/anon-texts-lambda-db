const AWS = require('aws-sdk');
const uuid = require('uuid/v1');

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
    id: uuid()
  };
  console.log(`NEW_CREATE_MESSAGE ${eventData.number} ${messageToAdd.id}`);
  const params = {
    TableName: 'ATsentMessages',
    Key: { number: Number(eventData.number) },
    UpdateExpression: 'set #messages = list_append(if_not_exists(#messages, :empty_list), :message)',
    ExpressionAttributeNames: { '#messages': 'messages' },
    ExpressionAttributeValues: {
      ':message': [messageToAdd],
      ':empty_list': []
    }
  };
  
  dynamoDB.update(params, (error, data) => {
    // handle potential errors
    if (error) {
      console.log(`PUT_ERROR: ${error.code} ${error.message}`);
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
    console.log(`MESSAGE_RECORDED ${eventData.number} ${messageToAdd.id}`);
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        number: eventData.number,
        id: messageToAdd.id,
        message: messageToAdd.message
      }),
    };
    callback(null, response);
  })
}