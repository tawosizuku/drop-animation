/**
 * Main JavaScript Entry Point
 */
import { initDropAnimations } from './components/DropAnimation.js';
import { initEscapeAnimations } from './components/EscapeAnimation.js';
import { initMouseMoveDropAnimations } from './components/MouseMoveDropAnimation.js';

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
    initDropAnimations();
    initEscapeAnimations();
    initMouseMoveDropAnimations();
});
