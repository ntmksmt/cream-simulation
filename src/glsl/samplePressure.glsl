float samplePressure(sampler2D pressure, vec2 uv, vec2 pxScale) {
  vec2 offset = vec2(0.0, 0.0);

  #ifdef USE_BOUNDARY
    if(uv.x < 0.0) {
      offset.x = 1.0;
    } else if(uv.x > 1.0) {
      offset.x = - 1.0;
    }
    if(uv.y < 0.0) {
      offset.y = 1.0;
    } else if(uv.y > 1.0) {
      offset.y = - 1.0;
    }
  #endif

  return texture(pressure, uv + offset * pxScale).x;
}
