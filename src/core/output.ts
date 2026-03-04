import { QuadRenderPass } from './pass';
import { GuiParams } from '../lib/guiParams';
import { Common } from './common';
import { Resize } from '../lib/resize';

import basicVert from '../glsl/basic.vert';
import backgroundFrag from '../glsl/background.frag';
import sssFrag from '../glsl/sss.frag';
import outputFrag from '../glsl/output.frag';

import * as THREE from 'three';

export class Output {
  private _background: QuadRenderPass;
  private _sss: QuadRenderPass;
  private _output: QuadRenderPass;
  
  constructor() {
    this._background = new QuadRenderPass({
      outputTarget: 'renderTarget',
      shader: new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        vertexShader: basicVert,
        fragmentShader: backgroundFrag,
        uniforms: {
          topColor: { value: new THREE.Color(GuiParams.instance.dev.bgTopColor.value) },
          middleColor: { value: new THREE.Color(GuiParams.instance.dev.bgMiddleColor.value) },
          bottomColor: { value: new THREE.Color(GuiParams.instance.dev.bgBottomColor.value) }
        }
      })
    });
    GuiParams.instance.addHandler('bgTopColor', (color: any) =>
      this._background.setUniforms({ topColor: color })
    );
    GuiParams.instance.addHandler('bgMiddleColor', (color: any) =>
      this._background.setUniforms({ middleColor: color })
    );
    GuiParams.instance.addHandler('bgBottomColor', (color: any) =>
      this._background.setUniforms({ bottomColor: color })
    );

    this._sss = new QuadRenderPass({
      outputTarget: 'both',
      fixedResolution: new THREE.Vector2(512, 512),
      shader: new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        vertexShader: basicVert,
        fragmentShader: sssFrag,
        uniforms: {
          sss0Color: { value: new THREE.Color(GuiParams.instance.dev.sss0Color.value) },
          sss1Color: { value: new THREE.Color(GuiParams.instance.dev.sss1Color.value) },
          sss2Color: { value: new THREE.Color(GuiParams.instance.dev.sss2Color.value) },
          sss3Color: { value: new THREE.Color(GuiParams.instance.dev.sss3Color.value) }
        }
      })
    });
    GuiParams.instance.addHandler('sss0Color', (color: any) =>
      this._sss.setUniforms({ sss0Color: color })
    );
    GuiParams.instance.addHandler('sss1Color', (color: any) =>
      this._sss.setUniforms({ sss1Color: color })
    );
    GuiParams.instance.addHandler('sss2Color', (color: any) =>
      this._sss.setUniforms({ sss2Color: color })
    );
    GuiParams.instance.addHandler('sss3Color', (color: any) =>
      this._sss.setUniforms({ sss3Color: color })
    );
    this._sss.render();

    this._output = new QuadRenderPass({
      outputTarget: 'screen',
      shader: new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        vertexShader: basicVert,
        fragmentShader: outputFrag,
        uniforms: {
          background: { value: null },
          heightMap: { value: null },
          albedoColor: { value: new THREE.Color(GuiParams.instance.dev.albedoColor.value) },
          lightColor: { value: new THREE.Color(GuiParams.instance.dev.lightColor.value) },
          sssLUT: { value: this._sss.getOutputRenderTarget().texture },
          bgTopColor: { value: new THREE.Color(GuiParams.instance.dev.bgTopColor.value) },
          bgBottomColor: { value: new THREE.Color(GuiParams.instance.dev.bgBottomColor.value) },
          creamScale: { value: Common.instance.params.creamScale },
          minAlphaHeight: { value: GuiParams.instance.dev.minAlphaHeight.value },
          maxAlphaHeight: { value: GuiParams.instance.dev.maxAlphaHeight.value },
          minAlpha: { value: GuiParams.instance.dev.minAlpha.value }
        }
      })
    });
    GuiParams.instance.addHandler('albedoColor', (color: any) =>
      this._output.setUniforms({ albedoColor: color })
    );
    GuiParams.instance.addHandler('lightColor', (color: any) =>
      this._output.setUniforms({ lightColor: color })
    );
    GuiParams.instance.addHandler('minAlphaHeight', (number: any) =>
      this._output.setUniforms({ minAlphaHeight: number })
    );
    GuiParams.instance.addHandler('maxAlphaHeight', (number: any) =>
      this._output.setUniforms({ maxAlphaHeight: number })
    );
    GuiParams.instance.addHandler('minAlpha', (number: any) =>
      this._output.setUniforms({ minAlpha: number })
    );

    Resize.instance.addHandler(this._resize.bind(this));
  }

  private _resize() {
    this._background.render();

    this._output.setUniforms({
      background: this._background.getOutputRenderTarget().texture
    });
  }

  update(heightMapRT: THREE.WebGLRenderTarget) {
    // this._background.render(); // debug
    this._sss.render(); // debug
    
    this._output.setUniforms({
      heightMap: heightMapRT.texture
    });
    this._output.render();
  }
}
