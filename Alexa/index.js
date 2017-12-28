'use strict';

/**
 * Smart 3D Sensor For Alexa 
 * Ron Dagdag
 */

const USER_DEVICES = [
    // Definition of the device (write multiple if there are multiple)
    {
         // Details: https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-discovery
        // Device unique ID Must be unique on all devices
        endpointId:        '3DSensor-walabot-for-home',
        // Device name (used when calling from Alexa) Example: 'Lamp'
        friendlyName:      'Lamp',
        // Device details
        description:       'Lamp by Ron Dagdag',
        // company name, author
        manufacturerName:  'Ron Dagdag',
        // This property is described in the document as it is enough to return an empty array 2017 / August 29
        displayCategories: [],
        // not used at this time
        cookie: {},
        // Define the functionality of this device
        capabilities: [
            // {
            //     type:      'AlexaInterface',
            //     interface: 'Alexa.Speaker',
            //     version:   '1.0',
            //     properties:{
            //         'supported':[
            //             {
            //                 'name':'volume'
            //             },
            //             {
            //                 'name':'muted'
            //             }
            //         ]
            //     }
            // },
            {
                'type':       'AlexaInterface',
                'interface':  'Alexa.PowerController',
                'version':    '1.0'
            }
        ]
    }
];

/**
 * Utility functions
 */

function log(title, msg) {
    console.log(`[${title}] ${msg}`);
}

/**
 * Generate a unique message ID
 *
 * TODO: UUID v4 is recommended as a message ID in production.
 */
function generateMessageID() {
    return '38A28869-DD5E-48CE-BBE5-A4DB78CECB28'; // Dummy
}

/**
 * Generate a response message
 *
 * @param {array_object} properties
 * @param {Object} payload
 * @returns {Object}
 */
function generateResponse(properties, payload) {
    return {
        context: {
            properties: properties
        },
        event: {
            header: {
                messageId:      generateMessageID(),
                namespace:      'Alexa',
                name:           'Response',
                payloadVersion: '3'
            },
            payload: payload
        }
    };
}

/**
 * Mock functions to access device cloud.
 *
 * TODO: Pass a user access token and call cloud APIs in production.
 */

function getDevicesFromPartnerCloud() {
    /**
     * For the purposes of this sample code, we will return:
     * (1) Non-dimmable light bulb
     * (2) Dimmable light bulb
     */
    return USER_DEVICES;
}

function isValidToken() {
    /**
     * Always returns true for sample code.
     * You should update this method to your own access token validation.
     */
    return true;
}

function isDeviceOnline(endpointId) {
    log('DEBUG', `isDeviceOnline (endpointId: ${endpointId})`);

    /**
     * Always returns true for sample code.
     * You should update this method to your own validation.
     */
    return true;
}

function turnOn(endpointId) {
    log('DEBUG', `turnOn (endpointId: ${endpointId})`);

    // Call device cloud's API to turn on the device
    var properties = [{
      namespace:                "Alexa.PowerController",
      name:                     "powerState",
      value:                     "ON",
      timeOfSample:              "2017-02-03T16:20:50.52Z",
      uncertaintyInMilliseconds: 500
    }];
    return generateResponse(properties,{});
}

function turnOff(endpointId) {
    log('DEBUG', `turnOff (endpointId: ${endpointId})`);

    // Call device cloud's API to turn off the device
    var properties = [{
        namespace:                 "Alexa.PowerController",
        name:                      "powerState",
        value:                     "OFF",
        timeOfSample:              "2017-02-03T16:20:50.52Z",
        uncertaintyInMilliseconds: 500
    }];
    return generateResponse(properties,{});
}

/**
 * Main logic
 */

function handleDiscovery(request, callback) {
    log('DEBUG', `Discovery Request: ${JSON.stringify(request)}`);

    /**
     * Get the OAuth token from the request.
     */
    const userAccessToken = request.directive.payload.scope.token.trim();

    /**
     * Generic stub for validating the token against your cloud service.
     * Replace isValidToken() function with your own validation.
     */
    if (!userAccessToken || !isValidToken(userAccessToken)) {
        const errorMessage = `Discovery Request [${request.directive.header.messageId}] failed. Invalid access token: ${userAccessToken}`;
        log('ERROR', errorMessage);
        callback(new Error(errorMessage));
    }

    /**
     * Device discovery response for response v3
     *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-discovery
     */
    const response = {
        event: {
            header: {
                namespace:      'Alexa.Discovery',
                name:           'Discover.Response',
                payloadVersion: '3',
                messageId:      generateMessageID()
            },
            payload: {
                endpoints: getDevicesFromPartnerCloud(userAccessToken)
            }
        }
    };

    /**
     * Output log to CloudWatch
     */
    log('DEBUG', `Discovery Response: ${JSON.stringify(response)}`);

    /**
     * Output device information to Alexa
     */
    callback(null, response);
}

