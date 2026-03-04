precision highp float;

in vec2 vUv;

out vec4 fragColor;

uniform sampler2D pressure;
uniform vec2 pxScale;
uniform sampler2D velocity;

#include samplePressure.glsl;

void main() {
  float r = samplePressure(pressure, vUv + vec2(1.0, 0.0) * pxScale, pxScale);
  float l = samplePressure(pressure, vUv - vec2(1.0, 0.0) * pxScale, pxScale);
  float t = samplePressure(pressure, vUv + vec2(0.0, 1.0) * pxScale, pxScale);
  float b = samplePressure(pressure, vUv - vec2(0.0, 1.0) * pxScale, pxScale);

  vec2 vel = texture(velocity, vUv).xy;
  
  fragColor = vec4(vel - vec2(r - l, t - b) * 0.5, 0.0, 1.0);
}
