import _ptrMarkup from './markup';
import _ptrStyles from './styles';

export default {
  distThreshold: 60,
  distMax: 80,
  distReload: 50,
  distIgnore: 0,
  mainElement: 'body',
  triggerElement: 'body',
  ptrElement: '.ptr',
  classPrefix: 'ptr--',
  cssProp: 'min-height',
  iconArrow: '&#8675;',
  iconRefreshing: '&hellip;',
  instructionsPullToRefresh: 'Pull down to refresh',
  instructionsReleaseToRefresh: 'Release to refresh',
  instructionsRefreshing: 'Refreshing',
  refreshTimeout: 500,
  getMarkup: () => _ptrMarkup,
  getStyles: () => _ptrStyles,
  onInit: () => {},
  onRefresh: () => location.reload(),
  resistanceFunction: t => Math.min(1, t / 2.5),
  shouldPullToRefresh: () => !window.scrollY,
};
