import PIXI from '../common/pixi';
import { SIZE } from '../common/styles';
import { ScrollBox } from './ScrollBox';

export class Page extends PIXI.Container {
    constructor(w, h) {
        super();
        this._w = w;
        this._h = h;

        this._scroller = new ScrollBox({
            width: w,
            height: h,
            freeLayout: true,
            background: null,
            border: null,
            radius: 0,
            padding: SIZE.pad,
            gap: 0,
        });
        super.addChild(this._scroller);

        this.interactive = true;
        this.hitArea = new PIXI.Rectangle(0, 0, w, h);
    }

    addChild(child) {
        return this._scroller.addItem(child);
    }

    removeChild(child) {
        return this._scroller._content.removeChild(child);
    }
}

export default Page
