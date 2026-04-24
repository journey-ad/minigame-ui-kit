import * as PIXI from '../common/pixi';
import { drawRoundedRect } from '../common/utils';
import { COLOR } from '../common/styles';
import logger from '../common/logger';

export class Slider extends PIXI.Container {
    constructor({ width, height, min, max, value, color = COLOR.primary, onUpdate } = {}) {
        super();
        this._w = width;
        this._h = height;
        this._min = min;
        this._max = max;
        this._value = value;
        this._color = color;
        this._dragging = false;

        this.interactive = true;
        this.hitArea = new PIXI.Rectangle(0, -height, width, height * 3);

        this._track = new PIXI.Graphics();
        this.addChild(this._track);

        this._fill = new PIXI.Graphics();
        this.addChild(this._fill);

        const handleSize = height + 20;
        this._handle = new PIXI.Graphics();
        this._handle.beginFill(COLOR.border);
        this._handle.drawCircle(0, 0, handleSize / 2);
        this._handle.endFill();
        this._handle.beginFill(COLOR.white);
        this._handle.drawCircle(0, 0, handleSize / 2 - 4);
        this._handle.endFill();
        this._handle.interactive = true;
        this._handle.hitArea = new PIXI.Circle(0, 0, handleSize / 2);
        this.addChild(this._handle);

        if (onUpdate) {
            this.on('update', onUpdate);
        }

        this._draw();
        this._bindEvents();
    }

    _draw() {
        const { _w: w, _h: h, _min: min, _max: max, _value: value, _color: color } = this;
        const ratio = (value - min) / (max - min);

        this._track.clear();
        drawRoundedRect(this._track, 0, -h / 2, w, h, h / 2, COLOR.surface, COLOR.border);

        this._fill.clear();
        if (ratio > 0.01) {
            this._fill.beginFill(color);
            this._fill.drawRoundedRect(3, -h / 2 + 3, Math.max(8, (w - 6) * ratio), h - 6, (h - 6) / 2);
            this._fill.endFill();
        }

        this._handle.x = 3 + (w - 6) * ratio;
        this._handle.y = 0;
    }

    _bindEvents() {
        this._handle.on('touchstart', (e) => {
            e.stopPropagation();
            this._dragging = true;
        });

        this.on('touchstart', (e) => {
            const local = e.data.getLocalPosition(this);
            const ratio = Math.max(0, Math.min(1, local.x / this._w));
            this._value = this._min + ratio * (this._max - this._min);
            this._draw();
            this.emit('update', this._value);
            this._dragging = true;
        });

        this.on('touchmove', (e) => {
            if (!this._dragging) return;
            const local = e.data.getLocalPosition(this);
            const ratio = Math.max(0, Math.min(1, local.x / this._w));
            this._value = this._min + ratio * (this._max - this._min);
            this._draw();
            this.emit('update', this._value);
        });

        const onDragEnd = () => {
            if (this._dragging) {
                logger.debug(`[Slider] value=${Math.round(this._value)}`);
            }
            this._dragging = false;
        };
        this.on('touchend', onDragEnd);
        this.on('touchendoutside', onDragEnd);
    }

    setValue(v) {
        this._value = Math.max(this._min, Math.min(this._max, v));
        this._draw();
    }
}

export default Slider
