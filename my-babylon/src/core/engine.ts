// core/engine.ts

// import { CubeTexture, Engine, Scene } from "@babylonjs/core";

// export function createEngine(canvas: HTMLCanvasElement) {
//     const engine = new Engine(canvas, true, {
//         stencil: false,
//     });

//     return engine;
// }

// export function createScene(engine: Engine): Scene {
//     const scene = new Scene(engine);

//     scene.clearColor.set(0, 0, 0, 1);
//     return scene;
// }

import { Engine, Scene, Vector3 } from "@babylonjs/core";
import "@babylonjs/core/Physics/v2/physicsEngineComponent";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import HavokPhysics from "@babylonjs/havok";

/* ── 중력 ── */
const GRAVITY = -20; // m/s² (음수 = 아래)

export function createEngine(canvas: HTMLCanvasElement) {
    return new Engine(canvas, true, { stencil: false });
}

export async function createScene(engine: Engine): Promise<Scene> {
    const scene = new Scene(engine);
    scene.clearColor.set(0, 0, 0, 1);

    const havok = await HavokPhysics();
    scene.enablePhysics(
        new Vector3(0, GRAVITY, 0),
        new HavokPlugin(true, havok)
    );

    return scene;
}