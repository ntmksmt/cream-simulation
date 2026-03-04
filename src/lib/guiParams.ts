import GUI from 'lil-gui';

type Mode = 'prod' | 'dev';

type Param<T> = {
  value: T;
};

type NumberParam = Param<number> & {
  type: 'number';
  min: number;
  max: number;
  step: number;
};

type BooleanParam = Param<boolean> & {
  type: 'boolean';
};

type SelectParam = Param<string> & {
  type: 'select';
  options: string[];
};

type ColorParam = Param<string> & {
  type: 'color';
};

type GuiParam =
  | NumberParam
  | BooleanParam
  | SelectParam
  | ColorParam;

const PROD = {} satisfies Record<string, GuiParam>;

const DEV = {
  minAlphaHeight: { type: 'number', value: 0.001, min: 0.0, max: 0.01, step: 0.0001 },
  maxAlphaHeight: { type: 'number', value: 0.009, min: 0.0, max: 0.05, step: 0.0001 },
  minAlpha: { type: 'number', value: 0.5, min: 0.0, max: 1, step: 0.05 },
  bgTopColor: { type: 'color', value: '#8599a3' },
  bgMiddleColor: { type: 'color', value: '#e6ffff' },
  bgBottomColor: { type: 'color', value: '#c9feff' },
  sss0Color: { type: 'color', value: '#0f324d' },
  sss1Color: { type: 'color', value: '#1c1002' },
  sss2Color: { type: 'color', value: '#594a03' },
  sss3Color: { type: 'color', value: '#424f52' },
  albedoColor: { type: 'color', value: '#e5fdff' },
  lightColor: { type: 'color', value: '#ffffff' }
} satisfies Record<string, GuiParam>;

type ParamKeys = keyof(typeof PROD & typeof DEV);

export class GuiParams {
  private static _instance: GuiParams;
  private _gui?: GUI;
  private _showGui: boolean = false;
  private _mode: Mode = 'dev';
  private _handlers: Record<string, Function[]> = {};

  prod = PROD;
  dev = DEV;

  private constructor() {
    if(this._showGui) this._gui = new GUI();

    this._addGui();
  }

  static get instance() {
    if(!this._instance) this._instance = new GuiParams();

    return this._instance;
  }

  addHandler(key: ParamKeys, handler: Function) {
    if(!this._handlers[key]) this._handlers[key] = [];

    this._handlers[key].push(handler);
  }

  private _onChange(key: string, value: any) {
    this._handlers[key]?.forEach(handler => handler(value));
  }

  private _addGui() {
    const gui = this._gui;
    if(!gui) return;

    const params = (this._mode === 'prod' ? this.prod : this.dev) as Record<string, GuiParam>;

    Object.entries(params).forEach(([key, guiParam]) => {
      let controller;

      switch(guiParam.type) {
        case 'number':
          controller = gui.add(guiParam, 'value', guiParam.min, guiParam.max, guiParam.step);
          break;
        case 'boolean':
          controller = gui.add(guiParam, 'value');
          break;
        case 'select':
          controller = gui.add(guiParam, 'value', guiParam.options);
          break;
        case 'color':
          controller = gui.addColor(guiParam, 'value');
          break;
      }

      controller.name(key);
      controller.onChange((value: any) => this._onChange(key, value));
    });
  }
}
