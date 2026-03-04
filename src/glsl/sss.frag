precision highp float;

in vec2 vUv;

out vec4 fragColor;

uniform vec3 sss0Color;
uniform vec3 sss1Color;
uniform vec3 sss2Color;
uniform vec3 sss3Color;

#define PI 3.1415926
#define TWO_PI (2.0 * PI)

#include acesToneMapping.glsl;
#include gammaCorrection.glsl;

float gaussian(float v, float x) {
  return 1.0 / sqrt(TWO_PI * v) * exp(- (x * x) / (2.0 * v));
}

vec3 getProfile(float x) {
  return gaussian(0.0484, x) * sss0Color +
         gaussian(0.1870, x) * sss1Color +
         gaussian(0.5670, x) * sss2Color +
         gaussian(1.9900, x) * sss3Color;
}

vec3 integrateProfile(float angle, float r) {
  vec3 totalLight = vec3(0.0);
  vec3 weight = vec3(0.0);

  const float STEPS = 128.0;
  float delta = TWO_PI / STEPS;
  for(float theta = 0.0; theta < TWO_PI; theta += delta) {
    float dist = 2.0 * r * sin(0.5 * theta);
    vec3 scattering = getProfile(dist);
    totalLight += max(0.0, cos(angle + theta)) * scattering;
    weight += scattering;
  }
  
  return totalLight / weight;
}

void main() {
  vec3 col = integrateProfile(PI - vUv.x * PI, 1.0 / vUv.y);

  // col = acesToneMapping(col);
  // col = gammaCorrection(col);

  fragColor = vec4(col, 1.0);
}
