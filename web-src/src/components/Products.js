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
import {
    Content,
    Heading,
    IllustratedMessage,
    TableView,
    TableHeader,
    TableBody,
    Column,
    Row,
    Cell,
    View,
    Flex,
    ProgressCircle, Button
} from '@adobe/react-spectrum'
import { useCommerceProducts } from '../hooks/useCommerceProducts'
import React from "react";
import ViewSDKClient from "../libraries/ViewSDKClient";

export const Products = props => {
    const handleOnPress = (pdfFilename) => {
        if (pdfFilename === '') {
            return;
        }

        const viewSDKClient = new ViewSDKClient();
        viewSDKClient.ready().then(() => {
            viewSDKClient.previewFile("", pdfFilename, {
                embedMode: "LIGHT_BOX"
            });
        });
    };

    const {isLoadingCommerceProducts, commerceProducts} = useCommerceProducts({...props, pageSize: 20, currentPage: 1})

    const productsColumns = [
        {name: 'SKU', uid: 'sku'},
        {name: 'Name', uid: 'name'},
        {name: 'Status', uid: 'status'},
        {name: 'Price', uid: 'price'},
        {name: 'OMS Stock', uid: 'stock'},
        {name: 'Type ID', uid: 'type_id'},
        {name: 'Created At', uid: 'created_at'},
        {name: 'Updated At', uid: 'updated_at'},
        {name: 'Attachments', uid: 'pdf_file'},
    ]

    function renderEmptyState() {
        return (
            <IllustratedMessage>
                <Content>No data available</Content>
            </IllustratedMessage>
        )
    }

    return (
        <View>
            {isLoadingCommerceProducts ? (
                <Flex alignItems="center" justifyContent="center" height="100vh">
                    <ProgressCircle size="L" aria-label="Loading…" isIndeterminate/>
                </Flex>
            ) : (
                <View margin={10}>
                    <Heading level={1}>Fetched products from Adobe Commerce</Heading>
                    <TableView
                        overflowMode="wrap"
                        aria-label="products table"
                        flex
                        renderEmptyState={renderEmptyState}
                        minHeight="static-size-1000"
                    >
                        <TableHeader columns={productsColumns}>
                            {column => <Column key={column.uid}>{column.name}</Column>}
                        </TableHeader>
                        <TableBody items={commerceProducts}>
                            {product => (
                                <Row key={product['sku']}>{columnKey => {
                                    let content = product[columnKey];
                                    if (columnKey === 'pdf_file' && content) {
                                        content = (
                                            <Button type="button" variant={'primary'} onPress={() => handleOnPress(product[columnKey])}>View PDF</Button>
                                        );
                                    }
                                    return <Cell key={`${product['sku']}-${columnKey}`}>{content}</Cell>
                                }}
                                </Row>
                            )}
                        </TableBody>
                    </TableView>
                    <div id="container" className="light-box-container"></div>
                </View>
            )}
        </View>
    )
}
