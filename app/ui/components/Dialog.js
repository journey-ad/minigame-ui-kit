import Modal from './Modal';
import stage, { LAYER } from '../common/stage';
import logger from '../common/logger';

export const Dialog = {
    alert(options = {}) {
        logger.debug('[Dialog] alert', options.title || '');
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
        logger.debug('[Dialog] confirm', options.title || '');
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
