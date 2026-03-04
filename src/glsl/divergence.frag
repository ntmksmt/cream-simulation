precision highp float;

in vec2 vUv;

out vec4 fragColor;

uniform sampler2D velocity;
uniform vec2 pxScale;

#include sampleVelocity.glsl;

void main() {
  vec2 r = sampleVelocity(velocity, vUv + vec2(1.0, 0.0) * pxScale, pxScale);
  vec2 l = sampleVelocity(velocity, vUv - vec2(1.0, 0.0) * pxScale, pxScale);
  vec2 t = sampleVelocity(velocity, vUv + vec2(0.0, 1.0) * pxScale, pxScale);
  vec2 b = sampleVelocity(velocity, vUv - vec2(0.0, 1.0) * pxScale, pxScale);

  fragColor = vec4(((r.x - l.x) + (t.y - b.y)) * 0.5, 0.0, 0.0, 1.0);
}
