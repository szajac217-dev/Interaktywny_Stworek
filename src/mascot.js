(function (global) {
  'use strict';

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const REACTIONS = {
    koncert: { state: 'dance', bubble: '🎵', position: 0.55, duration: 3300 },
    wystawa: { state: 'think', bubble: '🤔', position: 0.72, duration: 2800 },
    rodzinne: { state: 'happy', bubble: '🥳', position: 0.48, duration: 2800 },
    kino: { state: 'surprised', bubble: '😲', position: 0.62, duration: 2400 },
    sport: { state: 'surprised', bubble: '🤯', position: 0.82, duration: 2600 },
    warsztaty: { state: 'point', bubble: '💡', position: 0.66, duration: 2800 },
    teatr: { state: 'happy', bubble: '👏', position: 0.44, duration: 2800 },
    default: { state: 'look', bubble: '👀', position: 0.58, duration: 2400 }
  };

  class InteractiveMascot {
    constructor(options = {}) {
      this.host = typeof options.host === 'string'
        ? document.querySelector(options.host)
        : options.host;

      if (!this.host) {
        throw new Error('InteractiveMascot: nie znaleziono elementu hosta.');
      }

      this.options = {
        image: 'assets/mascot/placeholder.svg',
        size: 94,
        startPosition: 0.08,
        edgePadding: 0,
        listenWindowEvents: true,
        ...options
      };

      this.token = 0;
      this.currentPosition = clamp(this.options.startPosition, 0, 1);
      this.currentState = 'idle';
      this.resizeObserver = null;
      this.onPosterEvent = (event) => this.react(event.detail || {});

      this.build();
      this.measure();
      this.placeImmediately(this.currentPosition);
      this.setState('idle');
      this.bind();
    }

    build() {
      const layer = document.createElement('div');
      layer.className = 'mascot-layer';
      layer.setAttribute('aria-hidden', 'true');

      const mascot = document.createElement('div');
      mascot.className = 'mascot state-idle';
      mascot.style.setProperty('--mascot-size', `${this.options.size}px`);

      const image = document.createElement('img');
      image.className = 'mascot__image';
      image.src = this.options.image;
      image.alt = '';
      image.draggable = false;

      const reaction = document.createElement('div');
      reaction.className = 'mascot__reaction';
      reaction.textContent = '👀';

      mascot.append(image, reaction);
      layer.append(mascot);
      this.host.append(layer);

      this.layer = layer;
      this.element = mascot;
      this.image = image;
      this.reaction = reaction;
    }

    bind() {
      if (this.options.listenWindowEvents) {
        global.addEventListener('signage:poster-change', this.onPosterEvent);
      }

      if ('ResizeObserver' in global) {
        this.resizeObserver = new ResizeObserver(() => {
          this.measure();
          this.placeImmediately(this.currentPosition);
        });
        this.resizeObserver.observe(this.host);
      } else {
        global.addEventListener('resize', () => {
          this.measure();
          this.placeImmediately(this.currentPosition);
        });
      }
    }

    measure() {
      const width = this.host.clientWidth || 1;
      const mascotWidth = this.element.offsetWidth || this.options.size;
      this.minX = this.options.edgePadding;
      this.maxX = Math.max(this.minX, width - mascotWidth - this.options.edgePadding);
    }

    xFor(position) {
      const normalized = clamp(Number(position) || 0, 0, 1);
      return this.minX + (this.maxX - this.minX) * normalized;
    }

    placeImmediately(position) {
      this.currentPosition = clamp(Number(position) || 0, 0, 1);
      this.element.style.transitionDuration = '0ms';
      this.element.style.left = `${this.xFor(this.currentPosition)}px`;
      void this.element.offsetWidth;
      this.element.style.removeProperty('transition-duration');
    }

    setState(state) {
      this.currentState = state;
      [...this.element.classList]
        .filter((name) => name.startsWith('state-'))
        .forEach((name) => this.element.classList.remove(name));
      this.element.classList.add(`state-${state}`);
    }

    face(direction) {
      this.element.classList.toggle('facing-left', direction === 'left');
    }

    async moveTo(position, duration = 1600, token = this.token) {
      const target = clamp(Number(position) || 0, 0, 1);
      const direction = target < this.currentPosition ? 'left' : 'right';
      this.face(direction);
      this.setState('walk');
      this.element.style.transitionDuration = `${duration}ms, 350ms`;
      this.element.style.left = `${this.xFor(target)}px`;
      this.currentPosition = target;
      await wait(duration);
      if (token !== this.token) return false;
      this.setState('idle');
      return true;
    }

    async say(text, duration = 1300, token = this.token) {
      this.reaction.textContent = text;
      this.element.classList.add('is-speaking');
      await wait(duration);
      if (token !== this.token) return false;
      this.element.classList.remove('is-speaking');
      return true;
    }

    async perform(state, duration = 2400, token = this.token) {
      this.setState(state);
      await wait(duration);
      if (token !== this.token) return false;
      this.setState('idle');
      return true;
    }

    async lean(side = 'right') {
      const token = ++this.token;
      const position = side === 'left' ? 0.01 : 0.99;
      const arrived = await this.moveTo(position, 1700, token);
      if (!arrived) return;
      this.face(side === 'left' ? 'left' : 'right');
      this.setState('lean');
      await this.say('👀', 1800, token);
      if (token === this.token) this.setState('idle');
    }

    async react(input = {}) {
      const token = ++this.token;
      const category = this.normalizeCategory(input.category || input.type || input.kind || input.title);
      const reaction = { ...REACTIONS.default, ...(REACTIONS[category] || {}) };

      this.element.classList.remove('is-speaking');
      this.element.dispatchEvent(new CustomEvent('mascot:reaction-start', {
        bubbles: true,
        detail: { category, input }
      }));

      const arrived = await this.moveTo(reaction.position, 1450, token);
      if (!arrived) return;

      await Promise.all([
        this.say(input.bubble || reaction.bubble, Math.min(1500, reaction.duration), token),
        this.perform(input.state || reaction.state, reaction.duration, token)
      ]);

      if (token !== this.token) return;

      this.setState('look');
      await wait(900);
      if (token !== this.token) return;
      this.setState('idle');

      this.element.dispatchEvent(new CustomEvent('mascot:reaction-end', {
        bubbles: true,
        detail: { category, input }
      }));
    }

    normalizeCategory(value = '') {
      const text = String(value).toLowerCase();
      if (/koncert|muzyk|festival|festiwal/.test(text)) return 'koncert';
      if (/wystaw|galeri|malar|sztuk/.test(text)) return 'wystawa';
      if (/rodzin|dzieci|piknik/.test(text)) return 'rodzinne';
      if (/kino|film|seans/.test(text)) return 'kino';
      if (/sport|rower|bieg|downhill/.test(text)) return 'sport';
      if (/warsztat|zajęcia|pracown/.test(text)) return 'warsztaty';
      if (/teatr|spektakl/.test(text)) return 'teatr';
      return 'default';
    }

    destroy() {
      this.token += 1;
      global.removeEventListener('signage:poster-change', this.onPosterEvent);
      if (this.resizeObserver) this.resizeObserver.disconnect();
      this.layer.remove();
    }
  }

  global.InteractiveMascot = InteractiveMascot;
  global.notifyMascotPosterChange = function notifyMascotPosterChange(detail) {
    global.dispatchEvent(new CustomEvent('signage:poster-change', { detail }));
  };
})(window);
