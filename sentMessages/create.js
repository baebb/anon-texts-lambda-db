const AWS = require('aws-sdk');
const uuid = require('uuid/v1');

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
    TableName: 'sentMessages',
    Key: { number: Number(eventData.number) },
    UpdateExpression: 'set #messages = list_append(if_not_exists(#messages, :empty_list), :message)',
    ExpressionAttributeNames: { '#messages': 'messages' },
    ExpressionAttributeValues: {
      ':message': [ messageToAdd ],
      ':empty_list': []
    }
  };
  
  dynamoDB.update(params, (error, data) => {
    // handle potential errors
    if (error) {
      console.log(`PUT_ERROR: ${error.code} ${error.message}`);
    } else {
      console.log(`MESSAGE_RECORDED ${eventData.number} ${messageToAdd.id}`);
    }
  })
}