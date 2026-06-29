(function (global) {
  'use strict';

  const Mascot = global.InteractiveMascot;
  if (!Mascot) return;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const originalBuild = Mascot.prototype.build;

  Mascot.prototype.build = function patchedBuild() {
    originalBuild.call(this);
    const character = this.element.querySelector('.mascot__character');
    if (!character || character.parentElement.classList.contains('mascot__flip')) return;
    const flip = document.createElement('div');
    flip.className = 'mascot__flip';
    character.before(flip);
    flip.append(character);
  };

  Mascot.prototype.getSafeTrackRect = function getSafeTrackRect() {
    return this.zoneRects.track || {
      left: 0,
      right: this.hostWidth,
      top: 0,
      bottom: this.hostHeight,
      width: this.hostWidth,
      height: this.hostHeight
    };
  };

  Mascot.prototype.getTrackPosition = function getTrackPosition(fraction = 0.5) {
    const track = this.getSafeTrackRect();
    const gap = 18;
    const minLeft = track.left + gap;
    const maxLeft = track.right - this.mascotWidth - gap;
    const normalized = clamp(Number(fraction) || 0, 0, 1);
    return {
      left: minLeft + Math.max(0, maxLeft - minLeft) * normalized,
      bottom: this.hostHeight - track.bottom - 2
    };
  };

  Mascot.prototype.getQrSidePosition = function getQrSidePosition(side = 'left', elevated = false) {
    const track = this.getSafeTrackRect();
    const qr = this.zoneRects[side === 'left' ? 'leftQr' : 'rightQr'];
    const gap = 18;
    const left = side === 'left'
      ? track.left + gap
      : track.right - this.mascotWidth - gap;
    const groundBottom = this.hostHeight - track.bottom - 2;
    const elevatedBottom = qr
      ? Math.max(groundBottom, this.hostHeight - qr.top - this.mascotWidth * 1.18 * 0.22)
      : groundBottom + track.height * 0.55;
    return { left, bottom: elevated ? elevatedBottom : groundBottom };
  };

  Mascot.prototype.placeImmediately = function placeImmediately(position) {
    this.currentLeft = position.left;
    this.currentBottom = position.bottom;
    this.element.style.transitionDuration = '0ms';
    this.element.style.left = '0px';
    this.element.style.bottom = '0px';
    this.element.style.transform = `translate3d(${position.left}px, ${-position.bottom}px, 0)`;
    void this.element.offsetWidth;
    this.element.style.removeProperty('transition-duration');
  };

  Mascot.prototype.moveTo = async function moveTo(position, duration = 1500, state = 'walk', token = this.token) {
    const track = this.getSafeTrackRect();
    const gap = 18;
    const minLeft = track.left + gap;
    const maxLeft = track.right - this.mascotWidth - gap;
    const safePosition = {
      left: clamp(position.left, minLeft, Math.max(minLeft, maxLeft)),
      bottom: Math.max(this.hostHeight - track.bottom - 2, position.bottom)
    };

    this.face(safePosition.left < this.currentLeft ? 'left' : 'right');
    this.setState(state);
    this.element.style.left = '0px';
    this.element.style.bottom = '0px';
    this.element.style.transitionDuration = `${duration}ms`;
    this.element.style.transform = `translate3d(${safePosition.left}px, ${-safePosition.bottom}px, 0)`;
    this.currentLeft = safePosition.left;
    this.currentBottom = safePosition.bottom;

    await new Promise((resolve) => setTimeout(resolve, duration));
    if (token !== this.token) return false;
    if (state === 'walk' || state === 'climb') this.setState('idle');
    return true;
  };
})(window);
