![PulltoRefresh.js](img/pulltorefresh.gif)

[![Build Status](https://travis-ci.org/BoxFactura/pulltorefresh.js.png)](https://travis-ci.org/BoxFactura/pulltorefresh.js)
[![NPM version](https://badge.fury.io/js/pulltorefreshjs.png)](http://badge.fury.io/js/pulltorefreshjs)
[![CDNJS](https://img.shields.io/cdnjs/v/pulltorefreshjs.svg)](https://cdnjs.com/libraries/pulltorefreshjs)

[**PulltoRefresh.js**](http://www.boxfactura.com/pulltorefresh.js/) • [Demos](http://www.boxfactura.com/pulltorefresh.js/demos/basic.html)

A small, but powerful Javascript library crafted to power your webapp's pull to refresh feature. No markup needed, highly customizable and dependency-free!

---


Install
---

Include the JS file in your webapp and initialize it:

```
var ptr = PullToRefresh.init({
  mainElement: 'body',
  onRefresh: function(){ window.location.reload(); }
});

```

API
---

**➡ `init(options)`**

Will return a unique ptr-instance with a `destroy()` method.

**➡ `destroyAll()`**

Stop and remove all registered ptr-instances.

**➡ `setPassiveMode(isPassive)`**

Enable or disable passive mode for event handlers (new instances only).

Options
---

**➡ `distThreshold`** (integer, default: `60`)

Minimum distance required to trigger the refresh.

**➡ `distMax`** (integer, default: `80`)

Maximum distance possible for the element.

**➡ `distReload`** (integer, default: `50`)

After the `distThreshold` is reached and released, the element will have this height.

**➡ `mainElement`** (string, default: `body`)

Before which element the pull to refresh elements will be?

**➡ `triggerElement`** (string, default: `body`)

Which element should trigger the pull to refresh?

**➡ `ptrElement`** (string, default: `.ptr`)

Which class will the main element have?

**➡ `classPrefix`** (string, default: `ptr--`)

Which class prefix for the elements?

**➡ `cssProp`** (string, default: `min-height`)

Which property will be used to calculate the element's proportions?

**➡ `iconArrow`** (string, default: `&#8675;`)

The icon for both `instructionsPullToRefresh` and `instructionsReleaseToRefresh`

**➡ `iconRefreshing`** (string, default: `&hellip;`)

The icon when the refresh is in progress.

**➡ `instructionsPullToRefresh`** (string, default: `Pull down to refresh`)

The initial instructions string.

**➡ `instructionsReleaseToRefresh`** (string, default: `Release to refresh`)

The instructions string when the `distThreshold` has been reached.

**➡ `instructionsRefreshing`** (string, default: `Refreshing`)

The refreshing text.

**➡ `refreshTimeout`** (integer, default: `500`)

The delay, in milliseconds before the `onRefresh` is triggered.

**➡ `onInit`** (function)

The initialize function.

**➡ `onRefresh`** (function)

What will the pull to refresh trigger? You can return a promise. Defaults to `window.location.reload()`

**➡ `resistanceFunction`** (function)

The resistance function, accepts one parameter, must return a number, capping at 1. Defaults to `t => Math.min(1, t / 2.5)`

**➡ `shouldPullToRefresh`** (function)

Which condition should be met for pullToRefresh to trigger? Defaults to `!window.scrollY`

**➡ `passive`** (boolean)

This value will be passed as `{ passive: true|false }` to `touchmove` listeners if passive-handlers are supported. Defaults to `false`

Contribute
---

1. Install NodeJS ([NVM](https://github.com/creationix/nvm/blob/master/nvm.sh))
2. Run `nvm use 4 && npm install`
3. Then `npm run dev`

Roadmap
---

- [ ] More events: `onPullStart`, `onPullDown(direction, willRefresh)`, `onRelease(willRefresh)`
- [ ] Fully customizable CSS
- [ ] Gallery of use cases
- [ ] Advanced demos
- [ ] Tests - WIP
- [x] Minified releases
