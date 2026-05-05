// core/lighting.ts

import {
    Scene,
    DirectionalLight,
    HemisphericLight,
    ShadowGenerator,
    Vector3,
    Color3,
	Color4,
	PointLight,
	SpotLight,
	GlowLayer,
} from "@babylonjs/core";

/* ═══════════════════════════════════════════
 *  이 플래그만 바꾸면 라이팅 전환
 *  true  → 최소 라이트만 (빠름)
 *  false → 풀 라이팅 + 그림자
 * ═══════════════════════════════════════════ */

export function createLighting(scene: Scene) {
	// return createLampLighting(scene);
    return createFullLighting(scene);
}

/* ─── 프로덕션: 풀 라이팅 ─── */
function createFullLighting(scene: Scene) {
	const sun = new DirectionalLight("sun", new Vector3(1, -2, 1).normalize(), scene);
	sun.intensity = 4;
	sun.diffuse   = new Color3(1.0, 0.92, 0.78);
	sun.specular  = new Color3(1.0, 0.95, 0.85);
	sun.position  = new Vector3(-15, 18, -10);

	const fill = new DirectionalLight("fill", new Vector3(-1, -2, -1).normalize(), scene);
	fill.intensity = 4;
	fill.diffuse   = new Color3(0.95, 0.95, 1.0);
	fill.specular  = new Color3(0.2, 0.2, 0.2);
	fill.position  = new Vector3(15, 18, 10);

	const ambient = new HemisphericLight("ambient", new Vector3(0, 1, 0), scene);
	ambient.intensity   = 0.1;
	ambient.diffuse     = new Color3(0.9, 0.88, 0.82);
	ambient.groundColor = new Color3(0.5, 0.45, 0.38);

	// const shadowGen = new ShadowGenerator(1024, sun);
	// shadowGen.useBlurExponentialShadowMap = true;
	// shadowGen.blurKernel = 48;
	// shadowGen.bias       = 0.0001;
	// shadowGen.normalBias = 0.008;
	
	const shadowGen = new ShadowGenerator(0, sun);  // 최소 해상도
    shadowGen.useBlurExponentialShadowMap = false;
	shadowGen.darkness   = 1;

	return { sun, shadowGen };
}

function createLampLighting(scene: Scene) {
    // 전체 기본 조명 (DirectionalLight — 그림자 담당)
    // const main = new DirectionalLight("main",
    //     new Vector3(-0.5, -1, -0.5).normalize(), scene);
    // main.intensity = 0.1;
    // main.diffuse   = new Color3(1.0, 0.95, 0.85);
    // main.position  = new Vector3(0, 20, 0);

    // 램프 분위기용 (PointLight — 그림자 없음, 그냥 색감)
    const lampGlow = new PointLight("lampGlow",
        new Vector3(36.3, 6, 30.6), scene);
    lampGlow.intensity = 10;
    lampGlow.range     = 50;
    lampGlow.diffuse   = new Color3(1.0, 1.0, 1.0);

    const ambient = new HemisphericLight("ambient",
        new Vector3(0, 1, 0), scene);
    ambient.intensity   = 0.00;
    ambient.diffuse     = new Color3(0.9, 0.88, 0.82);
    ambient.groundColor = new Color3(0.3, 0.25, 0.2);

    // 그림자는 DirectionalLight로
    const shadowGen = new ShadowGenerator(512, lampGlow);
	shadowGen.useBlurExponentialShadowMap = true;
	shadowGen.blurKernel = 16; // 32 → 16
	shadowGen.darkness   = 0.5;

    return { shadowGen };
}

