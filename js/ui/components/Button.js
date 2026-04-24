import * as PIXI from '../common/pixi';
import { drawRoundedRect, isTap } from '../common/utils';
import { COLOR, SIZE, FONT } from '../common/styles';

export class Button extends PIXI.Container {
    constructor({ text, width, height, color, textColor = COLOR.white, disabled = false, onTap } = {}) {
        super();
        this._w = width;
        this._h = height;
        this._color = color;
        this._startY = 0;

        this.interactive = !disabled;
        this.hitArea = new PIXI.Rectangle(0, 0, width, height);

        this._inner = new PIXI.Container();
        this._inner.pivot.set(width / 2, height / 2);
        this._inner.x = width / 2;
        this._inner.y = height / 2;
        this.addChild(this._inner);

        this._bg = new PIXI.Graphics();
        drawRoundedRect(this._bg, 0, 0, width, height, SIZE.btnR, color, COLOR.border);
        this._inner.addChild(this._bg);

        this._label = new PIXI.Text(text, { fontSize: SIZE.textSize, fill: textColor, fontFamily: FONT, fontWeight: 'bold' });
        this._label.anchor.set(0.5);
        this._label.x = width / 2;
        this._label.y = height / 2;
        this._inner.addChild(this._label);

        if (disabled) {
            this.alpha = 0.5;
        }

        if (onTap) {
            this.on('tap', onTap);
        }

        this._bindEvents();
    }

    _bindEvents() {
        this.on('touchstart', (e) => {
            console.log(`[Button] touchstart, y=${e.data.global.y}, time=${Date.now()}`);
            this._inner.scale.set(0.95);
            this._startY = e.data.global.y;
        });

        const onTouchEnd = (e) => {
            this._inner.scale.set(1);
        };
        this.on('touchend', onTouchEnd);
        this.on('touchendoutside', onTouchEnd);
    }

    setText(text) {
        this._label.text = text;
    }

    setDisabled(disabled) {
        this.interactive = !disabled;
        this.alpha = disabled ? 0.5 : 1;
    }
}

export default Button
