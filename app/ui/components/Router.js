import PIXI from '../common/pixi';
import logger from '../common/logger';

export class Router extends PIXI.Container {
    constructor({ width, height, routes = [], transition = 'slide', duration = 200, initialPath = null } = {}) {
        super();
        this._w = width;
        this._h = height;
        this._transition = transition;
        this._duration = duration;
        this._transitioning = false;
        this._stack = [];

        this._mask = new PIXI.Graphics();
        this._mask.beginFill(0xFFFFFF);
        this._mask.drawRect(0, 0, width, height);
        this._mask.endFill();
        super.addChild(this._mask);

        this._content = new PIXI.Container();
        this._content.mask = this._mask;
        super.addChild(this._content);

        this.interactive = true;
        this.hitArea = new PIXI.Rectangle(0, 0, width, height);

        this._routes = this._parseRoutes(routes);

        const initPath = initialPath || (routes.length > 0 ? routes[0].path : null);
        if (initPath) {
            this.replace(initPath);
        }
    }

    _parseRoutes(routes) {
        return routes.map(({ path, builder }) => {
            const segments = path.split('/');
            const paramNames = [];
            segments.forEach(seg => {
                if (seg.startsWith(':')) paramNames.push(seg.slice(1));
            });
            return { path, segments, paramNames, builder };
        });
    }

    _matchRoute(path) {
        const inputSegs = path.split('/');
        for (const route of this._routes) {
            if (route.segments.length !== inputSegs.length) continue;
            const params = {};
            let matched = true;
            for (let i = 0; i < route.segments.length; i++) {
                const def = route.segments[i];
                const val = inputSegs[i];
                if (def.startsWith(':')) {
                    params[def.slice(1)] = val;
                } else if (def !== val) {
                    matched = false;
                    break;
                }
            }
            if (matched) return { route, params };
        }
        return null;
    }

    get currentPath() {
        return this._stack.length > 0 ? this._stack[this._stack.length - 1].path : null;
    }

    get stackDepth() {
        return this._stack.length;
    }

    push(path, params = {}) {
        if (this._transitioning) return;
        const match = this._matchRoute(path);
        if (!match) {
            logger.warn(`[Router] no route matched: ${path}`);
            return;
        }
        const merged = { ...match.params, ...params };
        const newComp = match.route.builder(merged, this);
        const oldEntry = this._stack.length > 0 ? this._stack[this._stack.length - 1] : null;

        if (oldEntry && typeof oldEntry.component.onLeave === 'function') {
            oldEntry.component.onLeave();
        }

        this._stack.push({ path, component: newComp, params: merged });
        this._content.addChild(newComp);

        if (oldEntry) {
            this._runTransition(oldEntry.component, newComp, false, () => {
                this._content.removeChild(oldEntry.component);
                if (typeof newComp.onEnter === 'function') newComp.onEnter(merged);
                this.emit('navigate', { path, action: 'push', params: merged });
            });
        } else {
            if (typeof newComp.onEnter === 'function') newComp.onEnter(merged);
            this.emit('navigate', { path, action: 'push', params: merged });
        }
    }

    pop() {
        if (this._transitioning || this._stack.length <= 1) return;
        const outgoing = this._stack.pop();
        const incoming = this._stack[this._stack.length - 1];

        if (typeof outgoing.component.onLeave === 'function') {
            outgoing.component.onLeave();
        }

        this._content.addChild(incoming.component);

        this._runTransition(incoming.component, outgoing.component, true, () => {
            this._content.removeChild(outgoing.component);
            outgoing.component.destroy({ children: true });
            if (typeof incoming.component.onEnter === 'function') {
                incoming.component.onEnter(incoming.params);
            }
            this.emit('navigate', { path: incoming.path, action: 'pop', params: incoming.params });
        });
    }

