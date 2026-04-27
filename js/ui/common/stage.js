import PIXI from './pixi';

let _stageInstance = null;
let _screenW = 0;
let _screenH = 0;

export const LAYER = {
    /**
     * 层级0：附加内容层，下拉框等需要显示在基础页面上部的内容放在这一层
     */
    LAYER_0: 0,
    /**
     * 层级1：弹窗层，Dialog 等浮于内容之上的 UI 放在这一层
     */
    LAYER_1: 1,
    /**
     * 层级2：提示层，Toast 等需要显示在最上层的 UI 放在这一层
     */
    LAYER_2: 2,
};

const _layers = [];

export const stage = {
    init(stageInstance, screenW, screenH) {
        _stageInstance = stageInstance;
        _screenW = screenW;
        _screenH = screenH;

        const count = Object.keys(LAYER).length;
        for (let i = 0; i < count; i++) {
            const container = new PIXI.Container();
            _layers[i] = container;
            stageInstance.addChild(container);
        }
    },

    get instance() { return _stageInstance; },
    get screenW() { return _screenW; },
    get screenH() { return _screenH; },

    addTo(layer, child) {
        _layers[layer].addChild(child);
    },

    removeFrom(layer, child) {
        if (child.parent === _layers[layer]) {
            _layers[layer].removeChild(child);
        }
    },
};

export default stage;
