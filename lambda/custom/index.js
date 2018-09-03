/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const axios = require("axios");
const windchillUrl = 'http://pp-1801221411iw.portal.ptc.io/Windchill'
const options = { 
  headers: { 'Cache-Control': 'no-cache', Authorization: 'Basic d2NhZG1pbjpwdGM=' } 
 };
const restBaseURI = 'http://pp-1801221411iw.portal.ptc.io/Windchill/servlet/rest/action'

const validateWindchillConnection = async () => {
  try {
    const response = await axios.get(windchillUrl, options);
    const data = response.data;
    if(data) {
      return 'Welcome to windchill';
    }
  } catch (error) {
    return 'Sorry, cannot connect to windchill at this moment';
  }
  return ;
} 

const getTasksCount = async () => {
  try {
    let taskURL = restBaseURI + '/userTask';
    const response = await axios.get(taskURL, options);
    const data = response.data;
    if(data) {
      return data.WTTaskCount;
    }
  } catch (error) {
    return 'Sorry, cannot connect to windchill at this moment';
  }
  return ;

}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    let message = await validateWindchillConnection();
    return handlerInput.responseBuilder
      .speak(message)
      .reprompt(message)
      .getResponse();
  },
};


const ListTasksIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ListTasksIntent';
  },
  async handle(handlerInput) {
    const taskCount = await getTasksCount();
    const speechText = `There are total ${taskCount} task(s) for you available, would you like me to list them down?`;
    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
}

const SearchPartIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'SearchPartIntent';
  },
  handle(handlerInput) {
    const speechText = 'Which part would you like to search?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const InProgressCheckStatusHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'CheckStatusIntent' &&
      request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  },
};

const CheckStatusIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'CheckStatusIntent' 
  },
  async handle(handlerInput) {
    let speechText = await validateWindchillConnection();
    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};


const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};



const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    SearchPartIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    InProgressCheckStatusHandler,
    CheckStatusIntentHandler,
    ListTasksIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
