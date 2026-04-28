import PIXI from '../common/pixi';
import { COLOR, SIZE } from '../common/styles';
import { ICON_BASE } from '../icons/index';

export class Icon extends PIXI.Container {
    constructor({ name, path, size = SIZE.iconSize, width, height, color = COLOR.white } = {}) {
        super();
        const w = width ?? size;
        const h = height ?? size;
        this._size = size;

        const src = path ? path : name ? `${ICON_BASE}/${name}.png` : null;
        this._sprite = src ? PIXI.Sprite.fromImage(src) : new PIXI.Sprite(PIXI.Texture.EMPTY);
        this._sprite.width = w;
        this._sprite.height = h;
        this._sprite.tint = color;
        this.addChild(this._sprite);
    }

    setIcon(name) {
        this._sprite.texture = PIXI.Texture.fromImage(`${ICON_BASE}/${name}.png`);
    }

    setPath(path) {
        this._sprite.texture = PIXI.Texture.fromImage(path);
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
