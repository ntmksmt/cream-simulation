import { Common } from './common';
import { FluidSimulation } from './fluidSimulation';
import { loadAll, loadExrTexture } from '../lib/assetsLoader';
import { HeightMap } from './heightMap';
import { Output } from './output';
import { Resize } from '../lib/resize';
import { Update } from '../lib/update';

import heightMap from '../assets/images/heightMap.exr';

export class RenderPipeline {
  private _fluidSimulation: FluidSimulation;
  private _heightMap!: HeightMap;
  private _output!: Output;

  constructor(canvas: HTMLCanvasElement) {
    Common.init(canvas);

    this._fluidSimulation = new FluidSimulation();

    this._init();
  }

  private async _init() {
    const assets = await loadAll({
      heightMap: loadExrTexture(heightMap)
    });

    this._heightMap = new HeightMap(assets.heightMap);
    
    this._output = new Output();

    Update.instance.addHandler(this._update.bind(this));

    Resize.instance.resize();
    Update.instance.update();
  }

  private _update() {
    this._fluidSimulation.update();
    
    this._heightMap.update(this._fluidSimulation.getOutputRenderTarget());
    
    this._output.update(this._heightMap.getOutputRenderTarget());
  }
}
