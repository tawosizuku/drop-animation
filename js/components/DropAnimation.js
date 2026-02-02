import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';

gsap.registerPlugin(Draggable);

// グローバルクリックカウンター
let globalClickCount = 0;
const globalListeners = [];

document.addEventListener('click', () => {
    globalClickCount++;
    globalListeners.forEach(callback => callback(globalClickCount));
});

/**
 * DropAnimation Component
 * 使い方: クラス名 "drop-animation" を要素に付ける
 * オプション:
 *   data-drop-clicks="5" - 落下までのクリック回数（デフォルト: 1）
 *   data-drop-draggable - ドラッグ可能にする
 *   data-drop-global - ブラウザ全体のクリックでカウント
 *   data-drop-color="#ff0000" - 落下時の背景色
 */
export class DropAnimation {
    constructor(element) {
        this.element = element;
        this.hasFallen = false;
        this.clickCount = 0;
        this.requiredClicks = parseInt(element.dataset.dropClicks) || 1;
        this.isDraggable = element.hasAttribute('data-drop-draggable');
        this.isGlobal = element.hasAttribute('data-drop-global');
        this.dropColor = element.dataset.dropColor || null;

        // 初期位置を保存
        this.initialTop = element.offsetTop;
        this.elementHeight = element.offsetHeight;

        this.init();
    }

    init() {
        gsap.set(this.element, { position: 'fixed' });

        if (this.isGlobal) {
            // グローバルクリックを監視
            globalListeners.push((count) => this.handleGlobalClick(count));
        } else if (this.isDraggable) {
            this.setupDraggable();
        } else {
            this.element.addEventListener('click', () => this.handleClick());
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

        // 色の変更
        if (this.dropColor) {
            animProps.backgroundColor = this.dropColor;
        }

        gsap.to(this.element, animProps);
    }

    handleClick() {
        if (!this.hasFallen) {
            this.clickCount++;
            if (this.clickCount >= this.requiredClicks) {
                gsap.set(this.element, { x: 0, y: 0 });
                this.drop();
            }
        }
    }

    handleGlobalClick(count) {
        if (!this.hasFallen && count >= this.requiredClicks) {
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
            },
            onClick: () => this.handleClick()
        });
    }
}

// 自動初期化関数をエクスポート
export function initDropAnimations() {
    const elements = document.querySelectorAll('.drop-animation');
    elements.forEach(el => new DropAnimation(el));
}
