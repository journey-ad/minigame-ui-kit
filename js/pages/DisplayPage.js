import * as PIXI from '../../libs/pixi.min';
import { Button, ScrollBox, Swiper, ListItem, ProgressBar, drawRoundedRect, Page, COLOR, SIZE, FONT } from '../ui/index';

export default class DisplayPage extends Page {
    constructor(w, h) {
        super(w, h);
        this._build();
    }

    _build() {
        const w = this._w;
        let y = 20;

        const title = new PIXI.Text('展示组件', { fontSize: SIZE.textSizeXxl, fill: COLOR.white, fontWeight: 'bold', fontFamily: FONT });
        title.x = SIZE.pad;
        title.y = y;
        this.addChild(title);
        y += 80;

        const listW = w - SIZE.pad * 2;

        // === ProgressBar ===
        let secLabel = new PIXI.Text('进度条 ProgressBar', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        secLabel.x = SIZE.pad;
        secLabel.y = y;
        this.addChild(secLabel);
        y += 50;

        const dlLabel = new PIXI.Text('下载进度', { fontSize: SIZE.textSizeSm, fill: COLOR.text, fontFamily: FONT });
        dlLabel.x = SIZE.pad;
        dlLabel.y = y;
        this.addChild(dlLabel);
        const dlVal = new PIXI.Text('0%', { fontSize: SIZE.textSizeSm, fill: COLOR.success, fontFamily: FONT });
        dlVal.x = SIZE.pad + SIZE.sliderW + 60;
        dlVal.y = y;
        this.addChild(dlVal);
        y += 40;

        const dlBar = new ProgressBar({ width: SIZE.sliderW, height: SIZE.sliderH, color: COLOR.success });
        dlBar.x = SIZE.pad;
        dlBar.y = y;
        this.addChild(dlBar);
        y += SIZE.sliderH + 30;

        const expLabel = new PIXI.Text('经验值', { fontSize: SIZE.textSizeSm, fill: COLOR.text, fontFamily: FONT });
        expLabel.x = SIZE.pad;
        expLabel.y = y;
        this.addChild(expLabel);
        const expVal = new PIXI.Text('65%', { fontSize: SIZE.textSizeSm, fill: COLOR.primary, fontFamily: FONT });
        expVal.x = SIZE.pad + SIZE.sliderW + 60;
        expVal.y = y;
        this.addChild(expVal);
        y += 40;

        const expBar = new ProgressBar({ width: SIZE.sliderW, height: SIZE.sliderH, color: COLOR.primary });
        expBar.x = SIZE.pad;
        expBar.y = y;
        expBar.progress = 65;
        this.addChild(expBar);
        y += SIZE.sliderH + 30;

        // 模拟下载
        const status = new PIXI.Text('点击按钮开始模拟下载', { fontSize: SIZE.textSizeSm, fill: COLOR.text, fontFamily: FONT });
        status.x = SIZE.pad;
        status.y = y;
        this.addChild(status);
        y += 50;

        let downloading = false;
        const startBtn = new Button({
            text: '开始下载', width: 300, height: SIZE.btnH, color: COLOR.success,
            onTap: () => {
                if (downloading) return;
                downloading = true;
                status.text = '下载中...';
                startBtn.setText('下载中...');
                let progress = 0;
                const timer = setInterval(() => {
                    progress += 2;
                    dlBar.progress = progress;
                    dlVal.text = `${progress}%`;
                    if (progress >= 100) {
                        clearInterval(timer);
                        status.text = '下载完成!';
                        startBtn.setText('已完成');
                        downloading = false;
                    }
                }, 50);
            },
        });
        startBtn.x = SIZE.pad;
        startBtn.y = y;
        this.addChild(startBtn);
        y += SIZE.btnH + 60;

        // === 垂直列表 ===
        secLabel = new PIXI.Text('垂直列表 List', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        secLabel.x = SIZE.pad;
        secLabel.y = y;
        this.addChild(secLabel);
        y += 50;

        const listBg = new PIXI.Graphics();
        drawRoundedRect(listBg, 0, 0, listW, 380, 16, COLOR.card, COLOR.border);
        listBg.x = SIZE.pad;
        listBg.y = y;
        this.addChild(listBg);

        const listItems = ['游戏设置', '账号管理', '消息通知', '隐私权限', '关于我们'];
        listItems.forEach((text, i) => {
            const li = new ListItem({ width: listW - 40, height: 56, text, showDivider: i > 0 });
            li.x = SIZE.pad + 20;
            li.y = y + 16 + i * 72;
            this.addChild(li);
        });
        y += 400;

        // === 水平标签 ===
        secLabel = new PIXI.Text('水平标签列表', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        secLabel.x = SIZE.pad;
        secLabel.y = y;
        this.addChild(secLabel);
        y += 50;

        const tags = ['全部', '动作', 'RPG', '策略', '休闲', '竞技'];
        let tx = SIZE.pad;
        tags.forEach((name, j) => {
            const btn = new Button({
                text: name, width: 140, height: 64,
                color: j === 0 ? COLOR.primary : COLOR.surface,
                onTap: () => console.log(`[Tag] ${name}`),
            });
            btn.x = tx;
            btn.y = y;
            this.addChild(btn);
            tx += 160;
        });
        y += 90;

        // === ScrollBox 垂直 ===
        secLabel = new PIXI.Text('垂直滚动 ScrollBox', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        secLabel.x = SIZE.pad;
        secLabel.y = y;
        this.addChild(secLabel);
        y += 50;

        const scrollItems = [];
        for (let k = 0; k < 15; k++) {
            const item = new PIXI.Container();
            const itemW = listW - 40;
            const itemH = 90;
            item._itemH = itemH;
            const sBg = new PIXI.Graphics();
            drawRoundedRect(sBg, 0, 0, itemW, itemH, 12, COLOR.surfaceLight, COLOR.border);
            item.addChild(sBg);
            const sLabel = new PIXI.Text(`滚动列表项 #${k + 1}`, { fontSize: SIZE.textSize, fill: COLOR.text, fontFamily: FONT });
            sLabel.x = 20;
            sLabel.y = (itemH - sLabel.height) / 2;
            item.addChild(sLabel);
            scrollItems.push(item);
        }
        const scrollBox = new ScrollBox({ width: listW, height: 480, items: scrollItems, gap: 12 });
        scrollBox.x = SIZE.pad;
        scrollBox.y = y;
        this.addChild(scrollBox);
        y += 500;

        // === 水平卡片滚动 ===
        secLabel = new PIXI.Text('水平卡片滚动', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        secLabel.x = SIZE.pad;
        secLabel.y = y;
        this.addChild(secLabel);
        y += 50;

        const palette = [0xE91E63, 0x9C27B0, 0x3F51B5, 0x03A9F4, 0x009688, 0xFF5722, 0x795548, 0x607D8B, 0x4CAF50, 0xFFC107];
        const cardW = 220;
        const cardH = 200 - 40;
        const hCards = [];
        for (let i = 0; i < 10; i++) {
            const card = new PIXI.Container();
            card._itemW = cardW;
            card._itemH = cardH;
            const bg = new PIXI.Graphics();
            bg.beginFill(palette[i]);
            bg.drawRoundedRect(0, 0, cardW, cardH, 12);
            bg.endFill();
            card.addChild(bg);
            const ct = new PIXI.Text(`卡片 ${i + 1}`, { fontSize: SIZE.textSize, fill: COLOR.white, fontWeight: 'bold', fontFamily: FONT });
            ct.x = (cardW - ct.width) / 2;
            ct.y = (cardH - ct.height) / 2;
            card.addChild(ct);
            hCards.push(card);
        }
        const hScroll = new ScrollBox({ width: listW, height: 200, items: hCards, gap: 16, direction: 'horizontal' });
        hScroll.x = SIZE.pad;
        hScroll.y = y;
        this.addChild(hScroll);
        y += 220;

        // === Swiper ===
        secLabel = new PIXI.Text('轮播 Swiper', { fontSize: SIZE.textSizeSm, fill: COLOR.textSec, fontFamily: FONT });
        secLabel.x = SIZE.pad;
        secLabel.y = y;
        this.addChild(secLabel);
        y += 50;

        const swiperW = listW;
        const swiperH = 360;
        const swiperColors = [0xE91E63, 0x3F51B5, 0x009688, 0xFF5722];

        const buildItem = (index) => {
            const card = new PIXI.Container();
            const bg = new PIXI.Graphics();
            bg.beginFill(swiperColors[index]);
            bg.drawRoundedRect(0, 0, swiperW, swiperH, 16);
            bg.endFill();
            card.addChild(bg);

            const label = new PIXI.Text(`轮播页 ${index + 1}`, {
                fontSize: SIZE.textSizeXxl,
                fill: COLOR.white,
                fontWeight: 'bold',
                fontFamily: FONT,
            });
            label.anchor.set(0.5);
            label.x = swiperW / 2;
            label.y = swiperH / 2;
            card.addChild(label);
            return card;
        };

        const swiper = new Swiper({
            width: swiperW,
            height: swiperH,
            items: {
                length: swiperColors.length,
                buildItem
            },
            gap: 24,
            autoplay: true,
            interval: 3000,
            loop: true,
        });
        swiper.x = SIZE.pad;
        swiper.y = y;
        this.addChild(swiper);
    }
}
