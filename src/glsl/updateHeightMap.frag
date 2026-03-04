precision highp float;

in vec2 vUv;

out vec4 fragColor;

uniform sampler2D heightMap;
uniform sampler2D velocity;
uniform float deltaTime;
uniform vec2 resolution;
uniform float velStrength;
uniform vec2 creamScale;
uniform float minAlphaHeight;

void main() {
  float height = texture(heightMap, vUv).r;
  vec2 vel = texture(velocity, vUv).xy * deltaTime;

  vec2 pos = (gl_FragCoord.xy * 2.0 - resolution) / resolution.y;
  vec2 tracedPos = pos - vel;

  // [-1, 1] -> [0, resolution]
  vec2 ratio = resolution / resolution.y;
  tracedPos /= ratio;
  tracedPos = tracedPos * 0.5 + 0.5;
  tracedPos *= resolution;

  vec4 st;
  st.xy = floor(tracedPos - 0.5) + 0.5;
  st.zw = st.xy + 1.0;

  vec2 offset = tracedPos - st.xy;

  st /= resolution.xyxy;
  float cHeight = texture(heightMap, st.xy).x;
  float rHeight = texture(heightMap, st.zy).x;
  float tHeight = texture(heightMap, st.xw).x;
  float rtHeight = texture(heightMap, st.zw).x;

  float tracedHeight = mix(
    mix(cHeight, rHeight, offset.x),
    mix(tHeight, rtHeight, offset.x),
    offset.y
  );

  vec2 cVel = texture(velocity, st.xy).xy;
  vec2 rVel = texture(velocity, st.zy).xy;
  vec2 tVel = texture(velocity, st.xw).xy;
  vec2 rtVel = texture(velocity, st.zw).xy;

  vec2 tracedVel = mix(
    mix(cVel, rVel, offset.x),
    mix(tVel, rtVel, offset.x),
    offset.y
  ) * deltaTime;

  float minus = height * (length(vel) * velStrength);
  float plus = tracedHeight * (length(tracedVel) * velStrength);
  float newHeight = max(height - minus + plus, 0.0);

  float creamSc = resolution.x >= resolution.y
    ? creamScale.y
    : (resolution.x / resolution.y) * creamScale.x;
  float mah = minAlphaHeight * creamSc;
  if(height >= mah) newHeight = max(newHeight, mah);
  
  fragColor = vec4(vec3(newHeight), 1.0);
}
