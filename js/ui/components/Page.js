import * as PIXI from '../common/pixi';
import { nextTick } from '../common/utils';
import { SIZE } from '../common/styles';

export class Page extends PIXI.Container {
    constructor(w, h) {
        super();
        this._w = w;
        this._h = h;

        this._mask = new PIXI.Graphics();
        this._mask.beginFill(0xFFFFFF);
        this._mask.drawRect(0, 0, w, h);
        this._mask.endFill();
        super.addChild(this._mask);

        this._content = new PIXI.Container();
        this._content.mask = this._mask;
        super.addChild(this._content);

        this.interactive = true;
        this.hitArea = new PIXI.Rectangle(0, 0, w, h);

        nextTick(() => this._enableScroll());
    }

    addChild(child) {
        return this._content.addChild(child);
    }

    removeChild(child) {
        return this._content.removeChild(child);
    }

    get _contentHeight() {
        let max = 0;
        for (let i = 0; i < this._content.children.length; i++) {
            const c = this._content.children[i];
            const bottom = c.y + (c.height || 0);
            if (bottom > max) max = bottom;
        }
        return max + SIZE.pad;
    }

    _enableScroll() {
        this._scroll = 0;
        this._scrolling = false;
        this._canScroll = false;
        this._velocity = 0;
        this._lastY = 0;
        this._lastTime = 0;
        this._friction = 0.97;
        this._bounceMax = 200;
        this._bounceRate = 0.125;

        const minScroll = () => Math.min(0, -(this._contentHeight - this._h));

        const clamp = (v) => {
            const min = minScroll();
            if (v > this._bounceMax) return this._bounceMax;
            if (v < min - this._bounceMax) return min - this._bounceMax;
            return v;
        };

        this.on('touchstart', (e) => {
            console.log(`[Page] touchstart, y=${e.data.global.y}, time=${Date.now()}`);
            this._canScroll = this._contentHeight > this._h;
            this._lastY = e.data.global.y;
            this._lastTime = Date.now();
            this._velocity = 0;
            this._scrolling = true;
        });

        this.on('touchmove', (e) => {
            if (!this._scrolling || !this._canScroll) return;
            const cur = e.data.global.y;
            const now = Date.now();
            const dt = now - this._lastTime;
            const d = cur - this._lastY;
            if (dt > 0) this._velocity = d / dt * 24;
            this._lastY = cur;
            this._lastTime = now;
            this._scroll = clamp(this._scroll + d);
            this._content.y = this._scroll;
        });

        const onEnd = () => { this._scrolling = false; };
        this.on('touchend', onEnd);
        this.on('touchendoutside', onEnd);

        PIXI.ticker.shared.add(() => {
            if (this._scrolling) return;
            let moved = false;
            const min = minScroll();

            if (Math.abs(this._velocity) > 0.5) {
                this._scroll = clamp(this._scroll + this._velocity);
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
            } else if (this._scroll < min) {
                this._scroll += (min - this._scroll) * this._bounceRate;
                if (Math.abs(this._scroll - min) < 0.5) this._scroll = min;
                this._velocity = 0;
                moved = true;
            }

            if (moved) {
                this._content.y = this._scroll;
            }
        });
    }
}

export default Page
