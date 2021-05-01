import {
    BufferGeometry,
    Curve,
    CurvePath,
    Float32BufferAttribute,
    LineCurve3,
    MathUtils,
    Matrix4,
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
        this.type = 'LineTubeGeometry'
        this.points = points
        this.radialSegments = radialSegments

        // create buffer data
        this.generateBufferData();

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
    } 

    generateSegment(i: number, insertOnly?: number) {
        // 0 --- 1 --- 2 --- 3
        // As at the beginning of the line 0 is missing and at the end
        // 3 is missing, only 1 --- 2 is guaranteed to exist always.
        // The points are needed to calculate the normals correctly.

        let points: Vector3[] = []

        if (this.points[i-1]) {
            points.push(this.points[i-1].point)
        }
        points.push(this.points[i].point)
        points.push(this.points[i+1].point)
        if (this.points[i+2]) {
            points.push(this.points[i+2].point)
        }

        let point0 = this.points[i-1]
        
        // point 1 and 2 should always exist
        let point1 = this.points[i]
        let point2 = this.points[i+1]

        let point3 = this.points[i+2]

        // let curves: LineCurve3[] = []

        // const path = new CurvePath<Vector3>()
        // if (point0 !== undefined) {
        //     curves.push(new LineCurve3(point0.point, point1.point))
        //     path.add(curves[curves.length-1])
        // }
        // curves.push(new LineCurve3(point1.point, point2.point))
        // path.add(curves[curves.length-1])
        // if (point3 !== undefined) {
        //     curves.push(new LineCurve3(point2.point, point3.point))
        //     path.add(curves[curves.length-1])
        // }

        let frame = this.computeFrenetFrames(points, false)

        const lastRadius = this.points[i-1]?.radius || 0

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

        // generate normals and vertices for the current segment
        for ( let j = 0; j <= this.radialSegments; j ++ ) {
            const v = j / this.radialSegments * Math.PI * 2;

            const sin = Math.sin(v);
            const cos = -Math.cos(v);

            // vertex
            if (insertOnly === 1 || insertOnly === undefined) {
                // normal

                let normal = new Vector3()
                normal.x = (cos * frame.normals[0].x + sin * frame.binormals[0].x);
                normal.y = (cos * frame.normals[0].y + sin * frame.binormals[0].y);
                normal.z = (cos * frame.normals[0].z + sin * frame.binormals[0].z);
                normal.normalize();

                segmentsPoint1Connector.push(createPointData(i, j, normal, point1.point, lastRadius))

                // normal
                if (point3 !== undefined) {
                    normal = new Vector3()
                    normal.x = (cos * frame.normals[0].x + sin * frame.binormals[0].x);
                    normal.y = (cos * frame.normals[0].y + sin * frame.binormals[0].y);
                    normal.z = (cos * frame.normals[0].z + sin * frame.binormals[0].z);
                    normal.normalize();
                }

                segmentsPoint1.push(createPointData(i, j, normal, point1.point, point1.radius))
            }

            if (insertOnly === 2 || insertOnly === undefined) {
                let normalIndex = 1
                if (!point0) {
                    normalIndex = 0
                }

                // normal
                let normal = new Vector3()
                normal.x = (cos * frame.normals[normalIndex].x + sin * frame.binormals[normalIndex].x);
                normal.y = (cos * frame.normals[normalIndex].y + sin * frame.binormals[normalIndex].y);
                normal.z = (cos * frame.normals[normalIndex].z + sin * frame.binormals[normalIndex].z);
                normal.normalize();

                segmentsPoint2.push(createPointData(i+1, j, normal, point2.point, point2.radius))
            }
        }

        this.segments.push(...segmentsPoint1Connector, ...segmentsPoint1, ...segmentsPoint2)
    }

    generateIndices() {
       for (let i=(this.radialSegments+2); i<this.segments.length; i++) {
            const a = i-1;
            const b = i - this.radialSegments - 2;
            const c = i - this.radialSegments-1;
            const d = i;

            this.segments[i].indices = [
                a, b, c,
                d, a, c
            ]
        }
    }

    generateUVs() {
        for (let i=0; i<this.segments.length; i++) {

            this.uvs.push(
                (i / this.radialSegments) -1,
                this.segments[i].radialNr / this.radialSegments
            )
        }
    }

    toJSON() {
        const data = BufferGeometry.prototype.toJSON.call(this);
        data.points = JSON.stringify(this.points);
        return data;
    }

    getTangent(point1: Vector3, point2: Vector3, optionalTarget?: Vector3) {
		const tangent = optionalTarget || new Vector3();
		tangent.copy(point1).sub(point2).normalize();
		return tangent;
	}

    computeFrenetFrames(points: Vector3[], closed: boolean) {      
		// see http://www.cs.indiana.edu/pub/techreports/TR425.pdf

		const normal = new Vector3();
        const tangents = [];
		const normals = [];
		const binormals = [];

		const vec = new Vector3();
		const mat = new Matrix4();


		// compute the tangent vectors for each segment
		for ( let i = 1; i < points.length / 2 + (points.length % 2); i++) {
            const t = this.getTangent(points[i-1], points[i]);
			t.normalize();
            tangents.push(t)
		}

        const segments = tangents.length-1

		// select an initial normal vector perpendicular to the first tangent vector,
		// and in the direction *2-1of the minimum tangent xyz component

		normals[ 0 ] = new Vector3();
		binormals[ 0 ] = new Vector3();
		let min = Number.MAX_VALUE;
		const tx = Math.abs( tangents[ 0 ].x );
		const ty = Math.abs( tangents[ 0 ].y );
		const tz = Math.abs( tangents[ 0 ].z );

		if ( tx <= min ) {

			min = tx;
			normal.set( 1, 0, 0 );

		}

		if ( ty <= min ) {

			min = ty;
			normal.set( 0, 1, 0 );

		}

		if ( tz <= min ) {

			normal.set( 0, 0, 1 );

		}

		vec.crossVectors( tangents[ 0 ], normal ).normalize();

		normals[ 0 ].crossVectors( tangents[ 0 ], vec );
		binormals[ 0 ].crossVectors( tangents[ 0 ], normals[ 0 ] );


		// compute the slowly-varying normal and binormal vectors for each segment on the curve

		for ( let i = 1; i <= segments; i ++ ) {

			normals[ i ] = normals[ i - 1 ].clone();

			binormals[ i ] = binormals[ i - 1 ].clone();

			vec.crossVectors( tangents[ i - 1 ], tangents[ i ] );

			if ( vec.length() > Number.EPSILON ) {

				vec.normalize();

				const theta = Math.acos( MathUtils.clamp( tangents[ i - 1 ].dot( tangents[ i ] ), - 1, 1 ) ); // clamp for floating pt errors

				normals[ i ].applyMatrix4( mat.makeRotationAxis( vec, theta ) );

			}

			binormals[ i ].crossVectors( tangents[ i ], normals[ i ] );

		}

		// if the curve is closed, postprocess the vectors so the first and last normal vectors are the same

		if ( closed === true ) {

			let theta = Math.acos( MathUtils.clamp( normals[ 0 ].dot( normals[ segments ] ), - 1, 1 ) );
			theta /= segments;

			if ( tangents[ 0 ].dot( vec.crossVectors( normals[ 0 ], normals[ segments ] ) ) > 0 ) {

				theta = - theta;

			}

			for ( let i = 1; i <= segments; i ++ ) {

				// twist a little...
				normals[ i ].applyMatrix4( mat.makeRotationAxis( tangents[ i ], theta * i ) );
				binormals[ i ].crossVectors( tangents[ i ], normals[ i ] );

			}

		}

		return {
			tangents: tangents,
			normals: normals,
			binormals: binormals
		};

	}    
}