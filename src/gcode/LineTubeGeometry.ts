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

interface PointData {
    pointNr: number
    radialNr: number
    vertices: number[]
    normals: number[]
    uvs: number[]
    indices: number[]
}

export class LineTubeGeometry extends BufferGeometry {
    private points: LinePoint[]
    private readonly radialSegments: number

    // buffer
    private vertices: number[] = []
    private normals: number[] = [];
    private uvs: number[] = [];
    private indices: number[] = [];

    private segments: PointData[] = []

    constructor(points: LinePoint[], radialSegments = 8) {
        super()
        this.type = 'SegmentedTubeGeometry'
        this.points = points
        this.radialSegments = radialSegments

        // create buffer data
        this.generateBufferData();

      //  console.log(this.indices)

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

        this.segments.forEach((s) => {
            this.normals.push(...s.normals)
            this.vertices.push(...s.vertices)
            this.uvs.push(...s.uvs)
            this.indices.push(...s.indices)
        })
        /*console.log(this.segments)
        console.log(this.vertices)
        console.log(this.indices)*/
    }

    generateSegment(i: number, insertOnly?: number) {
        let point = this.points[i]
        let point2 = this.points[i+1]

        const lastRadius = this.points[i-1]?.radius || 0

        const c = new LineCurve3(point.point, point2.point)
        const frame = c.computeFrenetFrames(1, false)
        const N = frame.normals[0]
        const B = frame.binormals[0]

        function createPointData(pointNr: number, radialNr: number, normal: Vector3, point: Vector3, radius: number): PointData {
            return {
                pointNr,
                radialNr,
                normals: [normal.x, normal.y, normal.z],
                vertices: [
                    point.x + radius * normal.x,
                    point.y + radius * normal.y,
                    point.z + radius * normal.z
                ],
                uvs: [],
                indices: []
            }
        }

        const segmentsPoint1Connector: PointData[] = []
        const segmentsPoint1: PointData[] = []
        const segmentsPoint2: PointData[] = []
        const segmentsPoint2Connector: PointData[] = []
        // generate normals and vertices for the current segment
        for ( let j = 0; j <= this.radialSegments; j ++ ) {
            const v = j / this.radialSegments * Math.PI * 2;

            const sin = Math.sin(v);
            const cos = -Math.cos(v);

            // normal
            const normal = new Vector3()
            normal.x = (cos * N.x + sin * B.x);
            normal.y = (cos * N.y + sin * B.y);
            normal.z = (cos * N.z + sin * B.z);
            normal.normalize();

            // vertex
            if (insertOnly === 1 || insertOnly === undefined) {
                segmentsPoint1Connector.push(createPointData(i, j, normal, point.point, lastRadius))
                segmentsPoint1.push(createPointData(i, j, normal, point.point, point.radius))
            }

            if (insertOnly === 2 || insertOnly === undefined) {
                segmentsPoint2Connector.push(createPointData(i+1, j, normal, point.point, point.radius))
                segmentsPoint2.push(createPointData(i+1, j, normal, point2.point, point2.radius))
            }
        }

        this.segments.push(...segmentsPoint1Connector, ...segmentsPoint1, ...segmentsPoint2Connector, ...segmentsPoint2)
    }

    generateIndices() {
        //console.log(this.segments.length)
       for (let i=(this.radialSegments+2); i<this.segments.length; i++) {
       // const i = this.radialSegments+1
            const a = i-1;
            const b = i - this.radialSegments - 2;
            const c = i - this.radialSegments-1;
            const d = i;

            this.segments[i].indices = [
                c, b, a,
                c, a, d

                // 0 3 1
                // 3 0 2
            ]
        }

        // für jeden Punkt zwischen Anfang und ende
        // füge jede Fläche als 2 dreiecke ein

   /*     for ( let j = 1; j < this.points.length; j ++ ) {
            console.log(j)
            for ( let i = 1; i <= this.radialSegments; i ++ ) {
                // 1, 2, ,3 ,4 ,5, 6, 7, 8
                console.log("a", i)

                // letzter Punkt segment i-1
                const a = ( this.radialSegments + 1 ) * ( j - 1 ) + ( i - 1 );

                // dieser Punkt segment i-1
                const b = ( this.radialSegments + 1 ) * j + ( i - 1 );

                // dieser Punkt segment i
                const c = ( this.radialSegments + 1 ) * j + i;

                // letzter Punkt segment i
                const d = ( this.radialSegments + 1 ) * ( j - 1 ) + i;

                // faces

                this.indices.push( a, b, d );
                this.indices.push( b, c, d );

            }

        }
*/
        /*console.log(this.points.length)
        console.log(this.radialSegments)
        console.log(this.indices.length  / 2)
    */


    }

    generateUVs() {
       // console.log(this.segments.length)
        for (let i=0; i<this.segments.length; i++) {

            this.uvs.push(
                (i / this.radialSegments) -1,
                this.segments[i].radialNr / this.radialSegments
            )
        }

        /*
        for ( let i = 0; i < this.points.length; i ++ ) {

            for ( let j = 0; j <= this.radialSegments; j ++ ) {

                const uv = new Vector2()
                uv.x = i / this.points.length-1;
                uv.y = j / this.radialSegments;

                this.uvs.push( uv.x, uv.y );

            }

        }
*/
    }

    toJSON() {
        const data = BufferGeometry.prototype.toJSON.call(this);
        data.points = JSON.stringify(this.points);
        return data;
    }

}