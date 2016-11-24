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

export default {
  _closestElement,
};
