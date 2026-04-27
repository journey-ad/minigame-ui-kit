import PIXI from '../common/pixi';
import { isTap, lerpColor } from '../common/utils';
import { COLOR, SIZE, FONT } from '../common/styles';

export class Radio extends PIXI.Container {
    constructor({ items = [], value = 0, onChange } = {}) {
        super();
        this._items = items;
        this._value = value;
        this._circles = [];
        this._startY = 0;

        const outerR = 24;
        const innerR = 12;
        const rowH = 70;
        this._outerR = outerR;
        this._innerR = innerR;
        this._rowH = rowH;

        this._progresses = items.map((_, idx) => idx === value ? 1 : 0);

        if (onChange) {
            this.on('change', onChange);
        }

        items.forEach((text, idx) => {
            const row = new PIXI.Container();
            row.interactive = true;
            row.y = idx * rowH;

            // 外圈
            const outer = new PIXI.Graphics();
            row.addChild(outer);

            // 内圆
            const inner = new PIXI.Graphics();
            row.addChild(inner);

            this._circles.push({ outer, inner });

            // 文字
            const label = new PIXI.Text(text, { fontSize: SIZE.textSize, fill: COLOR.text, fontFamily: FONT });
            label.x = outerR * 2 + 16;
            label.y = (outerR * 2 - label.height) / 2;
            row.addChild(label);

            row.hitArea = new PIXI.Rectangle(0, 0, outerR * 2 + 16 + label.width, outerR * 2);

            row.on('touchstart', (e) => { this._startY = e.data.global.y; });
            const onEnd = (e) => {
                if (isTap(this._startY, e.data.global.y)) {
                    this.value = idx;
                }
            };
            row.on('touchend', onEnd);
            row.on('touchendoutside', onEnd);

            this.addChild(row);
        });

        this._draw();
    }

    get value() {
        return this._value;
    }

    set value(idx) {
        if (idx === this._value) return;
        const prev = this._value;
        this._value = idx;
        this._animate(prev, idx);
        this.emit('change', idx, this._items[idx]);
    }

    _animate(fromIdx, toIdx) {
        if (this._tweenFn) {
            PIXI.ticker.shared.remove(this._tweenFn);
        }

        const startFrom = this._progresses[fromIdx];
        const startTo = this._progresses[toIdx];
        const duration = 120;
        let elapsed = 0;

        this._tweenFn = () => {
            elapsed += PIXI.ticker.shared.elapsedMS;
            const t = Math.min(elapsed / duration, 1);
            const ease = t * (2 - t);
            this._progresses[fromIdx] = startFrom + (0 - startFrom) * ease;
            this._progresses[toIdx] = startTo + (1 - startTo) * ease;
            this._renderFrame();
            if (t >= 1) {
                PIXI.ticker.shared.remove(this._tweenFn);
                this._tweenFn = null;
            }
        };
        PIXI.ticker.shared.add(this._tweenFn);
    }

    _draw() {
        this._renderFrame();
    }

    _renderFrame() {
        const { _outerR: oR, _innerR: iR } = this;

        this._circles.forEach(({ outer, inner }, idx) => {
            const p = this._progresses[idx];
            const borderColor = lerpColor(COLOR.border, COLOR.primary, p);

            outer.clear();
            outer.lineStyle(3, borderColor);
            outer.drawCircle(oR, oR, oR - 2);
            outer.lineStyle(0);

            inner.clear();
            if (p > 0) {
                inner.beginFill(COLOR.primary, p);
                inner.drawCircle(oR, oR, iR * p);
                inner.endFill();
            }
        });
    }
}

export default Radio
