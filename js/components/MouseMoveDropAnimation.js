import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';

gsap.registerPlugin(Draggable);

// グローバルマウス移動距離トラッカー
let globalMouseDistance = 0;
let lastMouseX = null;
let lastMouseY = null;
const globalMouseListeners = [];

document.addEventListener('mousemove', (e) => {
    if (lastMouseX !== null && lastMouseY !== null) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        globalMouseDistance += distance;
        globalMouseListeners.forEach(callback => callback(globalMouseDistance));
    }
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

/**
 * MouseMoveDropAnimation Component
 * 使い方: クラス名 "mousemove-drop-animation" を要素に付ける
 * オプション:
 *   data-mousemove-distance="1000" - 落下までのマウス移動距離（デフォルト: 500px）
 *   data-drop-draggable - ドラッグ可能にする
 *   data-drop-color="#ff0000" - 落下時の背景色
 */
export class MouseMoveDropAnimation {
    constructor(element) {
        this.element = element;
        this.hasFallen = false;
        this.requiredDistance = parseInt(element.dataset.mousemoveDistance) || 500;
        this.isDraggable = element.hasAttribute('data-drop-draggable');
        this.dropColor = element.dataset.dropColor || null;

        // 初期位置を保存
        this.initialTop = element.offsetTop;
        this.elementHeight = element.offsetHeight;

        this.init();
    }

    init() {
        gsap.set(this.element, { position: 'fixed' });

        // グローバルマウス移動を監視
        globalMouseListeners.push((distance) => this.handleGlobalMouseMove(distance));

        if (this.isDraggable) {
            this.setupDraggable();
        }
    }

    getBottomY() {
        return window.innerHeight - this.initialTop - this.elementHeight - 10;
    }

    drop() {
        const currentY = gsap.getProperty(this.element, "y");
        const bottomY = this.getBottomY();
        const distance = Math.max(0, bottomY - currentY);
        const duration = Math.max(0.3, Math.sqrt(distance / 500));

        const animProps = {
            y: bottomY,
            duration: duration,
            ease: "bounce.out",
            onComplete: () => {
                this.hasFallen = true;
            }
        };

        if (this.dropColor) {
            animProps.backgroundColor = this.dropColor;
        }

        gsap.to(this.element, animProps);
    }

    handleGlobalMouseMove(distance) {
        if (!this.hasFallen && distance >= this.requiredDistance) {
            gsap.set(this.element, { x: 0, y: 0 });
            this.drop();
        }
    }

    setupDraggable() {
        Draggable.create(this.element, {
            type: "x,y",
            onPress: () => {
                gsap.killTweensOf(this.element);
            },
            onDragEnd: () => {
                if (this.hasFallen) {
                    this.drop();
                }
            }
        });
    }
}

// 自動初期化関数をエクスポート
export function initMouseMoveDropAnimations() {
    const elements = document.querySelectorAll('.mousemove-drop-animation');
    elements.forEach(el => new MouseMoveDropAnimation(el));
}
