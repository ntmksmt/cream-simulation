import { Resize } from './resize';
import { Update } from './update';

import * as THREE from 'three';

export class Pointer {
  private static _instance: Pointer;
  private _pointerCoords: THREE.Vector2 = new THREE.Vector2();
  private _hasPreviousCoords: boolean = false;

  isOnScreen: boolean = false;
  isDown: boolean = false;
  previousCoords: THREE.Vector2 = new THREE.Vector2();
  currentCoords: THREE.Vector2 = new THREE.Vector2();

  private constructor() {
    window.addEventListener('mousedown', this._mouseDown.bind(this));
    window.addEventListener('mousemove', this._mouseMove.bind(this));
    window.addEventListener('mouseup', this._mouseUp.bind(this));
    window.addEventListener('mouseout', this._mouseOut.bind(this));

    window.addEventListener('touchstart', this._touchStart.bind(this));
    window.addEventListener('touchmove', this._touchMove.bind(this));
    window.addEventListener('touchend', this._touchEnd.bind(this));

    Update.instance.addHandler(this._update.bind(this));
  }

  static get instance() {
    if(!this._instance) this._instance = new Pointer();

    return this._instance;
  }

  private _setPointerCoords(clientX: number, clientY: number) {
    const { x, y } = Resize.instance.windowSize;
    this._pointerCoords.set(
      clientX / x * 2 - 1,
      (y - clientY) / y * 2 - 1
    );

    this.isOnScreen = true;
  }

  private _mouseDown(event: MouseEvent) {
    this.isDown = true;

    this._mouseMove(event);
  }

  private _mouseMove(event: MouseEvent) {
    this._setPointerCoords(event.clientX, event.clientY);
  }

  private _mouseUp() {
    this.isDown = false;
  }

  private _mouseOut() {
    this._mouseUp();

    this.isOnScreen = false;
    this._hasPreviousCoords = false;
  }

  private _touchStart(event: TouchEvent) {
    this.isDown = true;

    this._touchMove(event);
  }

  private _touchMove(event: TouchEvent) {
    this._setPointerCoords(event.touches[0].clientX, event.touches[0].clientY);
  }

  private _touchEnd() {
    this._mouseOut();
  }

  private _update() {
    if(!this.isOnScreen) return;

    if(!this._hasPreviousCoords) {
      this.previousCoords.copy(this._pointerCoords);
      this._hasPreviousCoords = true;
    } else {
      this.previousCoords.copy(this.currentCoords);
    }
    
    this.currentCoords.copy(this._pointerCoords);
  }
}
