import * as PIXI from './pixi';

// tapOutside: 点击目标外部区域时触发回调
const _registry = new Map();
let _startY = 0;

function _check(x, y) {
    if (_registry.size === 0) return;
    if (Math.abs(_startY - y) >= 5) return;

    for (const [key, state] of _registry) {
        let inside = false;
        for (const target of state.targets) {
            if (!target.parent) continue;
            const bounds = target.getBounds();
            if (x >= bounds.x && x <= bounds.x + bounds.width &&
                y >= bounds.y && y <= bounds.y + bounds.height) {
                inside = true;
                break;
            }
        }
        if (!inside) {
            console.log(`[tapOutside] outside: key=${key}`);
            state.callback();
        }
    }
}

// 在模块加载时 patch 原型，确保 PIXI bind 时捕获到 patch 后的版本
const imProto = PIXI.interaction.InteractionManager.prototype;
const _origDown = imProto.onPointerDown;
const _origUp = imProto.onPointerUp;

imProto.onPointerDown = function (e) {
    _origDown.call(this, e);
    const t = e.touches && e.touches[0];
    if (t && _registry.size > 0) {
        const p = { x: 0, y: 0 };
        this.mapPositionToPoint(p, t.clientX, t.clientY);
        _startY = p.y;
    }
};

imProto.onPointerUp = function (e) {
    _origUp.call(this, e);
    const ct = e.changedTouches && e.changedTouches[0];
    if (ct) {
        const p = { x: 0, y: 0 };
        this.mapPositionToPoint(p, ct.clientX, ct.clientY);
        console.log(`[tapOutside] pointerUp mapped=(${p.x|0},${p.y|0}), registry=${_registry.size}`);
        _check(p.x, p.y);
    }
};

export const tapOutside = {
    on(key, targets, callback) {
        _registry.set(key, { targets: Array.isArray(targets) ? targets : [targets], callback });
    },

    off(key) {
        _registry.delete(key);
    },
};

export default tapOutside;
