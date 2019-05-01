![PulltoRefresh.js](img/pulltorefresh.gif)

[![Build Status](https://travis-ci.org/BoxFactura/pulltorefresh.js.png)](https://travis-ci.org/BoxFactura/pulltorefresh.js)
[![NPM version](https://badge.fury.io/js/pulltorefreshjs.png)](http://badge.fury.io/js/pulltorefreshjs)
[![CDNJS](https://img.shields.io/cdnjs/v/pulltorefreshjs.svg)](https://cdnjs.com/libraries/pulltorefreshjs)

[**PulltoRefresh.js**](http://www.boxfactura.com/pulltorefresh.js/) • [Demos](http://www.boxfactura.com/pulltorefresh.js/demos/basic.html)

A small, but powerful Javascript library crafted to power your webapp's pull to refresh feature. No markup needed, highly customizable and dependency-free!

---


## Install

Download PulltoRefresh either from the [NPM Registry](https://www.npmjs.com/package/pulltorefreshjs), [CDNJS](https://cdnjs.com/libraries/pulltorefreshjs) or [UNPKG](https://unpkg.com/pulltorefreshjs):

```bash
$ npm install pulltorefreshjs --save-dev
$ wget -O pulltorefresh.js https://unpkg.com/pulltorefreshjs
```

Include the JS file in your webapp and initialize it:

```js
const ptr = PullToRefresh.init({
  mainElement: 'body',
  onRefresh() {
    window.location.reload();
  },
});
```

Bundlers can consume `pulltorefreshjs` as CommonJS and ES6-modules syntax:

```js
import PullToRefresh from 'pulltorefreshjs';
// or
const PullToRefresh = require('pulltorefreshjs');
```

API
---

- **`init(options)`**
  Will return a unique ptr-instance with a `destroy()` method.
- **`destroyAll()`**
  Stop and remove all registered ptr-instances.
- **`setPassiveMode(isPassive)`**
  Enable or disable passive mode for event handlers (new instances only).

## Options

- **`distThreshold`** (integer)
  Minimum distance required to trigger the refresh.
  <br />&mdash; Defaults to `60`
- **`distMax`** (integer)
  Maximum distance possible for the element.
  <br />&mdash; Defaults to `80`
- **`distReload`** (integer)
  After the `distThreshold` is reached and released, the element will have this height.
  <br />&mdash; Defaults to `50`
- **`distIgnore`** (integer)
  After which distance should we start pulling?
  <br />&mdash; Defaults to `0`
- **`mainElement`** (string)
  Before which element the pull to refresh elements will be?
  <br />&mdash; Defaults to `body`
- **`triggerElement`** (string)
  Which element should trigger the pull to refresh?
  <br />&mdash; Defaults to `body`
- **`ptrElement`** (string)
  Which class will the main element have?
  <br />&mdash; Defaults to `.ptr`
- **`classPrefix`** (string)
  Which class prefix for the elements?
  <br />&mdash; Defaults to `ptr--`
- **`cssProp`** (string)
  Which property will be usedto calculate the element's proportions?
  <br />&mdash; Defaults to `min-height`
- **`iconArrow`** (string)
  The icon for both `instructionsPullToRefresh` and `instructionsReleaseToRefresh`
  <br />&mdash; Defaults to `&#8675;`
- **`iconRefreshing`** (string)
  The icon when the refresh is in progress.
  <br />&mdash; Defaults to `&hellip;`
- **`instructionsPullToRefresh`** (string)
  The initial instructions string.
  <br />&mdash; Defaults to `Pull down to refresh`
- **`instructionsReleaseToRefresh`** (string)
  The instructions string when the `distThreshold` has been reached.
  <br />&mdash; Defaults to `Release to refresh`
- **`instructionsRefreshing`** (string)
  The refreshing text.
  <br />&mdash; Defaults to `Refreshing`
- **`refreshTimeout`** (integer)
  The delay, in milliseconds before the `onRefresh` is triggered.
  <br />&mdash; Defaults to `500`
- **`getMarkup`** (function)
  It returns the default HTML for the widget, `__PREFIX__` is replaced.
  <br />&mdash; See [src/lib/markup.js](src/lib/markup.js)
- **`getStyles`** (function)
  It returns the default CSS for the widget, `__PREFIX__` is replaced.
  <br />&mdash; See [src/lib/styles.js](src/lib/styles.js)
- **`onInit`** (function)
  The initialize function.
- **`onRefresh`** (function)
  What will the pull to refresh trigger? You can return a promise.
  <br />&mdash; Defaults to `window.location.reload()`
- **`resistanceFunction`** (function)
  The resistance function, accepts one parameter, must return a number, capping at 1.
  <br />&mdash; Defaults to `t => Math.min(1, t / 2.5)`
- **`shouldPullToRefresh`** (function)
  Which condition should be met for pullToRefresh to trigger?
  <br />&mdash; Defaults to `!window.scrollY`

## Use with React

With [ReactDOMServer](https://reactjs.org/docs/react-dom-server.html) and `renderToString()` you can use components as 
icons instead of just strings. 
In this example we also use [Font Awesome](https://fontawesome.com/how-to-use/on-the-web/using-with/react) to get nice icons with animation, but you can
use any React component you like.

[Demo on codesandbox.io](https://codesandbox.io/s/21o9z8rrzy)

```jsx harmony

import React, { Component } from 'react';
import ReactDOMServer from 'react-dom/server';
import PullToRefresh from 'pulltorefreshjs';
import { faSyncAlt} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class App extends Component
{
    componentDidMount()
    {
        PullToRefresh.init({
            mainElement: 'body',
            onRefresh() {
                window.location.reload();
            },
            iconArrow: ReactDOMServer.renderToString(
                <FontAwesomeIcon icon={faSyncAlt} />
            ),
            iconRefreshing: ReactDOMServer.renderToString(
                <FontAwesomeIcon icon={faSyncAlt} spin={true} />
            ),
        });
    }
    
    componentWillUnmount() 
    {
        // Don't forget to destroy all instances on unmout
        // or you will get some glitches.
        PullToRefresh.destroyAll();
    }

    render()
    {
        return (
            <div>
                <h1>App</h1>
            </div>
        );
    }
}

export default App;
```

## Contribute

To quickly start the development workflow:

1. Install NodeJS ([NVM](https://github.com/creationix/nvm/blob/master/nvm.sh))
2. Run `nvm use 10 && npm install`
3. Then `npm run dev`

> This will watch and compile the bundle for browser usage.

E2E tests are executed with Testcafé.

- Run `npm test` to use standard chrome
- Run `npm run test:ci` to run chrome in headless mode

Advanced debug can be achieved with `testcafe-live`, e.g.

```bash
$ npx testcafe-live chrome tests/e2e/cases --debug-on-fail
```

## Donations

If you find this project helpful, please consider supporting the maintenance team!

[![](https://www.paypalobjects.com/en_US/MX/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=WYS5CSZWWLNN4)

## Roadmap

- [ ] More events: `onPullStart`, `onPullDown(direction, willRefresh)`, `onRelease(willRefresh)`
- [ ] Fully customizable CSS
- [ ] Gallery of use cases
- [ ] Advanced demos
- [x] Tests
- [x] Minified releases
