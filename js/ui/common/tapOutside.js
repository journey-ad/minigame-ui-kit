// tapOutside: 点击目标外部区域时触发回调
const _registry = new Map();
let _startY = 0;
let _hooked = false;

function _check(x, y) {
    if (_registry.size === 0) return;
    if (Math.abs(_startY - y) >= 5) return;

    for (const [, state] of _registry) {
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
            state.callback();
        }
    }
}

export const tapOutside = {
    hookRenderer(renderer) {
        if (_hooked || !renderer) return;
        _hooked = true;

        const im = renderer.plugins.interaction;
        const origDown = im.onPointerDown.bind(im);
        const origUp = im.onPointerUp.bind(im);

        im.onPointerDown = (e) => {
            origDown(e);
            const t = e.touches && e.touches[0];
            if (t && _registry.size > 0) {
                _startY = t.clientY;
            }
        };
        im.onPointerUp = (e) => {
            origUp(e);
            const ct = e.changedTouches && e.changedTouches[0];
            if (ct) {
                _check(ct.clientX, ct.clientY);
            }
        };
    },

    on(key, targets, callback) {
        _registry.set(key, { targets: Array.isArray(targets) ? targets : [targets], callback });
    },

    off(key) {
        _registry.delete(key);
    },
};

export default tapOutside;
