// core/pipeline.ts

import { Scene, ArcRotateCamera, DefaultRenderingPipeline } from "@babylonjs/core";

export function createPipeline(scene: Scene, camera: ArcRotateCamera) {
    const pipeline = new DefaultRenderingPipeline("pipeline", true, scene, [camera]);
    pipeline.fxaaEnabled            = true;
    pipeline.bloomEnabled           = true;
    pipeline.bloomThreshold         = 0.3;
    pipeline.bloomWeight            = 0.6;
    pipeline.bloomKernel            = 128;
    return pipeline;
}