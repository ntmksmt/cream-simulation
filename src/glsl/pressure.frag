precision highp float;

in vec2 vUv;

out vec4 fragColor;

uniform sampler2D pressure;
uniform vec2 pxScale;
uniform sampler2D divergence;

#include samplePressure.glsl;

void main() {
  float r = samplePressure(pressure, vUv + vec2(1.0, 0.0) * pxScale, pxScale);
  float l = samplePressure(pressure, vUv - vec2(1.0, 0.0) * pxScale, pxScale);
  float t = samplePressure(pressure, vUv + vec2(0.0, 1.0) * pxScale, pxScale);
  float b = samplePressure(pressure, vUv - vec2(0.0, 1.0) * pxScale, pxScale);

  float div = texture(divergence, vUv).x;

  fragColor = vec4((r + l + t + b - div) * 0.25, 0.0, 0.0, 1.0);
}