/**
 * A function to handle control events.
 * This is called when Alexa requests an action such as turning off an appliance.
 *
 * @param {Object} request - The full request object from the Alexa smart home service.
 * @param {function} callback - The callback object on which to succeed or fail the response.
 */
function handleControl(request, callback) {
    log('DEBUG', `Control Request: ${JSON.stringify(request)}`);

    /**
     * Acquire access token
     */
    const userAccessToken = request.directive.endpoint.scope.token.trim();

    /**
     * Generic stub for validating the token against your cloud service.
     * Replace isValidToken() function with your own validation.
     *
     * If the token is invliad, return InvalidAccessTokenError
     *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#invalidaccesstokenerror
     */
    if (!userAccessToken || !isValidToken(userAccessToken)) {
        log('ERROR', `Discovery Request [${request.directive.header.messageId}] failed. Invalid access token: ${userAccessToken}`);
        callback(null, generateResponse('InvalidAccessTokenError', {}));
        return;
    }

    /**
     * Grab the endpointId from the request.
     */
    const endpointId = request.directive.endpoint.endpointId;

    /**
     * If the endpointId is missing, return UnexpectedInformationReceivedError
     *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#unexpectedinformationreceivederror
     */
    if (!endpointId) {
        log('ERROR', 'No endpointId provided in request');
        const payload = { faultingParameter: `endpointId: ${endpointId}` };
        callback(null, generateResponse('UnexpectedInformationReceivedError', payload));
        return;
    }

    /**
     * Check if the device is online
     * This sample always returns online (True)
     */
    if (!isDeviceOnline(endpointId, userAccessToken)) {
        log('ERROR', `Device offline: ${endpointId}`);
        callback(null, generateResponse('TargetOfflineError', {}));
        return;
    }

    let response;

    switch (request.directive.header.name) {
        case 'TurnOn':
            response = turnOn(endpointId, userAccessToken);
            break;

        case 'TurnOff':
            response = turnOff(endpointId, userAccessToken);
            break;

/* v2 use, reference */

        case 'SetPercentageRequest': {
            const percentage = request.payload.percentageState.value;
            if (!percentage) {
                const payload = { faultingParameter: `percentageState: ${percentage}` };
                callback(null, generateResponse('UnexpectedInformationReceivedError', payload));
                return;
            }
            response = setPercentage(endpointId, userAccessToken, percentage);
            break;
        }


        default: {
            log('ERROR', `No supported directive name: ${request.directive.header.name}`);
            callback(null, generateResponse('UnsupportedOperationError', {}));
            return;
        }
    }

    log('DEBUG', `Control Confirmation: ${JSON.stringify(response)}`);

    callback(null, response);
}

/**
 * Main entry point.
 * Incoming events from Alexa service through Smart Home API are all handled by this function.
 *
 * It is recommended to validate the request and response with Alexa Smart Home Skill API Validation package.
 *  https://github.com/alexa/alexa-smarthome-validation
 */
exports.handler = (request, context, callback) => {
    switch (request.directive.header.namespace) {
        /**
         * The namespace of 'Alexa.ConnectedHome.Discovery' indicates a request is being made to the Lambda for
         * discovering all appliances associated with the customer's appliance cloud account.
         *
         * For more information on device discovery, please see
         *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#discovery-messages
         */
        case 'Alexa.Discovery':
            handleDiscovery(request, callback);
            break;

        /**
         * The namespace of "Alexa.ConnectedHome.Control" indicates a request is being made to control devices such as
         * a dimmable or non-dimmable bulb. The full list of Control events sent to your lambda are described below.
         *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#payload
         */
        case 'Alexa.PowerController':
            handleControl(request, callback);
            break;

        /**
         * The namespace of "Alexa.ConnectedHome.Query" indicates a request is being made to query devices about
         * information like temperature or lock state. The full list of Query events sent to your lambda are described below.
         *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#payload
         *
         * TODO: In this sample, query handling is not implemented. Implement it to retrieve temperature or lock state.
         */
        // case 'Alexa.ConnectedHome.Query':
        //     handleQuery(request, callback);
        //     break;

        /**
         * Received an unexpected message
         */
        default: {
            const errorMessage = `No supported namespace: ${request.directive.header.namespace}`;
            log('ERROR', errorMessage);
            callback(new Error(errorMessage));
        }
    }
};