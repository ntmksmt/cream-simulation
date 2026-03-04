precision highp float;

in vec2 vUv;

out vec4 fragColor;

uniform vec2 resolution;
uniform sampler2D velocity;
uniform float deltaTime;

void main() {
  vec2 pos = (gl_FragCoord.xy * 2.0 - resolution) / resolution.y;
  vec2 tracedPos = pos - texture(velocity, vUv).xy * deltaTime;

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
  vec2 c = texture(velocity, st.xy).xy;
  vec2 r = texture(velocity, st.zy).xy;
  vec2 t = texture(velocity, st.xw).xy;
  vec2 rt = texture(velocity, st.zw).xy;

  vec2 vel = mix(
    mix(c, r, offset.x),
    mix(t, rt, offset.x),
    offset.y
  );
  
  fragColor = vec4(vel, 0.0, 1.0);
}
