export function _closestElement(node, selector) {
  let depth = 10;

  do {
    if (!(node && node.tagName) || !depth) {
      return null;
    }

    if (node.tagName && node.tagName === selector.toUpperCase()) {
      return node;
    }

    if (selector.charAt() === '#' && node.id === selector.substr(1)) {
      return node;
    }

    if (selector.charAt() === '.' && node.classList.contains(selector.substr(1))) {
      return node;
    }

    depth -= 1;

    node = node.parentNode;
  } while (node.parentNode);
}

export function _getIcon(state) {
  if (state === 'pending') {
    return '&hellip;';
  }

  return '&darr;';
}

export function _getLabel(state) {
  if (state === 'releasing') {
    return 'Release to refresh';
  }

  if (state === 'pending') {
    return 'Refreshing';
  }

  return 'Pull down to refresh';
}

export default {
  _closestElement,
  _getLabel,
  _getIcon,
};
