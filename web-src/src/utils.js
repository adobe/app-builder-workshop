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

export async function callMesh(url, pageSize, currentPage) {
  console.log("Retrieve data from API Mesh using url %s", url)
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(
      {
        query: `query getAllProductsAndInventory {
            products(
              search: "", 
              pageSize: ${pageSize},
              currentPage: ${currentPage},
              sort: { name: ASC }) {
                items {
                    id
                    sku
                    name
                    type_id
                    created_at
                    updated_at
                    price {
                        regularPrice {
                            amount {
                                value
                            }
                        }
                    }
                    pdf_file
                }
            }
            inventory {
                sku
                stock
            }
        }`
      }
    )
  })
  return await res.json();
}

