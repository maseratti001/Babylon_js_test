import {
    Scene,
    SpotLight,
    ShadowGenerator,
    Vector3,
    Color3,
    UniversalCamera,
    KeyboardEventTypes,
} from "@babylonjs/core";

/* ═══════════════════════════════════════════════════════
 *   🔦  손전등 조정 변수 — 여기만 수정하면 됨
 * ═══════════════════════════════════════════════════════ */

/** 손전등 빛 색상 (약간 따뜻한 백색) */
const LIGHT_COLOR     = new Color3(1.0, 0.95, 0.85);

/** 밝기 (0~∞, 높을수록 밝음) */
const INTENSITY       = 60;

/** 빛이 닿는 최대 거리 (m) */
const RANGE           = 80;

/** 내부 원뿔 각도 (rad) — 중심부 밝은 영역 */
const INNER_ANGLE     = Math.PI / 7;     // 22.5°

/** 외부 원뿔 각도 (rad) — 가장자리까지 포함 */
const OUTER_ANGLE     = Math.PI / 2;     // 60°

/** 빛 감쇠 지수 (높을수록 가장자리가 급격히 어두워짐) */
const EXPONENT        = 10;

/** 카메라 기준 손전등 오프셋 (오른쪽 약간, 아래 약간) */
const OFFSET          = new Vector3(0.25, -0.15, 0.0);

/** 그림자 해상도 (256/512/1024 — 높을수록 선명하지만 무거움) */
const SHADOW_MAP_SIZE = 256;

/** 그림자 어두운 정도 (0=완전 검정, 1=투명) */
const SHADOW_DARKNESS = 0.05;

/** 그림자 블러 커널 (부드러운 그림자, 0이면 딱딱함) */
const SHADOW_BLUR     = 8;

/** 토글 키 (기본: F) */
const TOGGLE_KEY      = "f";

/** 시작 시 켜져 있는지 */
const START_ON        = true;


export function createFlashlight(scene: Scene, camera: UniversalCamera) {

    /* ═══════════════════════════════════════════
     *  1) SpotLight 생성
     * ═══════════════════════════════════════════ */
    const light = new SpotLight(
        "flashlight",
        camera.position.clone(),          // 위치 (매 프레임 갱신)
        camera.getDirection(Vector3.Forward()),  // 방향 (매 프레임 갱신)
        OUTER_ANGLE,                      // 외부 원뿔
        EXPONENT,                         // 감쇠
        scene
    );
    light.innerAngle  = INNER_ANGLE;
    light.intensity   = INTENSITY;
    light.range       = RANGE;
    light.diffuse     = LIGHT_COLOR.clone();
    light.specular    = LIGHT_COLOR.clone();

    /* ═══════════════════════════════════════════
     *  2) 그림자 (손전등 빛에 의한 그림자)
     * ═══════════════════════════════════════════ */
    const shadowGen = new ShadowGenerator(SHADOW_MAP_SIZE, light);
    shadowGen.useBlurExponentialShadowMap = true;
    shadowGen.blurKernel = SHADOW_BLUR;
    shadowGen.darkness   = SHADOW_DARKNESS;
    shadowGen.bias       = 0.0001;
    shadowGen.normalBias = 0.005;

    // 씬에 이미 존재하는 모든 메시를 그림자 캐스터로 등록
    for (const mesh of scene.meshes) {
        if (mesh.name === "playerCapsule") continue;
        if (mesh.getTotalVertices() === 0) continue;
        shadowGen.addShadowCaster(mesh);
        mesh.receiveShadows = true;
    }

    /* ═══════════════════════════════════════════
     *  3) ON/OFF 상태
     * ═══════════════════════════════════════════ */
    let isOn = START_ON;
    light.setEnabled(isOn);
 
    /* ═══════════════════════════════════════════
     *  4) F키 토글
     * ═══════════════════════════════════════════ */
    scene.onKeyboardObservable.add((ev) => {
        if (
            ev.type === KeyboardEventTypes.KEYDOWN &&
            ev.event.key.toLowerCase() === TOGGLE_KEY
        ) {
            isOn = !isOn;
            light.setEnabled(isOn);
            console.log(`🔦 Flashlight ${isOn ? "ON" : "OFF"}`);
        }
    });

    /* ═══════════════════════════════════════════
     *  5) 매 프레임: 카메라 위치·방향 추적
     * ═══════════════════════════════════════════ */
    scene.onBeforeRenderObservable.add(() => {
        if (!isOn) return;

        // 카메라 로컬 오프셋 → 월드 좌표
        const right   = camera.getDirection(Vector3.Right());
        const up      = camera.getDirection(Vector3.Up());
        const forward = camera.getDirection(Vector3.Forward());

        light.position = camera.position
            .add(right.scale(OFFSET.x))
            .add(up.scale(OFFSET.y))
            .add(forward.scale(OFFSET.z));

        light.direction = forward;
    });

    return { light, shadowGen };
}