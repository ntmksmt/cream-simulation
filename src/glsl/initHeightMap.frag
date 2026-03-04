precision highp float;

out vec4 fragColor;

uniform vec2 resolution;
uniform vec2 creamScale;
uniform sampler2D heightMap;
uniform float maxHeight;

void main() {
  float creamSc = resolution.x >= resolution.y
    ? creamScale.y
    : (resolution.x / resolution.y) * creamScale.x;
  
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / resolution.y;
  uv /= creamSc;
  uv = uv * 0.5 + 0.5;

  float height = texture(heightMap, uv).r;
  height *= maxHeight * creamSc;

  fragColor = vec4(vec3(height), 1.0);
}
