import { gsap } from 'gsap';

/**
 * EscapeAnimation Component
 * 使い方: クラス名 "escape-animation" を要素に付ける
 * オプション:
 *   data-escape-distance="100" - 反応する距離（デフォルト: 100px）
 *   data-escape-speed="0.3" - 逃げる速度（デフォルト: 0.3秒）
 *   data-escape-delay="5" - ホバーしてから逃げ始めるまでの秒数（デフォルト: 0）
 */
export class EscapeAnimation {
    constructor(element) {
        this.element = element;
        this.escapeDistance = parseInt(element.dataset.escapeDistance) || 100;
        this.escapeSpeed = parseFloat(element.dataset.escapeSpeed) || 0.3;
        this.escapeDelay = parseFloat(element.dataset.escapeDelay) || 0;
        this.isActivated = false;
        this.hoverTimer = null;

        this.init();
    }

    init() {
        // インラインスタイルからtop/leftを取得、なければ現在位置を使用
        const style = this.element.style;

        let initialLeft = style.left ? parseInt(style.left) : this.element.offsetLeft;
        let initialTop = style.top ? parseInt(style.top) : this.element.offsetTop;

        gsap.set(this.element, {
            position: 'fixed',
            left: initialLeft,
            top: initialTop,
            x: 0,
            y: 0
        });

        // ホバーで有効化（遅延あり）
        this.element.addEventListener('mouseenter', () => {
            if (this.escapeDelay > 0) {
                this.hoverTimer = setTimeout(() => {
                    this.isActivated = true;
                }, this.escapeDelay * 1000);
            } else {
                this.isActivated = true;
            }
        });

        // マウスが離れたらタイマーをクリア（まだ有効化されていない場合）
        this.element.addEventListener('mouseleave', () => {
            if (this.hoverTimer && !this.isActivated) {
                clearTimeout(this.hoverTimer);
                this.hoverTimer = null;
            }
        });

        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    handleMouseMove(e) {
        // 有効化されていなければ何もしない
        if (!this.isActivated) return;

        const rect = this.element.getBoundingClientRect();
        const elementCenterX = rect.left + rect.width / 2;
        const elementCenterY = rect.top + rect.height / 2;

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // マウスとボタンの距離を計算
        const distanceX = mouseX - elementCenterX;
        const distanceY = mouseY - elementCenterY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // 距離が近い場合は逃げる
        if (distance < this.escapeDistance) {
            // 逃げる方向（マウスの反対方向）
            const angle = Math.atan2(distanceY, distanceX);
            const escapeAmount = this.escapeDistance - distance + 50;
            const escapeX = -Math.cos(angle) * escapeAmount;
            const escapeY = -Math.sin(angle) * escapeAmount;

            // 新しい位置を計算
            let newLeft = rect.left + escapeX;
            let newTop = rect.top + escapeY;

            // 画面内に収める
            newLeft = Math.max(0, Math.min(window.innerWidth - rect.width, newLeft));
            newTop = Math.max(0, Math.min(window.innerHeight - rect.height, newTop));

            gsap.to(this.element, {
                left: newLeft,
                top: newTop,
                duration: this.escapeSpeed,
                ease: "power2.out"
            });
        }
    }
}

// 自動初期化関数をエクスポート
export function initEscapeAnimations() {
    const elements = document.querySelectorAll('.escape-animation');
    elements.forEach(el => new EscapeAnimation(el));
}
