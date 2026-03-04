precision highp float;

in vec2 vUv;

out vec4 fragColor;

uniform vec3 topColor;
uniform vec3 middleColor;
uniform vec3 bottomColor;

#define PI 3.1415926

// #include acesToneMapping.glsl;
// #include gammaCorrection.glsl;

float rand(vec2 uv) {
  float a = 12.9898, b = 78.233, c = 43758.5453;
  float dt = dot(uv.xy, vec2(a, b)), sn = mod(dt, PI);

  return fract(sin(sn) * c);
}

vec3 dithering(vec3 col) {
  float gridPosition = rand(gl_FragCoord.xy);

  vec3 ditherShiftRGB = vec3(0.25 / 255.0, - 0.25 / 255.0, 0.25 / 255.0);
  ditherShiftRGB = mix(2.0 * ditherShiftRGB, - 2.0 * ditherShiftRGB, gridPosition);

  return col + ditherShiftRGB;
}

void main() {
  vec3 col = vec3(0.0);

  float grad1 = clamp(pow((vUv.y - 0.1) * 1.12, 1.0), 0.0, 1.0);
  col = mix(middleColor * vec3(1.0, 1.55, 1.6), topColor, grad1);

  float grad2 = clamp(pow(1.0 - vUv.y, 4.0), 0.0, 1.0);
  col = mix(col, bottomColor, grad2);

  // col = acesToneMapping(col);
  // col = gammaCorrection(col);
  col = dithering(col);

  fragColor = vec4(col, 1.0);
}
