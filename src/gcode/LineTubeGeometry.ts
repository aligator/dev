import {BufferGeometry, Float32BufferAttribute, MathUtils, Matrix4, Vector2, Vector3} from 'three';
import {LinePoint} from "./LinePoint";

export class LineTubeGeometry extends BufferGeometry {
    private readonly points: LinePoint[]
    private readonly radialSegments: number

    // buffer
    private vertices: number[] = []
    private normals: number[] = [];
    private uvs: number[] = [];
    private indices: number[] = [];

    constructor(segments: LinePoint[], radialSegments = 8) {
        super()
        this.type = 'SegmentedTubeGeometry'
        this.points = segments
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

        for ( let i = 0; i < this.points.length; i ++ ) {
            this.generateSegment( i );
        }
        this.generateSegment(this.points.length-1);

        // uvs are generated in a separate function.
        // this makes it easy compute correct values for closed geometries

        this.generateUVs();

        // finally create faces

        this.generateIndices();

    }

    generateSegment( i: number ) {

        // we use getPointAt to sample evenly distributed points from the given path

        const point = this.points[i]

        const N = new Vector3(0, 1, 0)
        const B = new Vector3(1, 0, 1)

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

            this.normals.push( normal.x, normal.y, normal.z );

            // vertex
            const vertex = new Vector3()
            vertex.x = point.point.x + point.radius * normal.x;
            vertex.y = point.point.y + point.radius * normal.y;
            vertex.z = point.point.z + point.radius * normal.z;

            this.vertices.push( vertex.x, vertex.y, vertex.z );

        }

    }

    generateIndices() {

        for ( let j = 1; j <= this.points.length; j ++ ) {

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

        for ( let i = 0; i <= this.points.length; i ++ ) {

            for ( let j = 0; j <= this.radialSegments; j ++ ) {

                const uv = new Vector2()
                uv.x = i / this.points.length;
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