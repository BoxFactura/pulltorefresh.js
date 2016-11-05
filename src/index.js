const config = {};

config.distTreshold = 90;
config.distMax = 120;
config.resistanceFunction = t => Math.min(1, t / 2.5);

const body = document.querySelector('#main');

let pullStartY = null;
let pullMoveY = null;
let dist = 0;
let distResisted = 0;

window.addEventListener('touchstart', (e) => {
  if (!window.scrollY) {
    pullStartY = e.touches[0].screenY;
  }
});

window.addEventListener('touchmove', (e) => {
  if (!pullStartY) {
    if (!window.scrollY) {
      pullStartY = e.touches[0].screenY;
    }
  } else {
    pullMoveY = e.touches[0].screenY;
  }

  console.log('PULL');

  if (pullStartY && pullMoveY) {
    dist = pullMoveY - pullStartY;
  }

  if (dist > 0) {
    e.preventDefault();
    body.style.transform = body.style.webkitTransform = `translate3d(0,${distResisted}px,0)`;
    distResisted = config.resistanceFunction(dist / config.distTreshold)
      * Math.min(config.distMax, dist);

    if (distResisted > config.distTreshold) {
      console.log('RELEASE');
    }
  }
});

window.addEventListener('touchend', () => {
  if (distResisted > config.distTreshold) {
    console.log('GO');
  }

  body.style.transform = 'translate3d(0,0,0)';
  pullStartY = pullMoveY = null;
  dist = distResisted = 0;
});
