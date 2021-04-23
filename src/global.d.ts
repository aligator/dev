declare module 'three.meshline' { 
    import THREE, { Vector3 } from 'three'

    class MeshLine extends THREE.BufferGeometry {
        constructor();
        geometry: MeshLine;
        points: Float32Array|Array<number>;
        isMeshLine: boolean;
    
        setPoints(points: Vector3[], wcb?: (p: number) => any): void;
        setMatrixWorld(matrixWorld: THREE.Matrix4): void;
        setGeometry(g: THREE.BufferGeometry, c: (p: number) => any): void;
        raycast: (raycaster: THREE.Raycaster, intersects: THREE.Intersection[]) => void;
        compareV3(a: number, b: number): number;
        copyV3(a: number): [number, number, number];
    }

    class MeshLineMaterial extends THREE.Material {
        constructor(options: {
            /**
             * a THREE.Texture to paint along the line (requires useMap set to true)
             */
            map?: THREE.Texture;

            /**
             * tells the material to use map (0 - solid color, 1 use texture)
             */
            useMap?: number;

            /**
             * a THREE.Texture to use as alpha along the line (requires useAlphaMap set to true)
             */
            alphaMap?: THREE.Texture;

            /**
             * tells the material to use alphaMap (0 - no alpha, 1 modulate alpha)
             */
            useAlphaMap?: number;

            /**
             * THREE.Vector2 to define the texture tiling (applies to map and alphaMap - MIGHT CHANGE IN THE FUTURE)
             */
            repeat?: THREE.Vector2;

            /**
             * THREE.Color to paint the line width, or tint the texture with
             */
            color?: THREE.Color;

            /**
             * alpha value from 0 to 1 (requires transparent set to true)
             */
            opacity?: number;

            /**
             * cutoff value from 0 to 1
             */
            alphaTest?: number;

            /**
             * the length and space between dashes. (0 - no dash)
             */
            dashArray?: number;

            /**
             * defines the location where the dash will begin. Ideal to animate the line.
             */
            dashOffset?: number;

            /**
             * defines the ratio between that is visible or not (0 - more visible, 1 - more invisible).
             */
            dashRatio?: number;

            /**
             * THREE.Vector2 specifying the canvas size (REQUIRED)
             */
            resolution?: THREE.Vector2;

            /**
             * makes the line width constant regardless distance (1 unit is 1px on screen) (0 - attenuate, 1 - don't attenuate)
             */
            sizeAttenuation?: number;

            /**
             * float defining width (if sizeAttenuation is true, it's world units; else is screen pixels)
             */
            lineWidth?: number;
        })

        linwWidth: number;
        map: THREE.Texture;
        useMap: number;
        alphaMap: THREE.Texture;
        useAlphaMap: number;
        color: THREE.Color|string|number;
        opacity: number;
        resolution: THREE.Vector2;
        sizeAttenuation: number;
        dashArray: number;
        dashOffset: number;
        dashRatio: number;
        useDesh: number;
        visibility: number;
        alphaTest: number;
        repeat: THREE.Vector2;
    }

    function MeshLineRaycast(raycaster: THREE.Raycaster, intersects: THREE.Intersection[]): void;
}
