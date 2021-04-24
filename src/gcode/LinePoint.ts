import {Vector3} from "three";

class LinePoint {
    public readonly point: Vector3
    public readonly radius: number

    constructor(point: Vector3, radius: number) {
        this.point = point
        this.radius = radius
    }
}

export {LinePoint};
