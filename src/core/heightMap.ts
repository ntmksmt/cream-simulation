import { QuadRenderPass } from './pass';
import { Common } from './common';
import { GuiParams } from '../lib/guiParams';
import { Resize } from '../lib/resize';

import basicVert from '../glsl/basic.vert';
import initHeightMapFrag from '../glsl/initHeightMap.frag';
import updateHeightMapFrag from '../glsl/updateHeightMap.frag';

import * as THREE from 'three';

export class HeightMap {
  private _params: Record<string, any>;
  private _initHeightMap: QuadRenderPass;
  private _updateHeightMap: QuadRenderPass;
  
  constructor(heightMap: THREE.Texture) {
    this._params = {
      maxHeight: 0.199606,
      velStrength: 10
    };

    this._initHeightMap = new QuadRenderPass({
      outputTarget: 'renderTarget',
      shader: new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        vertexShader: basicVert,
        fragmentShader: initHeightMapFrag,
        uniforms: {
          creamScale: { value: Common.instance.params.creamScale },
          heightMap: { value: heightMap },
          maxHeight: { value: this._params.maxHeight }
        }
      })
    });

    this._updateHeightMap = new QuadRenderPass({
      outputTarget: 'renderTarget',
      needsSwap: true,
      shader: new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        vertexShader: basicVert,
        fragmentShader: updateHeightMapFrag,
        uniforms: {
          heightMap: { value: null },
          velocity: { value: null },
          deltaTime: { value: null },
          velStrength: { value: this._params.velStrength },
          creamScale: { value: Common.instance.params.creamScale },
          minAlphaHeight: { value: GuiParams.instance.dev.minAlphaHeight.value }
        }
      })
    });
    GuiParams.instance.addHandler('minAlphaHeight', (number: any) =>
      this._updateHeightMap.setUniforms({ minAlphaHeight: number })
    );

    Resize.instance.addHandler(this._resize.bind(this));
  }

  private _resize() {
    this._initHeightMap.render();

    this._updateHeightMap.setUniforms({
      heightMap: this._initHeightMap.getOutputRenderTarget().texture
    });
    this._updateHeightMap.render();
  }

  update(velocityRT: THREE.WebGLRenderTarget) {
    this._updateHeightMap.setUniforms({
      heightMap: this._updateHeightMap.getOutputRenderTarget().texture,
      velocity: velocityRT.texture,
      deltaTime: Common.instance.deltaTime
    });
    this._updateHeightMap.render();
  }

  getOutputRenderTarget() {
    return this._updateHeightMap.getOutputRenderTarget();
  }
}
