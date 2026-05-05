import { Mesh, SceneLoader, Vector3, Scene, ShadowGenerator, PBRMaterial, Color3 } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

interface Placement {
    x: number;
    z: number;
    rotY: number;
    scale: number;
}

const SCALE = 8;

const PLACEMENTS: Placement[] = [
    { x: 46, z:  30, rotY: Math.PI, scale: SCALE },
];
const cache: Record<string, Mesh> = ((window as any).__tmplCache ??= {});


export async function createWaterfilters(scene: Scene, shadowGen: ShadowGenerator): Promise<void> {
    if (!cache.waterfilter || cache.waterfilter.isDisposed()) {
        const result = await SceneLoader.ImportMeshAsync("", "/src/assets/3D/", "waterfilter.glb", scene);
        cache.waterfilter = result.meshes[0] as Mesh;
        cache.waterfilter.setEnabled(false);
    }

    const root = cache.waterfilter;
    root.getChildMeshes().forEach((child) => {
        const mat = child.material as PBRMaterial;

        if (mat.albedoTexture) {
            mat.albedoTexture.level = 0.8;
        }
        mat.metallic = 0.0;
        mat.roughness = 0.95;
    })

    PLACEMENTS.forEach((cfg, i) => {
        const clone = root.clone(`waterfilter_${i}`, null)!;
        clone.setEnabled(true);
        clone.metadata = { hmr: true };  

        clone.position = new Vector3(cfg.x, 0, cfg.z);
        clone.rotation = new Vector3(0, cfg.rotY, 0);
        clone.scaling  = new Vector3(-cfg.scale, cfg.scale, cfg.scale);
        
        clone.getChildMeshes().forEach((child) => {
            shadowGen.addShadowCaster(child);
            child.receiveShadows = true;
        });
    });
}