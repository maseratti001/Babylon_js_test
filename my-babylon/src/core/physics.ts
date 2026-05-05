import {
    Scene,
    PhysicsAggregate,
    PhysicsShapeType,
} from "@babylonjs/core";

/**
 * 씬의 모든 메시에 고정(static) 충돌체 부여
 *
 * - mass = 0 → 절대 안 움직이는 벽/바닥/가구
 * - InstancedMesh는 스킵 (추후 별도 처리)
 * - 빈 메시, 플레이어 캡슐도 스킵
 *
 * ⚠ 반드시 오브젝트 로딩 완료 **후** 호출
 */
export function enableStaticPhysics(scene: Scene) {
    let count = 0;
    let skipped = 0;

    for (const mesh of [...scene.meshes]) {
        /* ── 제외 조건 ── */
        if (mesh.name === "playerCapsule")    { skipped++; continue; }
        if ((mesh as any).sourceMesh)         { skipped++; continue; } // InstancedMesh
        if (mesh.getTotalVertices() === 0)    { skipped++; continue; } // 빈 노드
        if ((mesh as any).physicsBody)        { skipped++; continue; } // 이미 물리 있음

        try {
            new PhysicsAggregate(
                mesh,
                PhysicsShapeType.MESH,   // 삼각형 기반 정확한 충돌 (정적 전용)
                { mass: 0 },             // 0 = 완전 고정
                scene
            );
            count++;
        } catch {
            skipped++;
        }
    }

    console.log(`✅ Static physics: ${count} colliders, ${skipped} skipped`);
}