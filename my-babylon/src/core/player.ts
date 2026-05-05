import {
    Scene,
    UniversalCamera,
    Vector3,
    MeshBuilder,
    KeyboardEventTypes,
    PhysicsAggregate,
    PhysicsShapeType,
} from "@babylonjs/core";

/* ═══════════════════════════════════════════════════════
 *   🎮  조정 가능한 변수들 — 여기만 수정하면 됨
 * ═══════════════════════════════════════════════════════ */

/** 스폰 위치 (y를 바닥보다 높게 — 물리가 자동으로 안착시킴) */
const SPAWN = new Vector3(0, 5, 0);

/* ── 물리 캡슐 ── */
const CAPSULE_HEIGHT      = 4;    // 전체 키 (m)
const CAPSULE_RADIUS      = 1;   // 몸통 반지름 (m)
const PLAYER_MASS         = 100;     // 질량 (kg)
const CAPSULE_FRICTION    = 0.4;    // 바닥 마찰 (0=빙판, 1=고무)
const CAPSULE_RESTITUTION = 0;      // 반발계수 (0=안 튐)

/* ── 카메라 ── */
const EYE_OFFSET   = 4;   // 캡슐 중심 → 눈 높이 (m)
const MOUSE_SENS   = 800;   // 마우스 감도 (높을수록 느림)
const FOV          = 1.2;   // 시야각 (rad) ≈ 69°
const NEAR_CLIP    = 0.1;   // 근거리 클리핑 (m)
const FAR_CLIP     = 500;   // 원거리 클리핑 (m)

/* ── 이동 ── */
const MOVE_SPEED   = 10.0;   // 걷기 속도 (m/s)

/* ── 점프 ── */
const JUMP_VEL     = 15.0;   // 점프 초속 (m/s)
const GROUND_THRESH = 0.5;  // |vel.y| < 이 값이면 "착지" 판정


export function createPlayer(scene: Scene, canvas: HTMLCanvasElement) {

    /* ═══════════════════════════════════════════
     *  1) 1인칭 카메라
     * ═══════════════════════════════════════════ */
    const camera = new UniversalCamera("fpsCam", SPAWN.clone(), scene);
    camera.attachControl(canvas, true);
    camera.inertia            = 0;           // 회전 관성 없음
    camera.angularSensibility = MOUSE_SENS;
    camera.fov                = FOV;
    camera.minZ               = NEAR_CLIP;
    camera.maxZ               = FAR_CLIP;

    // 내장 키보드 이동 제거 (물리로 직접 처리)
    camera.inputs.removeByType("FreeCameraKeyboardMoveInput");

    // 좌클릭 → 포인터 잠금 (마우스룩)
    canvas.addEventListener("click", () => canvas.requestPointerLock());

    /* ═══════════════════════════════════════════
     *  2) 물리 캡슐
     * ═══════════════════════════════════════════ */
    const capsule = MeshBuilder.CreateCapsule("playerCapsule", {
        radius: CAPSULE_RADIUS,
        height: CAPSULE_HEIGHT,
    }, scene);
    capsule.position  = SPAWN.clone();
    capsule.isVisible = false;

    const aggregate = new PhysicsAggregate(
        capsule,
        PhysicsShapeType.CAPSULE,
        {
            mass:        PLAYER_MASS,
            friction:    CAPSULE_FRICTION,
            restitution: CAPSULE_RESTITUTION,
        },
        scene
    );
    const body = aggregate.body;

    // 캡슐 넘어짐 방지 → 회전 관성 제거
    body.setMassProperties({ inertia: Vector3.Zero() });

    /* ═══════════════════════════════════════════
     *  3) 키보드 입력
     * ═══════════════════════════════════════════ */
    const keys = new Set<string>();

    scene.onKeyboardObservable.add((ev) => {
        const k = ev.event.key.toLowerCase();
        if (ev.type === KeyboardEventTypes.KEYDOWN) keys.add(k);
        else keys.delete(k);
    });

    /* ═══════════════════════════════════════════
     *  4) 매 프레임 업데이트
     * ═══════════════════════════════════════════ */
    scene.onBeforeRenderObservable.add(() => {

        /* ── 이동 방향 (카메라 기준, 수평만) ── */
        const fwd = camera.getDirection(Vector3.Forward());
        fwd.y = 0; fwd.normalize();

        const rgt = camera.getDirection(Vector3.Right());
        rgt.y = 0; rgt.normalize();

        const dir = Vector3.Zero();
        if (keys.has("w") || keys.has("arrowup"))    dir.addInPlace(fwd);
        if (keys.has("s") || keys.has("arrowdown"))  dir.subtractInPlace(fwd);
        if (keys.has("a") || keys.has("arrowleft"))  dir.subtractInPlace(rgt);
        if (keys.has("d") || keys.has("arrowright")) dir.addInPlace(rgt);
        if (dir.lengthSquared() > 0) dir.normalize();

        /* ── 속도 적용: 수평 = 입력, 수직 = 물리 유지 ── */
        const vel = body.getLinearVelocity();
        body.setLinearVelocity(new Vector3(
            dir.x * MOVE_SPEED,
            vel.y,                     // 중력·점프 보존
            dir.z * MOVE_SPEED,
        ));

        /* ── 회전 잠금 ── */
        body.setAngularVelocity(Vector3.Zero());

        /* ── 점프 (착지 중일 때만) ── */
        if (keys.has(" ") && Math.abs(vel.y) < GROUND_THRESH) {
            body.setLinearVelocity(new Vector3(
                vel.x, JUMP_VEL, vel.z
            ));
        }

        /* ── 카메라를 캡슐에 동기화 ── */
        const p = capsule.position;
        camera.position.set(p.x, p.y + EYE_OFFSET, p.z);
    });

    return { camera, capsule, aggregate };
}