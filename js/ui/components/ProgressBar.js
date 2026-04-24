import * as PIXI from '../common/pixi';
import { drawRoundedRect } from '../common/utils';
import { COLOR } from '../common/styles';

export class ProgressBar extends PIXI.Container {
    constructor({ width, height, color = COLOR.primary } = {}) {
        super();
        this._w = width;
        this._h = height;
        this._color = color;
        this._progress = 0;

        this._track = new PIXI.Graphics();
        this.addChild(this._track);

        this._fill = new PIXI.Graphics();
        this.addChild(this._fill);

        this._draw();
    }

    get progress() {
        return this._progress;
    }

    set progress(v) {
        this._progress = v;
        this._draw();
    }

    _draw() {
        const { _w: w, _h: h, _color: color } = this;
        const p = Math.max(0, Math.min(100, this._progress));

        this._track.clear();
        drawRoundedRect(this._track, 0, 0, w, h, h / 2, COLOR.surface, COLOR.border);

        this._fill.clear();
        if (p > 0) {
            this._fill.beginFill(color);
            this._fill.drawRoundedRect(3, 3, Math.max(8, (w - 6) * p / 100), h - 6, (h - 6) / 2);
            this._fill.endFill();
        }
    }
}

export default ProgressBar
