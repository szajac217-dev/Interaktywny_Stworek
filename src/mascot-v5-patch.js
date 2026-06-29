(function (global) {
  'use strict';

  const Mascot = global.InteractiveMascot;
  if (!Mascot) return;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  Mascot.prototype.getTrackPosition = function getTrackPosition(fraction = 0.5) {
    const padding = 10;
    const maxLeft = Math.max(padding, this.hostWidth - this.mascotWidth - padding);
    const normalized = clamp(Number(fraction) || 0, 0, 1);
    return {
      left: padding + (maxLeft - padding) * normalized,
      bottom: 0
    };
  };

  Mascot.prototype.getQrSidePosition = function getQrSidePosition(side = 'left', elevated = false) {
    const padding = 10;
    const maxLeft = Math.max(padding, this.hostWidth - this.mascotWidth - padding);
    const maxBottom = Math.max(0, this.hostHeight - this.mascotHeight);
    return {
      left: side === 'left' ? padding : maxLeft,
      bottom: elevated ? maxBottom : 0
    };
  };

  Mascot.prototype.placeImmediately = function placeImmediately(position) {
    const maxLeft = Math.max(0, this.hostWidth - this.mascotWidth);
    const maxBottom = Math.max(0, this.hostHeight - this.mascotHeight);
    const safe = {
      left: clamp(position.left, 0, maxLeft),
      bottom: clamp(position.bottom, 0, maxBottom)
    };
    this.currentLeft = safe.left;
    this.currentBottom = safe.bottom;
    this.element.style.left = '0px';
    this.element.style.bottom = '0px';
    this.element.style.transitionDuration = '0ms';
    this.element.style.transform = `translate3d(${safe.left}px, ${-safe.bottom}px, 0)`;
    void this.element.offsetWidth;
    this.element.style.removeProperty('transition-duration');
  };

  Mascot.prototype.moveTo = async function moveTo(position, duration = 1750, state = 'walk', token = this.token) {
    const maxLeft = Math.max(0, this.hostWidth - this.mascotWidth);
    const maxBottom = Math.max(0, this.hostHeight - this.mascotHeight);
    const safe = {
      left: clamp(position.left, 0, maxLeft),
      bottom: clamp(position.bottom, 0, maxBottom)
    };

    this.face(safe.left < this.currentLeft ? 'left' : 'right');
    this.setState(state);
    this.element.style.left = '0px';
    this.element.style.bottom = '0px';
    this.element.style.transitionDuration = `${duration}ms`;
    this.element.style.transform = `translate3d(${safe.left}px, ${-safe.bottom}px, 0)`;
    this.currentLeft = safe.left;
    this.currentBottom = safe.bottom;

    await wait(duration);
    if (token !== this.token) return false;
    if (state === 'walk' || state === 'climb') this.setState('idle');
    return true;
  };
})(window);
