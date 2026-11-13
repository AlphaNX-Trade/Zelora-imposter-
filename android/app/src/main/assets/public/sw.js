/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "pwa-maskable-512x512.png",
    "revision": "aa7c15d1ada68dc006be3f6c461d0a39"
  }, {
    "url": "pwa-512x512.png",
    "revision": "8d3a7f790f213744399925e9ad4536d0"
  }, {
    "url": "pwa-192x192.png",
    "revision": "83a32b99291a0b3a8b130152b1b8cb23"
  }, {
    "url": "index.html",
    "revision": "abd355a0bbe0aa28d940d09bfb2b0cfd"
  }, {
    "url": "icon.svg",
    "revision": "407c88fdb79492559aa382d98949b5e7"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "39118c7baad78e0d997adf1baf6da46e"
  }, {
    "url": "assets/workbox-window.prod.es5-Bd17z0YL.js",
    "revision": null
  }, {
    "url": "assets/web-OW_PJlvh.js",
    "revision": null
  }, {
    "url": "assets/web-D5pZsfGy.js",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-vietnamese-700-normal-CV6qDkkj.woff2",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-vietnamese-700-normal-BCh_uG_5.woff",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-vietnamese-600-normal-Y4VTTRme.woff2",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-vietnamese-600-normal-5YsyKbU1.woff",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-vietnamese-500-normal-DiU8zqi-.woff2",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-vietnamese-500-normal-CvE5C8T-.woff",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-vietnamese-400-normal-Cg2kxhWu.woff2",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-vietnamese-400-normal-B8TCSmUq.woff",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-latin-ext-700-normal-BajbvANd.woff2",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-latin-ext-700-normal-8-d-IyIQ.woff",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-latin-ext-600-normal-DQgPU_Cg.woff2",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-latin-ext-600-normal-B0WRRYJ1.woff",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-latin-ext-500-normal-CqEEAICU.woff",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-latin-ext-500-normal-9VZagAe1.woff2",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-latin-ext-400-normal-D127hM_v.woff2",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-latin-ext-400-normal-2ppkqaOR.woff",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-latin-700-normal-DqEcQeE5.woff",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-latin-700-normal-CfpNZvy6.woff2",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-latin-600-normal-DLTa1BUW.woff2",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-latin-600-normal-BR_Ojra4.woff",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-latin-500-normal-DYtqi0QS.woff",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-latin-500-normal-Bf-nb4oT.woff2",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-latin-400-normal-Dhut76fR.woff2",
    "revision": null
  }, {
    "url": "assets/plus-jakarta-sans-latin-400-normal-BDKaGhyp.woff",
    "revision": null
  }, {
    "url": "assets/outfit-latin-ext-800-normal-DyhPHUt-.woff",
    "revision": null
  }, {
    "url": "assets/outfit-latin-ext-800-normal-DRv2ic_2.woff2",
    "revision": null
  }, {
    "url": "assets/outfit-latin-ext-700-normal-fjS8-Gm7.woff",
    "revision": null
  }, {
    "url": "assets/outfit-latin-ext-700-normal-CI4iH74K.woff2",
    "revision": null
  }, {
    "url": "assets/outfit-latin-ext-600-normal-CWJcPgd7.woff",
    "revision": null
  }, {
    "url": "assets/outfit-latin-ext-600-normal-B85nYjL1.woff2",
    "revision": null
  }, {
    "url": "assets/outfit-latin-800-normal-CQna6-G7.woff2",
    "revision": null
  }, {
    "url": "assets/outfit-latin-800-normal-BRHLSPcU.woff",
    "revision": null
  }, {
    "url": "assets/outfit-latin-700-normal-D4itBLBr.woff",
    "revision": null
  }, {
    "url": "assets/outfit-latin-700-normal-Cu9v6i1X.woff2",
    "revision": null
  }, {
    "url": "assets/outfit-latin-600-normal-BEfTtDA7.woff",
    "revision": null
  }, {
    "url": "assets/outfit-latin-600-normal-B7SfZ07L.woff2",
    "revision": null
  }, {
    "url": "assets/jetbrains-mono-vietnamese-700-normal-BDLVIk2r.woff",
    "revision": null
  }, {
    "url": "assets/jetbrains-mono-vietnamese-500-normal-DNRqzVM1.woff",
    "revision": null
  }, {
    "url": "assets/jetbrains-mono-latin-ext-700-normal-CxPITLHs.woff",
    "revision": null
  }, {
    "url": "assets/jetbrains-mono-latin-ext-700-normal-CZipNAKV.woff2",
    "revision": null
  }, {
    "url": "assets/jetbrains-mono-latin-ext-500-normal-ckzbgY84.woff",
    "revision": null
  }, {
    "url": "assets/jetbrains-mono-latin-ext-500-normal-Cut-4mMH.woff2",
    "revision": null
  }, {
    "url": "assets/jetbrains-mono-latin-700-normal-D3wTyLJW.woff",
    "revision": null
  }, {
    "url": "assets/jetbrains-mono-latin-700-normal-BYuf6tUa.woff2",
    "revision": null
  }, {
    "url": "assets/jetbrains-mono-latin-500-normal-CJOVTJB7.woff",
    "revision": null
  }, {
    "url": "assets/jetbrains-mono-latin-500-normal-BWZEU5yA.woff2",
    "revision": null
  }, {
    "url": "assets/jetbrains-mono-greek-700-normal-DEigVDxa.woff",
    "revision": null
  }, {
    "url": "assets/jetbrains-mono-greek-700-normal-C6CZE3T8.woff2",
    "revision": null
  }, {
    "url": "assets/jetbrains-mono-greek-500-normal-JpySY46c.woff2",
    "revision": null
  }, {
    "url": "assets/jetbrains-mono-greek-500-normal-D7SFKleX.woff",
    "revision": null
  }, {
    "url": "assets/jetbrains-mono-cyrillic-700-normal-CEoEElIJ.woff",
    "revision": null
  }, {
    "url": "assets/jetbrains-mono-cyrillic-700-normal-BWTpRfYl.woff2",
    "revision": null
  }, {
    "url": "assets/jetbrains-mono-cyrillic-500-normal-DmUKJPL_.woff2",
    "revision": null
  }, {
    "url": "assets/jetbrains-mono-cyrillic-500-normal-DJqRU3vO.woff",
    "revision": null
  }, {
    "url": "assets/index-C2NrqSrv.js",
    "revision": null
  }, {
    "url": "assets/index-By8YaMXQ.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "39118c7baad78e0d997adf1baf6da46e"
  }, {
    "url": "icon.svg",
    "revision": "407c88fdb79492559aa382d98949b5e7"
  }, {
    "url": "pwa-192x192.png",
    "revision": "83a32b99291a0b3a8b130152b1b8cb23"
  }, {
    "url": "pwa-512x512.png",
    "revision": "8d3a7f790f213744399925e9ad4536d0"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "aa7c15d1ada68dc006be3f6c461d0a39"
  }, {
    "url": "manifest.webmanifest",
    "revision": "afc7c564633cb1f5a402517746cdadc5"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("/index.html")));

}));
