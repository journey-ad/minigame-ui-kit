import Modal from './Modal';
import stage, { LAYER } from '../common/stage';

export const Dialog = {
    alert(options = {}) {
        return new Promise((resolve) => {
            const modal = new Modal({
                ...options,
                screenW: stage.screenW,
                screenH: stage.screenH,
                showConfirmButton: true,
                showCancelButton: false,
                onConfirm: resolve,
            });
            stage.addTo(LAYER.LAYER_1, modal);
        });
    },

    confirm(options = {}) {
        return new Promise((resolve, reject) => {
            const modal = new Modal({
                ...options,
                screenW: stage.screenW,
                screenH: stage.screenH,
                showConfirmButton: options.showConfirmButton !== false,
                showCancelButton: options.showCancelButton !== false,
                onConfirm: resolve,
                onCancel: reject,
            });
            stage.addTo(LAYER.LAYER_1, modal);
        });
    },
};

export default Dialog;
