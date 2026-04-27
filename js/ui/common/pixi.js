import * as _PIXI from '../libs/pixi.min.js';

const PIXI = typeof window !== 'undefined' ? window.PIXI : _PIXI.default || _PIXI;

// PIXI v4 processInteractive 在命中测试前不更新 worldTransform，导致 hitArea 判定位置错误
const _origProcess = PIXI.interaction.InteractionManager.prototype.processInteractive;
PIXI.interaction.InteractionManager.prototype.processInteractive = function (interactionEvent, displayObject, func, hitTest, interactive) {
    if (displayObject === this.renderer._lastObjectRendered) {
        const saved = displayObject.parent;
        if (!saved) displayObject.parent = this.renderer._tempDisplayObjectParent;
        displayObject.updateTransform();
        if (!saved) displayObject.parent = null;
    }
    return _origProcess.call(this, interactionEvent, displayObject, func, hitTest, interactive);
};

export * from '../libs/pixi.min.js';
export default PIXI;
