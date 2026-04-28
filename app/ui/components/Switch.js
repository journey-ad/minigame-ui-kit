import PIXI from '../common/pixi';
import { isTap, lerpColor } from '../common/utils';
import { COLOR } from '../common/styles';

export class Switch extends PIXI.Container {
    constructor({ checked = false, disabled = false, onChange } = {}) {
        super();
        this._checked = checked;
        this._disabled = disabled;
        this._startY = 0;

        const trackW = 100;
        const trackH = 56;
        const thumbR = 22;
        const thumbPad = 6;

        this._trackW = trackW;
        this._trackH = trackH;
        this._thumbR = thumbR;
        this._thumbPad = thumbPad;

        this.interactive = !disabled;
        this.hitArea = new PIXI.Rectangle(0, 0, trackW, trackH);

        this._track = new PIXI.Graphics();
        this.addChild(this._track);

        this._thumb = new PIXI.Graphics();
        this.addChild(this._thumb);

        if (disabled) {
            this.alpha = 0.5;
        }

        if (onChange) {
            this.on('change', onChange);
        }

        this._draw();
        this._bindEvents();
    }

    get checked() {
        return this._checked;
    }

    set checked(val) {
        this._checked = !!val;
        this._draw(true);
    }

    _draw(animate = false) {
        const { _trackW: tw, _thumbR: r, _thumbPad: pad, _checked: on } = this;
        const targetX = on ? tw - pad - r : pad + r;

        if (!animate) {
            this._thumbX = targetX;
            this._progress = on ? 1 : 0;
            this._renderFrame();
            return;
        }

        if (this._tweenFn) {
            PIXI.ticker.shared.remove(this._tweenFn);
        }

        const startX = this._thumbX;
        const startProgress = this._progress;
        const targetProgress = on ? 1 : 0;
        const duration = 150;
        let elapsed = 0;

        this._tweenFn = () => {
            elapsed += PIXI.ticker.shared.elapsedMS;
            const t = Math.min(elapsed / duration, 1);
            const ease = t * (2 - t);
            this._thumbX = startX + (targetX - startX) * ease;
            this._progress = startProgress + (targetProgress - startProgress) * ease;
            this._renderFrame();
            if (t >= 1) {
                PIXI.ticker.shared.remove(this._tweenFn);
                this._tweenFn = null;
            }
        };
        PIXI.ticker.shared.add(this._tweenFn);
    }

    _renderFrame() {
        const { _track: track, _thumb: thumb, _trackW: tw, _trackH: th, _thumbR: r } = this;
        const p = this._progress;

        const color = lerpColor(COLOR.surface, COLOR.primary, p);

        track.clear();
        track.beginFill(color);
        track.drawRoundedRect(0, 0, tw, th, th / 2);
        track.endFill();
        track.lineStyle(2, COLOR.border);
        track.drawRoundedRect(0, 0, tw, th, th / 2);
        track.lineStyle(0);

        thumb.clear();
        thumb.beginFill(COLOR.white);
        thumb.drawCircle(this._thumbX, th / 2, r);
        thumb.endFill();
    }

    _bindEvents() {
        this.on('touchstart', (e) => {
            this._startY = e.data.global.y;
        });

        const onEnd = (e) => {
            if (isTap(this._startY, e.data.global.y)) {
                this._checked = !this._checked;
                this._draw(true);
                this.emit('change', this._checked);
            }
        };
        this.on('touchend', onEnd);
        this.on('touchendoutside', onEnd);
    }

    setDisabled(disabled) {
        this._disabled = disabled;
        this.interactive = !disabled;
        this.alpha = disabled ? 0.5 : 1;
    }

    destroy(options) {
        if (this._tweenFn) {
            PIXI.ticker.shared.remove(this._tweenFn);
            this._tweenFn = null;
        }
        super.destroy(options);
    }
}

export default Switch
