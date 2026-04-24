import * as PIXI from '../common/pixi';
import { COLOR, SIZE } from '../common/styles';
import { ICON_BASE } from '../icons/index';

export class Icon extends PIXI.Container {
    constructor({ name, path, size = SIZE.iconSize, color = COLOR.white } = {}) {
        super();
        this._size = size;

        const src = path || `${ICON_BASE}/${name}.png`;
        this._sprite = PIXI.Sprite.fromImage(src);
        this._sprite.width = size;
        this._sprite.height = size;
        this._sprite.tint = color;
        this.addChild(this._sprite);
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
    }
}

export default Icon
