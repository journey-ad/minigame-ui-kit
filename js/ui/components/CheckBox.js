import PIXI from '../common/pixi';
import { drawRoundedRect, isTap, lerpColor } from '../common/utils';
import { COLOR, SIZE, FONT } from '../common/styles';

export class CheckBox extends PIXI.Container {
    constructor({ text, checked = false, onChange } = {}) {
        super();
        this._checked = checked;
        this._startY = 0;
        this.interactive = true;

        const size = 52;
        this._size = size;

        this._bg = new PIXI.Graphics();
        this.addChild(this._bg);

        this._label = new PIXI.Text(text, { fontSize: SIZE.textSize, fill: COLOR.text, fontFamily: FONT });
        this._label.x = size + 16;
        this._label.y = (size - this._label.height) / 2;
        this.addChild(this._label);

        this.hitArea = new PIXI.Rectangle(0, 0, size + 16 + this._label.width, size);

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
        const targetProgress = this._checked ? 1 : 0;

        if (!animate) {
            this._progress = targetProgress;
            this._renderFrame();
            return;
        }

        if (this._tweenFn) {
            PIXI.ticker.shared.remove(this._tweenFn);
        }

        const startProgress = this._progress;
        const duration = 120;
        let elapsed = 0;

        this._tweenFn = () => {
            elapsed += PIXI.ticker.shared.elapsedMS;
            const t = Math.min(elapsed / duration, 1);
            const ease = t * (2 - t);
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
        const { _bg: bg, _size: size } = this;
        const p = this._progress;
        const color = lerpColor(COLOR.surface, COLOR.primary, p);

        bg.clear();
        drawRoundedRect(bg, 0, 0, size, size, 10, color, COLOR.border);
        if (p > 0) {
            bg.beginFill(COLOR.white, p);
            bg.drawRoundedRect(14, 24, 24, 6, 2);
            bg.endFill();
            bg.beginFill(COLOR.white, p);
            bg.drawRoundedRect(22, 14, 6, 24, 2);
            bg.endFill();
        }
    }

    _bindEvents() {
        this.on('touchstart', (e) => {
            this._startY = e.data.global.y;
        });

        const onTouchEnd = (e) => {
            if (isTap(this._startY, e.data.global.y)) {
                this._checked = !this._checked;
                this._draw(true);
                this.emit('change', this._checked);
            }
        };
        this.on('touchend', onTouchEnd);
        this.on('touchendoutside', onTouchEnd);
    }
}

export default CheckBox
