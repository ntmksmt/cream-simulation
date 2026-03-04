vec2 sampleVelocity(sampler2D velocity, vec2 uv, vec2 pxScale) {
  vec2 offset = vec2(0.0, 0.0);
  vec2 multiplier = vec2(1.0, 1.0);

  #ifdef USE_BOUNDARY
    if(uv.x < 0.0) {
      offset.x = 1.0;
      multiplier.x = - 1.0;
    } else if(uv.x > 1.0) {
      offset.x = - 1.0;
      multiplier.x = - 1.0;
    }
    if(uv.y < 0.0) {
      offset.y = 1.0;
      multiplier.y = - 1.0;
    } else if(uv.y > 1.0) {
      offset.y = - 1.0;
      multiplier.y = - 1.0;
    }
  #endif

  return multiplier * texture(velocity, uv + offset * pxScale).xy;
}
