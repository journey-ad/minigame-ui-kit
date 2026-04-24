import * as PIXI from '../../libs/pixi.min';
import { Button, Dialog, Toast, Loading, ActionSheet, Overlay, Page, logger, COLOR, SIZE, FONT } from '../ui/index';

export default class FeedbackPage extends Page {
    constructor(w, h) {
        super(w, h);
        this._build();
    }

    _build() {
        let y = 20;

        const title = new PIXI.Text('反馈组件', { fontSize: SIZE.textSizeXxl, fill: COLOR.white, fontWeight: 'bold', fontFamily: FONT });
        title.x = SIZE.pad;
        title.y = y;
        this.addChild(title);
        y += 80;

        // === Dialog ===
        let secLabel = new PIXI.Text('弹窗 Dialog', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        secLabel.x = SIZE.pad;
        secLabel.y = y;
        this.addChild(secLabel);
        y += 50;

        const btnAlert = new Button({
            text: 'Alert 弹窗', width: SIZE.btnW, height: SIZE.btnH, color: COLOR.primary,
            onTap: () => {
                Dialog.alert({
                    title: '提示',
                    message: '这是一个 Alert 弹窗\n点击确认关闭',
                    animation: 'fade',
                }).then(() => {
                    logger.info('[Dialog] alert closed');
                });
            },
        });
        btnAlert.x = SIZE.pad;
        btnAlert.y = y;
        this.addChild(btnAlert);

        const btnConfirm = new Button({
            text: 'Confirm 弹窗', width: SIZE.btnW, height: SIZE.btnH, color: COLOR.warning, textColor: COLOR.textDark,
            onTap: () => {
                Dialog.confirm({
                    title: '确认操作',
                    message: '是否确认执行此操作？',
                    animation: 'pop',
                }).then(() => {
                    logger.info('[Dialog] confirmed');
                    Toast.show({ text: '已确认', type: 'success' });
                }).catch(() => {
                    logger.info('[Dialog] cancelled');
                    Toast.show({ text: '已取消', type: 'error' });
                });
            },
        });
        btnConfirm.x = SIZE.pad + SIZE.btnW + 40;
        btnConfirm.y = y;
        this.addChild(btnConfirm);
        y += SIZE.btnH + 60;

        // === Toast ===
        secLabel = new PIXI.Text('轻提示 Toast', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        secLabel.x = SIZE.pad;
        secLabel.y = y;
        this.addChild(secLabel);
        y += 50;

        const btnToastOk = new Button({
            text: '成功提示', width: 300, height: SIZE.btnH, color: COLOR.success,
            onTap: () => Toast.show({ text: '操作成功', type: 'success' }),
        });
        btnToastOk.x = SIZE.pad;
        btnToastOk.y = y;
        this.addChild(btnToastOk);

        const btnToastErr = new Button({
            text: '错误提示', width: 300, height: SIZE.btnH, color: COLOR.danger,
            onTap: () => Toast.show({ text: '操作失败', type: 'error' }),
        });
        btnToastErr.x = SIZE.pad + 340;
        btnToastErr.y = y;
        this.addChild(btnToastErr);

        const btnToastWarn = new Button({
            text: '警告提示', width: 300, height: SIZE.btnH, color: COLOR.warning, textColor: COLOR.textDark,
            onTap: () => Toast.show({ text: '请注意', type: 'warning' }),
        });
        btnToastWarn.x = SIZE.pad + 680;
        btnToastWarn.y = y;
        this.addChild(btnToastWarn);
        y += SIZE.btnH + 60;

        // === Loading ===
        secLabel = new PIXI.Text('加载指示器 Loading', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        secLabel.x = SIZE.pad;
        secLabel.y = y;
        this.addChild(secLabel);
        y += 50;

        const loadBtn = new Button({
            text: '显示 Loading', width: 400, height: SIZE.btnH, color: COLOR.primary,
            onTap: () => {
                Loading.show({ text: '加载中...' });
                setTimeout(() => {
                    Loading.hide();
                    Toast.show({ text: '加载完成', type: 'success' });
                }, 2000);
            },
        });
        loadBtn.x = SIZE.pad;
        loadBtn.y = y;
        this.addChild(loadBtn);
        y += SIZE.btnH + 60;

        // === ActionSheet ===
        secLabel = new PIXI.Text('操作面板 ActionSheet', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        secLabel.x = SIZE.pad;
        secLabel.y = y;
        this.addChild(secLabel);
        y += 50;

        const sheetBtn = new Button({
            text: '打开操作面板', width: 400, height: SIZE.btnH, color: COLOR.warning, textColor: COLOR.textDark,
            onTap: () => {
                ActionSheet.show({
                    actions: [
                        { name: '拍照' },
                        { name: '从相册选择' },
                        { name: '保存图片' },
                    ],
                }).then((action) => {
                    Toast.show({ text: `选择了: ${action.name}`, type: 'success' });
                }).catch(() => {
                    logger.info('[ActionSheet] cancelled');
                });
            },
        });
        sheetBtn.x = SIZE.pad;
        sheetBtn.y = y;
        this.addChild(sheetBtn);
        y += SIZE.btnH + 60;

        // === Overlay ===
        secLabel = new PIXI.Text('遮罩层 Overlay', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        secLabel.x = SIZE.pad;
        secLabel.y = y;
        this.addChild(secLabel);
        y += 50;

        const overlayBtn = new Button({
            text: '显示遮罩层', width: 400, height: SIZE.btnH, color: COLOR.surface,
            onTap: () => {
                const overlay = new Overlay({ opacity: 0.6, closeOnTap: true });
                overlay.show();
            },
        });
        overlayBtn.x = SIZE.pad;
        overlayBtn.y = y;
        this.addChild(overlayBtn);

        const overlayBtn2 = new Button({
            text: '半透明遮罩', width: 400, height: SIZE.btnH, color: COLOR.surface,
            onTap: () => {
                const overlay = new Overlay({
                    opacity: 0.3,
                    closeOnTap: true,
                    onTap: () => Toast.show({ text: '遮罩被点击', type: 'success' }),
                });
                overlay.show();
            },
        });
        overlayBtn2.x = SIZE.pad + 440;
        overlayBtn2.y = y;
        this.addChild(overlayBtn2);
    }
}
