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
import React from 'react'
import { Provider, lightTheme } from '@adobe/react-spectrum'
import { ErrorBoundary } from 'react-error-boundary'
import { Route, BrowserRouter, Routes } from 'react-router-dom'
import ExtensionRegistration from './ExtensionRegistration'
import {Products} from "./Products";

function App (props) {
  return (
      <ErrorBoundary onError={onError} FallbackComponent={fallbackComponent}>
          <BrowserRouter>
              <Provider theme={lightTheme} colorScheme={'light'}>
                  <Routes>
                      <Route index element={<Products />} />
                      <Route path={'index.html'} element={<ExtensionRegistration />} />
                  </Routes>
              </Provider>
          </BrowserRouter>
      </ErrorBoundary>
  )

  // error handler on UI rendering failure
    function onError(e, componentStack) {}

    // component to show if UI fails rendering
    function fallbackComponent({ componentStack, error }) {
        return (
            <React.Fragment>
                <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Something went wrong :(</h1>
                <pre>{componentStack + '\n' + error.message}</pre>
            </React.Fragment>
        )
    }
}

export default App
