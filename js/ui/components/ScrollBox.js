import * as PIXI from '../common/pixi';
import { drawRoundedRect } from '../common/utils';
import { COLOR } from '../common/styles';
import logger from '../common/logger';

export class ScrollBox extends PIXI.Container {
    constructor({ width, height, items = [], gap = 16, direction = 'vertical', padding = 20, border = COLOR.border, background = COLOR.card, radius = 16 } = {}) {
        super();
        this._w = width;
        this._h = height;
        this._gap = gap;
        this._pad = padding;
        this._dir = direction;
        this._isH = direction === 'horizontal';
        this._offset = this._pad;
        this._scroll = 0;
        this._last = 0;
        this._scrolling = false;
        this._velocity = 0;
        this._lastTime = 0;
        this._friction = 0.95;
        this._bounceMinCap = this._isH ? 40 : 60;
        this._bounceMaxCap = this._isH ? 120 : 200;
        this._bounceRatio = 0.2;
        this._bounceRate = this._isH ? 0.25 : 0.125;
        this._dirLocked = false;
        this._startX = 0;
        this._startY = 0;
        this._dirThreshold = 8;

        this.interactive = true;
        this.hitArea = new PIXI.Rectangle(0, 0, width, height);

        const bg = new PIXI.Graphics();
        if (background != null) {
            drawRoundedRect(bg, 0, 0, width, height, radius, background, border);
        }
        this.addChild(bg);

        this._mask = new PIXI.Graphics();
        this._mask.beginFill(0xFFFFFF);
        this._mask.drawRoundedRect(0, 0, width, height, radius);
        this._mask.endFill();
        this.addChild(this._mask);

        this._content = new PIXI.Container();
        this._content.mask = this._mask;
        this.addChild(this._content);

        for (const item of items) {
            this._appendItem(item);
        }

        this._bindEvents();
        this._startTicker();
    }

    _appendItem(item) {
        if (this._isH) {
            item.x = this._offset;
            item.y = this._pad;
        } else {
            item.x = this._pad;
            item.y = this._offset;
        }
        this._content.addChild(item);
        this._offset += (this._isH ? (item._itemW || item.width) : (item._itemH || item.height)) + this._gap;
    }

    addItem(item) {
        this._appendItem(item);
    }

    get _contentSize() {
        return this._offset;
    }

    get _viewSize() {
        return this._isH ? this._w : this._h;
    }

    get _minScroll() {
        return Math.min(0, -(this._contentSize - this._viewSize + this._pad));
    }

    get _bounceMax() {
        const overflow = Math.max(0, this._contentSize - this._viewSize);
        return Math.min(this._bounceMaxCap, Math.max(this._bounceMinCap, overflow * this._bounceRatio));
    }

    _clampWithBounce(v) {
        if (v > this._bounceMax) return this._bounceMax;
        if (v < this._minScroll - this._bounceMax) return this._minScroll - this._bounceMax;
        return v;
    }

    _dampenOverscroll(d) {
        if (this._scroll > 0 && d > 0) {
            const ratio = Math.min(this._scroll / this._bounceMax, 1);
            return d * Math.max(0.02, (1 - ratio) * (1 - ratio));
        }
        if (this._scroll < this._minScroll && d < 0) {
            const ratio = Math.min((this._minScroll - this._scroll) / this._bounceMax, 1);
            return d * Math.max(0.02, (1 - ratio) * (1 - ratio));
        }
        return d;
    }

    _bindEvents() {
        this.on('touchstart', (e) => {
            logger.debug(`[ScrollBox] touchstart, globalY=${e.data.global.y}, time=${Date.now()}`);
            this._startX = e.data.global.x;
            this._startY = e.data.global.y;
            this._last = this._isH ? e.data.global.x : e.data.global.y;
            this._lastTime = Date.now();
            this._velocity = 0;
            this._scrolling = true;
            this._dirLocked = false;
        });

        this.on('touchmove', (e) => {
            if (!this._scrolling) return;

            // 锁定拖动方向，避免影响父级的滚动
            if (!this._dirLocked) {
                const dx = Math.abs(e.data.global.x - this._startX);
                const dy = Math.abs(e.data.global.y - this._startY);
                if (Math.max(dx, dy) < this._dirThreshold) return;
                const movingH = dx > dy;
                if (movingH !== this._isH) {
                    this._scrolling = false;
                    return;
                }
                const d = (this._isH ? e.data.global.x : e.data.global.y) - (this._isH ? this._startX : this._startY);
                if ((this._scroll >= 0 && d > 0) || (this._scroll <= this._minScroll && d < 0)) {
                    this._scrolling = false;
                    return;
                }
                this._dirLocked = true;
            }
            e.stopPropagation();

            const cur = this._isH ? e.data.global.x : e.data.global.y;
            const now = Date.now();
            const dt = now - this._lastTime;
            const d = cur - this._last;
            if (dt > 0) this._velocity = d / dt * 16;
            this._last = cur;
            this._lastTime = now;
            this._scroll = this._clampWithBounce(this._scroll + this._dampenOverscroll(d));
            this._applyScroll();
        });

        const onEnd = () => { this._scrolling = false; this._dirLocked = false; };
        this.on('touchend', onEnd);
        this.on('touchendoutside', onEnd);
    }

    _applyScroll() {
        if (this._isH) {
            this._content.x = this._scroll;
        } else {
            this._content.y = this._scroll;
        }
    }

    _startTicker() {
        PIXI.ticker.shared.add(() => {
            if (this._scrolling) return;
            let moved = false;

            if (Math.abs(this._velocity) > 0.5) {
                this._scroll = this._clampWithBounce(this._scroll + this._dampenOverscroll(this._velocity));
                this._velocity *= this._friction;
                moved = true;
            } else {
                this._velocity = 0;
            }

            if (this._scroll > 0) {
                this._scroll += (0 - this._scroll) * this._bounceRate;
                if (Math.abs(this._scroll) < 0.5) this._scroll = 0;
                this._velocity = 0;
                moved = true;
            } else if (this._scroll < this._minScroll) {
                this._scroll += (this._minScroll - this._scroll) * this._bounceRate;
                if (Math.abs(this._scroll - this._minScroll) < 0.5) this._scroll = this._minScroll;
                this._velocity = 0;
                moved = true;
            }

            if (moved) this._applyScroll();
        });
    }
}

export default ScrollBox
