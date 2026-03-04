precision highp float;

in vec2 vUv;

out vec4 fragColor;

uniform sampler2D velocity;
uniform sampler2D newVelocity;
uniform vec2 pxScale;
uniform float viscosity;
uniform float deltaTime;

#include sampleVelocity.glsl;

void main() {
  vec2 vel = texture(velocity, vUv).xy;

  vec2 r = sampleVelocity(newVelocity, vUv + vec2(1.0, 0.0) * pxScale, pxScale);
  vec2 l = sampleVelocity(newVelocity, vUv - vec2(1.0, 0.0) * pxScale, pxScale);
  vec2 t = sampleVelocity(newVelocity, vUv + vec2(0.0, 1.0) * pxScale, pxScale);
  vec2 b = sampleVelocity(newVelocity, vUv - vec2(0.0, 1.0) * pxScale, pxScale);

  float alpha = viscosity * deltaTime;
  vec2 newVel = (vel + alpha * (r + l + t + b)) / (1.0 + 4.0 * alpha);

  fragColor = vec4(newVel, 0.0, 1.0);
}