    replace(path, params = {}) {
        if (this._transitioning) return;
        const match = this._matchRoute(path);
        if (!match) {
            logger.warn(`[Router] no route matched: ${path}`);
            return;
        }
        const merged = { ...match.params, ...params };
        const newComp = match.route.builder(merged, this);

        if (this._stack.length > 0) {
            const old = this._stack[this._stack.length - 1];
            if (typeof old.component.onLeave === 'function') old.component.onLeave();
            this._content.removeChild(old.component);
            old.component.destroy({ children: true });
            this._stack[this._stack.length - 1] = { path, component: newComp, params: merged };
        } else {
            this._stack.push({ path, component: newComp, params: merged });
        }

        this._content.addChild(newComp);
        if (typeof newComp.onEnter === 'function') newComp.onEnter(merged);
        this.emit('navigate', { path, action: 'replace', params: merged });
    }

    popToRoot() {
        if (this._transitioning || this._stack.length <= 1) return;
        const outgoing = this._stack[this._stack.length - 1];
        const root = this._stack[0];

        if (typeof outgoing.component.onLeave === 'function') {
            outgoing.component.onLeave();
        }

        for (let i = 1; i < this._stack.length - 1; i++) {
            this._stack[i].component.destroy({ children: true });
        }

        this._stack.length = 1;
        this._content.addChild(root.component);

        this._runTransition(root.component, outgoing.component, true, () => {
            this._content.removeChild(outgoing.component);
            outgoing.component.destroy({ children: true });
            if (typeof root.component.onEnter === 'function') {
                root.component.onEnter(root.params);
            }
            this.emit('navigate', { path: root.path, action: 'popToRoot', params: root.params });
        });
    }

    _runTransition(oldComp, newComp, reverse, callback) {
        const type = this._transition;
        const duration = this._duration;

        if (type === 'none' || duration <= 0) {
            callback();
            return;
        }

        this._transitioning = true;
        oldComp.interactiveChildren = false;
        newComp.interactiveChildren = false;

        let elapsed = 0;
        const tweenFn = () => {
            elapsed += PIXI.ticker.shared.elapsedMS;
            const t = Math.min(elapsed / duration, 1);
            const ease = t * (2 - t);

            if (type === 'slide') {
                if (reverse) {
                    newComp.x = this._w * ease;
                    oldComp.x = -this._w * 0.3 * (1 - ease);
                    newComp.alpha = 1 - ease * 0.3;
                    oldComp.alpha = 0.7 + ease * 0.3;
                } else {
                    newComp.x = this._w * (1 - ease);
                    oldComp.x = -this._w * 0.3 * ease;
                    newComp.alpha = 0.7 + ease * 0.3;
                    oldComp.alpha = 1 - ease * 0.3;
                }
            } else if (type === 'fade') {
                if (reverse) {
                    newComp.alpha = 1 - ease;
                    oldComp.alpha = ease;
                } else {
                    newComp.alpha = ease;
                    oldComp.alpha = 1 - ease;
                }
            }

            if (t >= 1) {
                PIXI.ticker.shared.remove(tweenFn);
                this._transitioning = false;
                oldComp.interactiveChildren = true;
                newComp.interactiveChildren = true;
                newComp.x = 0;
                newComp.alpha = 1;
                oldComp.x = 0;
                oldComp.alpha = 1;
                callback();
            }
        };

        if (type === 'slide') {
            if (reverse) {
                newComp.x = 0;
                oldComp.x = -this._w * 0.3;
            } else {
                newComp.x = this._w;
                oldComp.x = 0;
            }
        } else if (type === 'fade') {
            if (reverse) {
                newComp.alpha = 1;
                oldComp.alpha = 0;
            } else {
                newComp.alpha = 0;
                oldComp.alpha = 1;
            }
        }

        PIXI.ticker.shared.add(tweenFn);
    }

    addChild(child) {
        return this._content.addChild(child);
    }

    removeChild(child) {
        return this._content.removeChild(child);
    }
}

export default Router
