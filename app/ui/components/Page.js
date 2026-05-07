import PIXI from '../common/pixi';
import { nextTick } from '../common/utils';
import { SIZE } from '../common/styles';
import safeArea from '../common/safeArea';
import { ScrollBox } from './ScrollBox';

let _activePageScroller = null;

export class Page extends PIXI.Container {
    constructor(w, h) {
        super();
        this._w = w;
        this._h = h;

        this._bg = new PIXI.Container();
        super.addChild(this._bg);

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

        this._scroller.on('touchstart', () => {
            if (_activePageScroller && _activePageScroller !== this._scroller) {
                this._scroller._scrolling = false;
                return;
            }
            if (this._scroller._contentSize > this._scroller._viewSize) {
                _activePageScroller = this._scroller;
            } else {
                this._scroller._scrolling = false;
            }
        });

        const releaseLock = () => {
            if (_activePageScroller === this._scroller) {
                _activePageScroller = null;
            }
        };
        this._scroller.on('touchend', releaseLock);
        this._scroller.on('touchendoutside', releaseLock);

        this.interactive = true;
        this.hitArea = new PIXI.Rectangle(0, 0, w, h);

        nextTick(() => this._applySafeArea());
    }

    _isNested() {
        let p = this.parent;
        while (p) {
            if (p instanceof Page) return true;
            p = p.parent;
        }
        return false;
    }

    _applySafeArea() {
        if (this._isNested()) return;
        const top = safeArea.top;
        if (top <= 0) return;
        this._scroller._h = this._h - top;
        this._scroller._applyScroll = () => {
            this._scroller._content.y = this._scroller._scroll + top;
        };
        this._scroller._applyScroll();
    }

    addChild(child) {
        return this._scroller.addItem(child);
    }

    addBackground(child) {
        return this._bg.addChild(child);
    }

    removeChild(child) {
        return this._scroller._content.removeChild(child);
    }
}

export default Page
