precision highp float;

in vec2 vUv;

out vec4 fragColor;

uniform sampler2D velocity;
uniform float attenuation;
uniform bool isDown;
uniform vec2 resolution;
uniform vec2 previousCoords;
uniform vec2 currentCoords;
uniform float deltaTime;
uniform vec2 creamScale;
uniform float cursorScale;

float getDistance(vec2 prevCoords, vec2 currCoords, vec2 pos) {
  vec2 d = pos - currCoords;
  vec2 x = prevCoords - currCoords;

  float lx = length(x);
  if(lx <= 1e-4) return length(d);

  float proj = dot(d, x / lx);

  if(proj < 0.0) {
    return length(d);
  } else if(proj > length(x)) {
    return length(pos - prevCoords);
  } else {
    return sqrt(abs(dot(d, d) - proj * proj));
  }
}

void main() {
  vec2 vel = texture(velocity, vUv).xy;
  vel *= attenuation;

  if(isDown) {
    vec2 ratio = resolution / resolution.y;
    vec2 prevCoords = previousCoords * ratio;
    vec2 currCoords = currentCoords * ratio;
    vec2 pointerVel = (currCoords - prevCoords) / deltaTime;

    vec2 pos = (gl_FragCoord.xy * 2.0 - resolution) / resolution.y;
    float creamSc = resolution.x >= resolution.y
      ? creamScale.y
      : (resolution.x / resolution.y) * creamScale.x;

    float dist = getDistance(prevCoords, currCoords, pos);
    dist /= creamSc * cursorScale;
    dist = 1.0 - pow(smoothstep(0.0, 1.0, dist), 1.0);

    vel += (pointerVel - vel) * dist;
  }

  fragColor = vec4(vel, 0.0, 1.0);
}
