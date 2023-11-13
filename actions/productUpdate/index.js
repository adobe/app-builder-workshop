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
        const requiredParams = ['COMMERCE_BASE_URL', 'OMS_URL', 'OMS_API_KEY'];
        const requiredHeaders = [];
        const errorMessage = checkMissingRequestInputs(params, requiredParams, requiredHeaders);

        if (errorMessage) {
            return errorResponse(400, errorMessage, logger);
        }

        const res = await axios.post(params.OMS_URL, {
            "sku": params.data.value.sku,
            "price": params.data.value.price,
            "api_key": params.OMS_API_KEY
        });

        const omsContent = await res.data;
        if (!omsContent?.stock) {
            throw new Error("Stock not returned");
        }

        logger.info("Stock returned by OMS api: %s", omsContent.stock);

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

        await oauth.put('products/' + params.data.value.sku + '/stockItems/1', {
            stockItem: {
                "qty": omsContent.stock
            }
        });
        logger.info("Product updated for the SKU %s. New qty is: %s", params.data.value.sku, omsContent.stock);

        return {
            statusCode: 200,
            body: {
                "sku": params.data.value.sku,
                "stock": omsContent.stock
            }
        }
    } catch (error) {
        logger.error("Cannot process catalog updated event: ", error);
        return errorResponse(500, error, logger);
    }
}
