import PIXI from '../ui/common/pixi';
import { Button, Icon, Input, ScrollBox, Page, Toast, logger } from '../ui/index';
import { COLOR, SIZE, FONT } from '../ui/common/styles';
import { ALL_ICONS } from '../ui/icons/index';

const DEFAULT_ICONS = [
    'home', 'menu', 'search', 'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right',
    'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right', 'check', 'x', 'plus',
    'minus', 'edit', 'trash-2', 'copy', 'eye', 'eye-off', 'lock', 'unlock', 'user',
    'users', 'settings', 'bell', 'mail', 'phone', 'calendar', 'clock', 'star', 'heart',
    'bookmark', 'flag', 'tag', 'folder', 'file', 'image', 'camera', 'video', 'music',
    'mic', 'volume-2', 'wifi', 'bluetooth', 'battery', 'monitor', 'smartphone', 'tablet',
    'laptop', 'globe', 'map-pin', 'navigation', 'compass', 'link', 'external-link',
    'download', 'upload', 'share', 'refresh-cw', 'rotate-cw', 'undo', 'redo', 'filter',
    'list', 'grid-2x2', 'layout', 'sidebar', 'maximize', 'minimize', 'zoom-in', 'zoom-out',
    'info', 'alert-triangle', 'alert-circle', 'circle-check', 'circle-x', 'help-circle',
    'loader', 'activity', 'bar-chart', 'pie-chart', 'trending-up', 'trending-down',
    'database', 'server', 'cloud', 'cloud-off', 'code', 'terminal', 'git-branch',
    'package', 'box', 'layers', 'cpu', 'hard-drive', 'send', 'log-in', 'log-out',
];

export default class BasicPage extends Page {
    constructor(w, h) {
        super(w, h);
        this._cols = 5;
        this._iconSize = 64;
        this._cellW = Math.floor((w - SIZE.pad * 2 - 24 * 2) / this._cols);
        this._cellH = 145;
        this._build();
    }

