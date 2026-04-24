import * as PIXI from '../common/pixi';
import { isTap } from '../common/utils';
import { COLOR, SIZE } from '../common/styles';
import { ICON_BASE } from '../icons/index';

export class Icon extends PIXI.Container {
    constructor({ name, path, size = SIZE.iconSize, color = COLOR.white, onTap } = {}) {
        super();
        this._size = size;
        this._startY = 0;

        const src = path || `${ICON_BASE}/${name}.png`;
        this._sprite = PIXI.Sprite.fromImage(src);
        this._sprite.width = size;
        this._sprite.height = size;
        this._sprite.tint = color;
        this.addChild(this._sprite);

        if (onTap) {
            this.interactive = true;
            this.hitArea = new PIXI.Rectangle(0, 0, size, size);
            this.on('tap', onTap);
            this._bindEvents();
        }
    }

    _bindEvents() {
        this.on('touchstart', (e) => {
            this._startY = e.data.global.y;
            this.alpha = 0.6;
        });
        const onEnd = (e) => {
            this.alpha = 1;
            if (isTap(this._startY, e.data.global.y)) {
                this.emit('tap');
            }
        };
        this.on('touchend', onEnd);
        this.on('touchendoutside', onEnd);
    }

    setIcon(name) {
        this._sprite.texture = PIXI.Texture.fromImage(`${ICON_BASE}/${name}.png`);
    }

    setColor(color) {
        this._sprite.tint = color;
    }

    setSize(size) {
        this._size = size;
        this._sprite.width = size;
        this._sprite.height = size;
        if (this.hitArea) {
            this.hitArea = new PIXI.Rectangle(0, 0, size, size);
        }
    }
}

export default Icon
