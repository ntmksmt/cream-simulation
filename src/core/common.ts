import { Resize } from '../lib/resize';
import { Update } from '../lib/update';

import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';

export class Common {
  private static _instance: Common;
  private _pxRatio: number = Math.min(window.devicePixelRatio, 2);
  private _clock: THREE.Clock = new THREE.Clock();
  private _stats?: Stats;
  private _showStats: boolean = true;

  params: Record<string, any>;
  renderer: THREE.WebGLRenderer;
  deltaTime: number = 0;

  private constructor(canvas: HTMLCanvasElement) {
    this.params = {
      creamScale: new THREE.Vector2(0.75, 0.59)
    };

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true
    });
    this.renderer.setPixelRatio(this._pxRatio);

    if(this._showStats) {
      this._stats = new Stats();
      document.body.appendChild(this._stats.dom);
    }

    Resize.instance.addHandler(this._resize.bind(this));
    Update.instance.addHandler(this._update.bind(this));
  }

  static init(canvas: HTMLCanvasElement) {
    if(this._instance) return;

    this._instance = new Common(canvas);
  }

  static get instance() {
    if(!this._instance) throw new Error('canvas.error: Common is not initialized.');

    return this._instance;
  }

  private _resize() {
    const { x, y } = Resize.instance.windowSize;
    this.renderer.setSize(x, y);
  }

  private _update() {
    this._stats?.update();
    
    this.deltaTime = Math.min(this._clock.getDelta(), 1 / 40);
  }
}
