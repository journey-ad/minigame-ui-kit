import * as PIXI from '../../libs/pixi.min';
import { Icon, Page, COLOR, SIZE, FONT } from '../ui/index';

export default class AboutPage extends Page {
    constructor(w, h) {
        super(w, h);
        this._build();
    }

    _build() {
        const w = this._w;
        let y = 160;

        const contentW = w - SIZE.pad * 2;
        const gap = 32;

        const items = [
            this._buildHeader(contentW),
            this._buildIntro(contentW),
            this._buildStats(contentW),
            this._buildInfoList(contentW),
        ];

        for (const item of items) {
            item.x = SIZE.pad;
            item.y = y;
            this.addChild(item);
            y += (item._itemH || item.height) + gap;
        }
    }

    _buildHeader(contentW) {
        const c = new PIXI.Container();
        const iconBgSize = 104;
        const iconSize = 56;
        const radius = 24;

        const bg = new PIXI.Graphics();
        bg.beginFill(COLOR.primary);
        bg.drawRoundedRect(0, 0, iconBgSize, iconBgSize, radius);
        bg.endFill();
        c.addChild(bg);

        const icon = new Icon({ name: 'monitor', size: iconSize, color: COLOR.white });
        icon.x = (iconBgSize - iconSize) / 2;
        icon.y = (iconBgSize - iconSize) / 2;
        c.addChild(icon);

        const nameText = new PIXI.Text('Pixi UI Kit', {
            fontSize: SIZE.textSizeXl, fill: COLOR.white,
            fontWeight: 'bold', fontFamily: FONT,
        });
        nameText.x = iconBgSize + 32;
        nameText.y = 8;
        c.addChild(nameText);

        const subText = new PIXI.Text('小游戏环境 UI 组件库', {
            fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT,
        });
        subText.x = iconBgSize + 32;
        subText.y = nameText.y + nameText.height + 8;
        c.addChild(subText);

        const badgeText = new PIXI.Text('v1.0.0', {
            fontSize: SIZE.textSizeSm, fill: COLOR.primary, fontFamily: FONT,
        });
        const badgePadX = 24;
        const badgePadY = 12;
        const badgeW = badgeText.width + badgePadX * 2;
        const badgeH = badgeText.height + badgePadY * 2;

        const badge = new PIXI.Graphics();
        badge.beginFill(COLOR.surface);
        badge.drawRoundedRect(0, 0, badgeW, badgeH, 12);
        badge.endFill();
        badge.x = contentW - badgeW;
        badge.y = (iconBgSize - badgeH) / 2;
        c.addChild(badge);

        badgeText.x = badge.x + badgePadX;
        badgeText.y = badge.y + badgePadY;
        c.addChild(badgeText);

        const divider = new PIXI.Graphics();
        divider.beginFill(COLOR.divider);
        divider.drawRect(0, iconBgSize + 24, contentW, 1);
        divider.endFill();
        c.addChild(divider);

        c._itemH = iconBgSize + 25;
        return c;
    }

    _buildIntro(contentW) {
        const t = new PIXI.Text(
            '基于 PixiJS v4 构建，内置 20+ 组件，方便快速搭建演示 Demo',
            {
                fontSize: SIZE.textSize, fill: COLOR.text, fontFamily: FONT,
                wordWrap: true, wordWrapWidth: contentW,
                lineHeight: SIZE.textSize * 1.7,
            }
        );
        t._itemH = t.height;
        return t;
    }

    _buildStats(contentW) {
        const c = new PIXI.Container();
        const gap = 20;
        const cols = 2;
        const cardW = (contentW - gap) / cols;
        const cardH = 140;
        const radius = 16;

        const stats = [
            { value: '22',     label: 'UI 组件',  color: COLOR.primary },
            { value: '1943',   label: '内置图标', color: COLOR.warning },
            { value: 'v4.8.9', label: 'PixiJS',   color: COLOR.success },
            { value: '57',     label: '主题色板', color: COLOR.info },
        ];

        stats.forEach((stat, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = col * (cardW + gap);
            const y = row * (cardH + gap);

            const bg = new PIXI.Graphics();
            bg.beginFill(COLOR.surface);
            bg.drawRoundedRect(0, 0, cardW, cardH, radius);
            bg.endFill();
            bg.x = x;
            bg.y = y;
            c.addChild(bg);

            const valText = new PIXI.Text(stat.value, {
                fontSize: SIZE.textSizeXl, fill: stat.color,
                fontWeight: 'bold', fontFamily: FONT,
            });
            valText.x = x + 28;
            valText.y = y + 24;
            c.addChild(valText);

            const lblText = new PIXI.Text(stat.label, {
                fontSize: SIZE.textSizeXs, fill: COLOR.textSec, fontFamily: FONT,
            });
            lblText.x = x + 28;
            lblText.y = y + cardH - lblText.height - 20;
            c.addChild(lblText);
        });

        const rows = Math.ceil(stats.length / cols);
        c._itemH = rows * cardH + (rows - 1) * gap;
        return c;
    }

    _buildInfoList(contentW) {
        const c = new PIXI.Container();
        const radius = 16;
        const rowH = 88;
        const padX = 32;
        const rows = [
            { key: '引擎',   val: 'PixiJS v4.8.9' },
            { key: '平台',   val: '微信小游戏' },
            { key: '图标库', val: 'Lucide Icons' },
        ];
        const totalH = rows.length * rowH;

        const bg = new PIXI.Graphics();
        bg.beginFill(COLOR.surface);
        bg.drawRoundedRect(0, 0, contentW, totalH, radius);
        bg.endFill();
        c.addChild(bg);

        rows.forEach((row, i) => {
            const y = i * rowH;

            if (i > 0) {
                const line = new PIXI.Graphics();
                line.beginFill(COLOR.divider);
                line.drawRect(padX, y, contentW - padX * 2, 1);
                line.endFill();
                c.addChild(line);
            }

            const keyText = new PIXI.Text(row.key, {
                fontSize: SIZE.textSize, fill: COLOR.textSec, fontFamily: FONT,
            });
            keyText.x = padX;
            keyText.y = y + (rowH - keyText.height) / 2;
            c.addChild(keyText);

            const valText = new PIXI.Text(row.val, {
                fontSize: SIZE.textSize, fill: COLOR.text, fontFamily: FONT,
            });
            valText.x = contentW - padX - valText.width;
            valText.y = y + (rowH - valText.height) / 2;
            c.addChild(valText);
        });

        c._itemH = totalH;
        return c;
    }
}
