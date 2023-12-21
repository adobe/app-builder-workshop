/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import {getCommerceOauthClient} from "../oauth1a";
import axios from 'axios';

const { Core } = require('@adobe/aio-sdk')
const { errorResponse, checkMissingRequestInputs} = require('../utils')

export async function main(params) {
    const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });

    try {
        const requiredParams = ['COMMERCE_BASE_URL', 'RANDOMIZER_URL', 'RANDOMIZER_API_KEY', 'RANDOMIZER_FIRSTNAME', 'RANDOMIZER_LASTNAME', 'RANDOMIZER_COMPANY_NAME'];
        const requiredHeaders = [];
        const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders);

        if (errorMessage) {
            return errorResponse(400, errorMessage, logger);
        }

        const res = await axios.post(params.RANDOMIZER_URL, {
            "firstname": params.RANDOMIZER_FIRSTNAME,
            "lastname": params.RANDOMIZER_LASTNAME,
            "company_name": params.RANDOMIZER_COMPANY_NAME,
            "api_key": params.RANDOMIZER_API_KEY
        });

        const randomizedContent = await res.data;

        if (!randomizedContent?.random) {
            throw new Error("Random number not returned");
        }

        logger.info("Random number returned: %s", randomizedContent.random);

        const oauth = getCommerceOauthClient(
            {
                url: params.COMMERCE_BASE_URL,
                consumerKey: params.COMMERCE_CONSUMER_KEY,
                consumerSecret: params.COMMERCE_CONSUMER_SECRET,
                accessToken: params.COMMERCE_ACCESS_TOKEN,
                accessTokenSecret: params.COMMERCE_ACCESS_TOKEN_SECRET
            },
            logger
        )

        const attributeOptions = await oauth.get('products/attributes/random_numbers/options');

        logger.info("Got custom attribute options: %s", JSON.stringify(attributeOptions).toString());

        // Add random number to custom attributes if not already there
        const option = attributeOptions.find(o => o.label === randomizedContent.random.toString());

        if (!option) {
            await oauth.post('products/attributes/random_numbers/options', {
                option: {
                    "value": randomizedContent.random.toString(),
                    "label": randomizedContent.random.toString()
                }
            });
            logger.info("Random number added to custom attributes: %s", randomizedContent.random);
        }

        return {
            statusCode: 200,
            body: {
                "random": randomizedContent.random
            }
        }
    } catch (error) {
        logger.error("Cannot process catalog updated event: ", error);
        return errorResponse(500, error, logger);
    }
}