    _build() {
        const w = this._w;
        let y = 100;

        const title = new PIXI.Text('基础组件', { fontSize: SIZE.textSizeXxl, fill: COLOR.white, fontWeight: 'bold', fontFamily: FONT });
        title.x = SIZE.pad;
        title.y = y;
        this.addChild(title);
        y += 80;

        // === Button ===
        let secLabel = new PIXI.Text('按钮 Button', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        secLabel.x = SIZE.pad;
        secLabel.y = y;
        this.addChild(secLabel);
        y += 50;

        const btnPrimary = new Button({
            text: '主要按钮', width: SIZE.btnW, height: SIZE.btnH, color: COLOR.primary,
            onTap: () => logger.info('[Button] 主要按钮'),
        });
        btnPrimary.x = SIZE.pad;
        btnPrimary.y = y;
        this.addChild(btnPrimary);

        const btnSuccess = new Button({
            text: '成功按钮', width: SIZE.btnW, height: SIZE.btnH, color: COLOR.success,
            onTap: () => logger.info('[Button] 成功按钮'),
        });
        btnSuccess.x = SIZE.pad + SIZE.btnW + 40;
        btnSuccess.y = y;
        this.addChild(btnSuccess);
        y += SIZE.btnH + 30;

        const btnWarn = new Button({
            text: '警告按钮', width: SIZE.btnW, height: SIZE.btnH, color: COLOR.warning, textColor: COLOR.textDark,
            onTap: () => logger.info('[Button] 警告按钮'),
        });
        btnWarn.x = SIZE.pad;
        btnWarn.y = y;
        this.addChild(btnWarn);

        const btnDanger = new Button({
            text: '危险按钮', width: SIZE.btnW, height: SIZE.btnH, color: COLOR.danger,
            onTap: () => logger.info('[Button] 危险按钮'),
        });
        btnDanger.x = SIZE.pad + SIZE.btnW + 40;
        btnDanger.y = y;
        this.addChild(btnDanger);
        y += SIZE.btnH + 30;

        const btnDisabled = new Button({
            text: '禁用按钮', width: SIZE.btnW, height: SIZE.btnH, color: 0x555555,
            textColor: COLOR.textSec, disabled: true,
        });
        btnDisabled.x = SIZE.pad;
        btnDisabled.y = y;
        this.addChild(btnDisabled);
        y += SIZE.btnH + 60;

        // === Icon (自定义) ===
        secLabel = new PIXI.Text('自定义图标', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        secLabel.x = SIZE.pad;
        secLabel.y = y;
        this.addChild(secLabel);
        y += 50;

        const customIcon = new Icon({ path: 'images/logo.png', size: 64 });
        customIcon.x = SIZE.pad;
        customIcon.y = y;
        this.addChild(customIcon);

        const customLabel = new PIXI.Text('自定义图标 (path: images/logo.png)', {
            fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT,
        });
        customLabel.x = SIZE.pad + 80;
        customLabel.y = y + 16;
        this.addChild(customLabel);
        y += 90;

        // 网络图标
        if (typeof wx !== 'undefined' && typeof wx.downloadFile === 'function') {
            const netIcon = new Icon({ width: 155, height: 122 });
            netIcon.x = SIZE.pad;
            netIcon.y = y;
            this.addChild(netIcon);

            const netLabel = new PIXI.Text('网络图标 (加载中...)', {
                fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT,
            });
            netLabel.x = SIZE.pad + 165;
            netLabel.y = y + 40;
            this.addChild(netLabel);

            wx.downloadFile({
                url: 'https://ys.mihoyo.com/main/_nuxt/img/logo.38d3f3b.png',
                success: (res) => {
                    netIcon.setPath(res.tempFilePath);
                    netLabel.text = '网络图标 (已加载)';
                    netIcon.interactive = true;
                    netIcon.on('pointertap', () => Toast.show({ text: '原神启动' }))
                },
                fail: () => {
                    netLabel.text = '网络图标 (加载失败)';
                },
            });
        }
        y += 140;

        // === Icon (图标库) ===
        secLabel = new PIXI.Text('图标库 Icon', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        secLabel.x = SIZE.pad;
        secLabel.y = y;
        this.addChild(secLabel);
        y += 50;

        this._countLabel = new PIXI.Text('', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        this._countLabel.x = SIZE.pad + 200;
        this._countLabel.y = y - 50;
        this.addChild(this._countLabel);

        const searchInput = new Input({
            width: w - SIZE.pad * 2,
            height: 100,
            placeholder: '搜索图标名称...',
            onInput: (v) => this._onSearch(v),
        });
        searchInput.x = SIZE.pad;
        searchInput.y = y;
        this.addChild(searchInput);
        y += 120;

        const scrollH = this._h - y - 60;
        this._scrollBox = new ScrollBox({
            width: w - SIZE.pad * 2,
            height: scrollH,
            padding: 24,
            gap: 8,
            background: COLOR.card,
            border: COLOR.border,
        });
        this._scrollBox.x = SIZE.pad;
        this._scrollBox.y = y;
        this.addChild(this._scrollBox);

        this._renderIcons(DEFAULT_ICONS);
    }

    _onSearch(keyword) {
        const q = keyword.trim().toLowerCase();
        const list = q.length < 2 ? DEFAULT_ICONS : ALL_ICONS.filter(n => n.includes(q));
        this._renderIcons(list);
    }

    _renderIcons(names) {
        const content = this._scrollBox._content;
        while (content.children.length > 0) {
            content.removeChildAt(0);
        }
        this._scrollBox._offset = this._scrollBox._pad;
        this._scrollBox._scroll = 0;
        this._scrollBox._applyScroll();

        this._countLabel.text = `共 ${ALL_ICONS.length} 个`;

        const cols = this._cols;
        const cellW = this._cellW;
        const cellH = this._cellH;
        const iconSize = this._iconSize;

        for (let i = 0; i < names.length; i += cols) {
            const rowNames = names.slice(i, i + cols);
            const row = this._buildRow(rowNames, cellW, cellH, iconSize);
            this._scrollBox.addItem(row);
        }
    }

    _buildRow(names, cellW, cellH, iconSize) {
        const row = new PIXI.Container();
        row._itemH = cellH;

        names.forEach((name, i) => {
            const icon = new Icon({ name, size: iconSize, color: COLOR.white });
            icon.x = i * cellW + (cellW - iconSize) / 2;
            icon.y = 8;
            row.addChild(icon);

            const label = new PIXI.Text(name, {
                fontSize: 28, fill: COLOR.textSec, fontFamily: FONT,
                wordWrap: true, wordWrapWidth: cellW - 8,
                align: 'center',
            });
            label.anchor.set(0.5, 0);
            label.x = i * cellW + cellW / 2;
            label.y = iconSize + 14;
            row.addChild(label);
        });

        return row;
    }
}
