precision highp float;

in vec2 vUv;

out vec4 fragColor;

uniform sampler2D background;
uniform sampler2D heightMap;
uniform vec2 resolution;
uniform vec2 pxScale;
uniform vec3 albedoColor;
uniform vec3 lightColor;
uniform sampler2D sssLUT;
uniform vec3 bgTopColor;
uniform vec3 bgBottomColor;
uniform vec2 creamScale;
uniform float minAlphaHeight;
uniform float maxAlphaHeight;
uniform float minAlpha;

#define PI 3.1415926

const float fov = 45.0;

#include acesToneMapping.glsl;
#include gammaCorrection.glsl;

vec3 computeNormal(sampler2D heightMap, vec2 uv, vec2 resolution, vec2 pxScale) {
  float step = 2.0;
  float ratio = resolution.x / resolution.y;

  float height = texture(heightMap, uv).r;
  vec3 pos = vec3(uv, height);

  vec2 r = vec2(step, 0.0) * pxScale;
  float rHeight = texture(heightMap, uv + r).r;
  vec3 rPos = vec3(uv + r * ratio, rHeight);

  vec2 l = vec2(- step, 0.0) * pxScale;
  float lHeight = texture(heightMap, uv + l).r;
  vec3 lPos = vec3(uv + l * ratio, lHeight);

  vec2 t = vec2(0.0, step) * pxScale;
  float tHeight = texture(heightMap, uv + t).r;
  vec3 tPos = vec3(uv + t, tHeight);

  vec2 b = vec2(0.0, - step) * pxScale;
  float bHeight = texture(heightMap, uv + b).r;
  vec3 bPos = vec3(uv + b, bHeight);

  vec3 nor = vec3(0.0);
  nor += cross(rPos - pos, tPos - pos);
  nor += cross(tPos - pos, lPos - pos);
  nor += cross(lPos - pos, bPos - pos);
  nor += cross(bPos - pos, rPos - pos);

  return normalize(nor);
}

const float minDot = 1e-3;
float clampedDot(vec3 a, vec3 b) {
  return max(dot(a, b), minDot);
}

vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness) {
  return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(1.0 - cosTheta, 5.0);
}

float distribution(vec3 nor, vec3 h, float roughness) {
  float a2 = roughness * roughness;
  return a2 / (PI * pow(pow(clampedDot(nor, h), 2.0) * (a2 - 1.0) + 1.0, 2.0));
}

float geometry(float cosTheta, float k) {
  return (cosTheta) / (cosTheta * (1.0 - k) + k);
}

float smiths(float NdotV, float NdotL, float roughness) {
  float k = pow(roughness + 1.0, 2.0) / 8.0;
  return geometry(NdotV, k) * geometry(NdotL, k);
}

float specularBRDF(vec3 nor, vec3 viewDir, vec3 lightDir, vec3 h, float roughness) {
  float D, G, V;

  float NdotL = clampedDot(lightDir, nor);
  float NdotV = clampedDot(viewDir, nor);

  D = distribution(nor, h, roughness);
  G = smiths(NdotV, NdotL, roughness);
  V = G / max(0.0001, (4.0 * NdotV * NdotL));

  return D * V;
}

vec3 getEnvironment(vec3 dir) {
  return mix(bgBottomColor, bgTopColor, dir.y * 0.5 + 0.5) * 0.8;
}

vec3 getAmbientLight(vec3 nor) {
  vec3 grad = mix(vec3(0.2), vec3(0.8), nor.y * 0.5 + 0.5);
  return mix(grad * 1.0, getEnvironment(nor), 0.2);
}

vec3 getIrradiance(vec3 pos, vec3 rd, vec3 nor) {
  vec3 debug = vec3(0.0);
  vec3 albedo = albedoColor;
  float roughness = 0.08;
  float IOR = 1.6;
  vec3 F0 = vec3(pow(IOR - 1.0, 2.0) / pow(IOR + 1.0, 2.0));

  vec3 directDiffuse = vec3(0.0);
  vec3 directSpecular = vec3(0.0);
  for(int i = 0; i < 2; i++) {
    vec3 light = vec3(0.0);
    vec3 lightDir = vec3(0.0);
    if(i == 0) {
      // continue;
      light = lightColor * 0.5;
      vec3 lightPos = vec3(- 4.0, 12.0, 3.0);
      lightDir = normalize(lightPos - pos);
    } else if(i == 1) {
      // continue;
      light = lightColor * 0.6;
      vec3 lightPos = vec3(- 8.0, 4.0, - 1.5);
      lightDir = normalize(lightPos - pos);
    }

    // diffuse
    float NdotL = dot(nor, lightDir) * 0.5 + 0.5;
    vec3 sss = 1.0 * texture(sssLUT, vec2(max(NdotL, 0.001), 0.75)).rgb;
    directDiffuse += albedo * sss * light;

    // specular
    vec3 h = normalize(- rd + lightDir);
    vec3 F = fresnelSchlickRoughness(clampedDot(h, - rd), F0, roughness);
    vec3 specular = F * specularBRDF(nor, - rd, lightDir, h, roughness);
    directSpecular += specular * light * clampedDot(nor, lightDir);

    debug = vec3(sss);
  }

  vec3 F = fresnelSchlickRoughness(clampedDot(nor, - rd), F0, roughness);
  
  vec3 kD = 1.0 - F;
  vec3 irradiance = getAmbientLight(nor);
  vec3 ambientDiffuse = irradiance * kD * albedo / PI;

  vec3 env = getEnvironment(nor);
  vec3 ambientSpecular = env * F * 0.25;

  vec3 diffuse = directDiffuse + ambientDiffuse;
  vec3 specular = directSpecular + ambientSpecular;

  return diffuse + specular;
  // return vec3(debug);
}

void main() {
  vec3 col = vec3(0.0);
  vec3 bg = texture(background, vUv).rgb;
  float height = texture(heightMap, vUv).r;

  if(height > 0.0) {
    vec2 xy = (gl_FragCoord.xy * 2.0 - resolution) / resolution.y;
    vec3 pos = vec3(xy, height);

    float camPosZ = 1.0 / tan(radians(fov) / 2.0);
    vec3 rd = normalize(pos - vec3(0.0, 0.0, camPosZ));

    vec3 nor = computeNormal(heightMap, vUv, resolution, pxScale);
    
    col = getIrradiance(pos, rd, nor);

    float creamSc = resolution.x >= resolution.y
      ? creamScale.y
      : (resolution.x / resolution.y) * creamScale.x;
    float mah = minAlphaHeight * creamSc;

    float alpha = smoothstep(mah, maxAlphaHeight, height) * (1.0 - minAlpha) + minAlpha;
    alpha *= step(mah, height);
    col = mix(bg, col, alpha);
  } else {
    col = bg;
  }

  col = acesToneMapping(col);
  col = gammaCorrection(col);

  fragColor = vec4(col, 1.0);
}
