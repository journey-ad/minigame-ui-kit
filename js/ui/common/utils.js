import * as PIXI from './pixi';

export function drawRoundedRect(g, x, y, w, h, r, fill, border) {
    if (border) {
        g.beginFill(border);
        g.drawRoundedRect(x, y, w, h, r);
        g.endFill();
        g.beginFill(fill);
        g.drawRoundedRect(x + 3, y + 3, w - 6, h - 6, r - 2);
        g.endFill();
    } else {
        g.beginFill(fill);
        g.drawRoundedRect(x, y, w, h, r);
        g.endFill();
    }
}

export function isTap(startY, endY, threshold = 5) {
    return Math.abs(startY - endY) < threshold;
}

export function lerpColor(a, b, t) {
    const blend = (ch) => {
        const va = (a >> ch * 8) & 0xFF;
        const vb = (b >> ch * 8) & 0xFF;
        return Math.round(va + (vb - va) * t);
    };
    return (blend(2) << 16) | (blend(1) << 8) | blend(0);
}

export function nextTick(fn) {
    const wrap = () => {
        PIXI.ticker.shared.remove(wrap);
        fn();
    };
    PIXI.ticker.shared.add(wrap);
}
