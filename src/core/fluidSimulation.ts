import { QuadRenderPass } from './pass';
import { Common } from './common';
import { Pointer } from '../lib/pointer';

import basicVert from '../glsl/basic.vert';
import advectFrag from '../glsl/advect.frag';
import externalForceFrag from '../glsl/externalForce.frag';
import viscousFrag from '../glsl/viscous.frag';
import divergenceFrag from '../glsl/divergence.frag';
import pressureFrag from '../glsl/pressure.frag';
import subtractGradientFrag from '../glsl/subtractGradient.frag';

import * as THREE from 'three';

export class FluidSimulation {
  private _params: Record<string, any>;
  private _advect: QuadRenderPass;
  private _externalForce: QuadRenderPass;
  private _viscous: QuadRenderPass;
  private _divergence: QuadRenderPass;
  private _pressure: QuadRenderPass;
  private _subtractGradient: QuadRenderPass;

  constructor() {
    this._params = {
      resolutionScale: 1 / 4,
      attenuation: 0.8,
      cursorScale: 0.2,
      useBoundary: true,
      viscousIterations: 5,
      viscosity: 50,
      pressureIterations: 10
    };

    this._advect = new QuadRenderPass({
      outputTarget: 'renderTarget',
      resolutionScale: this._params.resolutionScale,
      shader: new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        vertexShader: basicVert,
        fragmentShader: advectFrag,
        uniforms: {
          velocity: { value: null },
          deltaTime: { value: null }
        }
      })
    });
    
    this._externalForce = new QuadRenderPass({
      outputTarget: 'renderTarget',
      resolutionScale: this._params.resolutionScale,
      shader: new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        vertexShader: basicVert,
        fragmentShader: externalForceFrag,
        uniforms: {
          velocity: { value: null },
          attenuation: { value: this._params.attenuation },
          isDown: { value: null },
          previousCoords: { value: null },
          currentCoords: { value: null },
          deltaTime: { value: null },
          creamScale: { value: Common.instance.params.creamScale },
          cursorScale: { value: this._params.cursorScale }
        }
      })
    });

    this._viscous = new QuadRenderPass({
      outputTarget: 'renderTarget',
      resolutionScale: this._params.resolutionScale,
      needsSwap: true,
      shader: new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        vertexShader: basicVert,
        fragmentShader: viscousFrag,
        uniforms: {
          velocity: { value: null },
          newVelocity: { value: null },
          viscosity: { value: this._params.viscosity },
          deltaTime: { value: null }
        },
        defines: {
          USE_BOUNDARY: this._params.useBoundary
        }
      })
    });

    this._divergence = new QuadRenderPass({
      outputTarget: 'renderTarget',
      resolutionScale: this._params.resolutionScale,
      shader: new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        vertexShader: basicVert,
        fragmentShader: divergenceFrag,
        uniforms: {
          velocity: { value: null }
        },
        defines: {
          USE_BOUNDARY: this._params.useBoundary
        }
      })
    });

    this._pressure = new QuadRenderPass({
      outputTarget: 'renderTarget',
      resolutionScale: this._params.resolutionScale,
      needsSwap: true,
      shader: new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        vertexShader: basicVert,
        fragmentShader: pressureFrag,
        uniforms: {
          pressure: { value: null },
          divergence: { value: null }
        },
        defines: {
          USE_BOUNDARY: this._params.useBoundary
        }
      })
    });

    this._subtractGradient = new QuadRenderPass({
      outputTarget: 'renderTarget',
      resolutionScale: this._params.resolutionScale,
      shader: new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        vertexShader: basicVert,
        fragmentShader: subtractGradientFrag,
        uniforms: {
          pressure: { value: null },
          velocity: { value: null }
        },
        defines: {
          USE_BOUNDARY: this._params.useBoundary
        }
      })
    });
  }

  update() {
    this._advect.setUniforms({
      velocity: this._subtractGradient.getOutputRenderTarget().texture,
      deltaTime: Common.instance.deltaTime
    });
    this._advect.render();
    
    this._externalForce.setUniforms({
      velocity: this._advect.getOutputRenderTarget().texture,
      isDown: Pointer.instance.isDown,
      previousCoords: Pointer.instance.previousCoords,
      currentCoords: Pointer.instance.currentCoords,
      deltaTime: Common.instance.deltaTime
    });
    this._externalForce.render();

    this._viscous.setUniforms({
      velocity: this._externalForce.getOutputRenderTarget().texture,
      deltaTime: Common.instance.deltaTime
    });
    for(let i = 0; i < this._params.viscousIterations; i++) {
      this._viscous.setUniforms({
        newVelocity: this._viscous.getOutputRenderTarget().texture
      });
      this._viscous.render();
    }

    this._divergence.setUniforms({
      velocity: this._viscous.getOutputRenderTarget().texture
    });
    this._divergence.render();

    this._pressure.setUniforms({
      divergence: this._divergence.getOutputRenderTarget().texture
    });
    for(let i = 0; i < this._params.pressureIterations; i++) {
      this._pressure.setUniforms({
        pressure: this._pressure.getOutputRenderTarget().texture
      });
      this._pressure.render();
    }

    this._subtractGradient.setUniforms({
      pressure: this._pressure.getOutputRenderTarget().texture,
      velocity: this._viscous.getOutputRenderTarget().texture
    });
    this._subtractGradient.render();
  }

  getOutputRenderTarget() {
    return this._subtractGradient.getOutputRenderTarget();
  }
}
