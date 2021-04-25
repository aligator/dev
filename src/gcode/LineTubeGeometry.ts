import {
    BufferGeometry,
    Curve,
    Float32BufferAttribute,
    LineCurve3,
    MathUtils,
    Matrix4,
    Path,
    Vector2,
    Vector3
} from 'three';
import {LinePoint} from "./LinePoint";

export class LineTubeGeometry extends BufferGeometry {
    private points: LinePoint[]
    private readonly radialSegments: number

    // buffer
    private vertices: number[] = []
    private normals: number[] = [];
    private uvs: number[] = [];
    private indices: number[] = [];

    constructor(points: LinePoint[], radialSegments = 8) {
        super()
        this.type = 'SegmentedTubeGeometry'
        this.points = points
        this.radialSegments = radialSegments

        // create buffer data
        this.generateBufferData();

        console.log(this.indices)

        // build geometry
        this.setIndex(this.indices);
        this.setAttribute('position', new Float32BufferAttribute(this.vertices, 3));
        this.setAttribute('normal', new Float32BufferAttribute(this.normals, 3));
        this.setAttribute('uv', new Float32BufferAttribute(this.uvs, 2));
    }

    generateBufferData() {
        const isEven = this.points.length % 2 === 0
        const pairs = Math.floor(this.points.length / 2)
        for ( let i = 0; i < pairs; i++ ) {
            this.generateSegment(i*2);
        }

        // Add the missing segment for odd count of points
        if (!isEven) {
            this.generateSegment(this.points.length-2, 2);
        }


        this.generateUVs();

        // finally create faces
        this.generateIndices();

    }

    generateSegment(i: number, insertOnly?: number) {
        // we use getPointAt to sample evenly distributed points from the given path
        let point = this.points[i]
        let point2 = this.points[i+1]

        const c = new LineCurve3(point.point, point2.point)
        const frame = c.computeFrenetFrames(1, false)
        const N = frame.normals[0]
        const B = frame.binormals[0]

        const vertices1: number[] = []
        const vertices2: number[] = []
        const normals1: number[] = []
        const normals2: number[] = []

        // generate normals and vertices for the current segment
        for ( let j = 0; j <= this.radialSegments; j ++ ) {

            const v = j / this.radialSegments * Math.PI * 2;

            const sin = Math.sin( v );
            const cos = - Math.cos( v );

            // normal
            const normal = new Vector3()
            normal.x = ( cos * N.x + sin * B.x );
            normal.y = ( cos * N.y + sin * B.y );
            normal.z = ( cos * N.z + sin * B.z );
            normal.normalize();

            normals1.push( normal.x, normal.y, normal.z );
            normals2.push( normal.x, normal.y, normal.z );

            // vertex
            if (insertOnly === 1 || insertOnly === undefined) {
                vertices1.push(
                    point.point.x + point.radius * normal.x,
                    point.point.y + point.radius * normal.y,
                    point.point.z + point.radius * normal.z
                );
            }

            if (insertOnly === 2 || insertOnly === undefined) {
                vertices2.push(
                    point2.point.x + point2.radius * normal.x,
                    point2.point.y + point2.radius * normal.y,
                    point2.point.z + point2.radius * normal.z
                )
            }
        }

        this.normals.push(...normals1, ...normals2)
        this.vertices.push(...vertices1, ...vertices2)
    }

    generateIndices() {

        for ( let j = 1; j < this.points.length; j ++ ) {

            for ( let i = 1; i <= this.radialSegments; i ++ ) {

                const a = ( this.radialSegments + 1 ) * ( j - 1 ) + ( i - 1 );
                const b = ( this.radialSegments + 1 ) * j + ( i - 1 );
                const c = ( this.radialSegments + 1 ) * j + i;
                const d = ( this.radialSegments + 1 ) * ( j - 1 ) + i;

                // faces

                this.indices.push( a, b, d );
                this.indices.push( b, c, d );

            }

        }

    }

    generateUVs() {

        for ( let i = 0; i < this.points.length; i ++ ) {

            for ( let j = 0; j <= this.radialSegments; j ++ ) {

                const uv = new Vector2()
                uv.x = i / this.points.length-1;
                uv.y = j / this.radialSegments;

                this.uvs.push( uv.x, uv.y );

            }

        }

    }

    toJSON() {
        const data = BufferGeometry.prototype.toJSON.call(this);
        data.points = JSON.stringify(this.points);
        return data;
    }

}