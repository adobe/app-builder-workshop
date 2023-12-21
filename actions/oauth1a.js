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
import Oauth1a from 'oauth-1.0a';
import crypto from 'node:crypto';
import axios from 'axios';

function getOauthClient(options, logger) {
    const instance = {}

    // Remove trailing slash if any
    const serverUrl = options.url
    const apiVersion = options.version
    const oauth = new Oauth1a({
        consumer: {
            key: options.consumerKey,
            secret: options.consumerSecret
        },
        signature_method: 'HMAC-SHA256',
        hash_function: hashFunctionSha256
    });

    const token = {
        key: options.accessToken,
        secret: options.accessTokenSecret
    };

    function hashFunctionSha256(baseString, key) {
        return crypto.createHmac('sha256', key).update(baseString).digest('base64')
    }

    async function apiCall(requestData, requestToken = '', customHeaders = {}) {
        try {
            logger.info('Request to Commerce API: ' + requestData.url + ' with method: ' + requestData.method + ' and body: ' + JSON.stringify(requestData?.body));

            const headers = {
                ...customHeaders,
                ...oauth.toHeader(oauth.authorize(requestData, token)),
            };

            const response = await axios({
                method: requestData.method,
                url: requestData.url,
                headers,
                data: requestData.body,
                responseType: 'json'
            }).then(function (response) {
                logger.info("axios response: " + JSON.stringify(response.data));
                return response;
            })

            logger.debug('Response from Commerce API', { requestData, response });

            return response.data;
        } catch (error) {
            logger.error("Request + " + JSON.stringify(requestData) + " failed: " + error.message)
            logger.error('Response from Commerce API 2: ' + JSON.stringify(error));

            throw error
        }
    }

    instance.consumerToken = async function (loginData) {
        return apiCall({
            url: createUrl('integration/customer/token'),
            method: 'POST',
            body: loginData
        })
    }

    instance.get = async function (resourceUrl, requestToken = '') {
        const requestData = {
            url: createUrl(resourceUrl),
            method: 'get'
        }
        return apiCall(requestData, requestToken)
    }

    function createUrl(resourceUrl) {
        return serverUrl + apiVersion + '/' + resourceUrl
    }

    instance.post = async function (resourceUrl, data, requestToken = '', customHeaders = {}) {
        const requestData = {
            url: createUrl(resourceUrl),
            method: 'post',
            body: data
        }
        return apiCall(requestData, requestToken, customHeaders)
    }

    instance.put = async function (resourceUrl, data, requestToken = '') {
        const requestData = {
            url: createUrl(resourceUrl),
            method: 'put',
            body: data
        }
        return apiCall(requestData, requestToken)
    }

    instance.delete = async function (resourceUrl, requestToken = '') {
        const requestData = {
            url: createUrl(resourceUrl),
            method: 'delete'
        }
        return apiCall(requestData, requestToken)
    }

    return instance
}

export function getCommerceOauthClient(options, logger) {
    return getOauthClient(
        {
            ...options,
            version: 'V1',
            url: options.url + 'rest/'
        },
        logger
    );
}
