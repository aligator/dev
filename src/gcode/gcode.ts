import { Box3, BufferGeometry, Mesh, PerspectiveCamera, Color, Scene, Vector3, WebGLRenderer, Texture, DataTexture, RGBFormat, MeshBasicMaterial, TubeGeometry, Curve, CurvePath, Vector3Tuple, LineCurve, LineCurve3 } from 'three'
import { OrbitControls } from '@three-ts/orbit-controls'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';

const width = 512;
const height = 512;

const size = width * height;
const dataRed = new Uint8Array( 3 * size );
const dataGreen = new Uint8Array( 3 * size );
const colorRed = new Color( 0xff0000 );
const colorGreen = new Color( 0x00ff00 );

let r = Math.floor( colorRed.r * 255 );
let g = Math.floor( colorRed.g * 255 );
let b = Math.floor( colorRed.b * 255 );

for ( let i = 0; i < size; i ++ ) {

	const stride = i * 3;

	dataRed[ stride ] = r;
	dataRed[ stride + 1 ] = g;
	dataRed[ stride + 2 ] = b;

}

r = Math.floor( colorGreen.r * 255 );
g = Math.floor( colorGreen.g * 255 );
b = Math.floor( colorGreen.b * 255 );

for ( let i = 0; i < size; i ++ ) {

	const stride = i * 3;

	dataGreen[ stride ] = r;
	dataGreen[ stride + 1 ] = g;
	dataGreen[ stride + 2 ] = b;

}

// used the buffer to create a DataTexture

const textureRed = new DataTexture( dataRed, width, height, RGBFormat );
const textureGreen = new DataTexture( dataGreen, width, height, RGBFormat );

console.log(textureRed, textureGreen)

export class GCodeRenderer {

    private running: boolean = false   
    private readonly scene: Scene
    private readonly renderer: WebGLRenderer
    private cameraControl?: OrbitControls 

    private camera: PerspectiveCamera

    private lineMaterial = new MeshBasicMaterial({ 
        color: new Color("#0000ff"),
     //   map: textureRed,
    })

    private lines: TubeGeometry[] = []
    private combinedLine?: BufferGeometry

    private readonly gCode: string

    private min?: Vector3
    private max?: Vector3

    constructor(gCode: string, width: number, height: number) {
        console.log("init")
        this.scene = new Scene()
        this.renderer = new WebGLRenderer()
        this.renderer.setSize(width, height)
        this.renderer.setClearColor(0x808080, 1)
        this.camera = this.newCamera(width, height)

        this.gCode = gCode
        
        this.init()
    }

    private newCamera(width: number, height: number) {
        const camera = new PerspectiveCamera(75, width / height, 0.1, 1000)
        camera.position.z = 200

        if (this.cameraControl) {
            this.cameraControl.dispose()
        }
        this.cameraControl = new OrbitControls(camera, this.renderer.domElement)
        this.cameraControl.enablePan = true
        this.cameraControl.enableZoom = true
        this.cameraControl.minDistance = -Infinity
        this.cameraControl.maxDistance = Infinity
        return camera
    }

    private fitCamera(offset?: number) {
        offset = offset || 1.25
    
        const boundingBox = new Box3(this.min, this.max);
        const center = new Vector3()
        boundingBox.getCenter(center)   
        this.camera.lookAt(center)
        if (this.cameraControl) {
            this.cameraControl.target = center
        }
        
    }

    private calcMinMax(newPoint: Vector3) {
        if (this.min === undefined) {
            this.min = newPoint
        }
        if (this.max === undefined) {
            this.max = newPoint
        }

        if (newPoint.x >  this.max.x) {
            this.max.x = newPoint.x
        }
        if (newPoint.y > this.max.y) {
            this.max.y = newPoint.y
        }
        if (newPoint.z > this.max.z) {
            this.max.z = newPoint.z
        }

        if (newPoint.x <  this.min.x) {
            this.min.x = newPoint.x
        }
        if (newPoint.y <  this.min.y) {
            this.min.y = newPoint.y
        }
        if (newPoint.z <  this.min.z) {
            this.min.z = newPoint.z
        }
    }

    private addLine(points: CurvePath<Vector3>) {
        if (points.getPoints().length <= 0) {
            return
        }

        // TODO: why do I have to calculate the length * 2? With less the lines are as round.
        const lineGeometry = new TubeGeometry(points, points.getPoints().length * 2, 0.4, 8, false);
        this.lines.push(lineGeometry)
    }

    private async init() {
        let curve: CurvePath<Vector3> = new CurvePath()
        let lastPoint: Vector3 = new Vector3(0, 0, 0)
        this.calcMinMax(lastPoint)

        function parseValue(value?: string): number | undefined {
            if (!value) {
                return undefined
            }  
            return Number.parseFloat(value.substring(1))
        }

        let lastX = 0
        let lastY = 0
        let lastZ = 0

        this.gCode.split("\n").forEach((line)=> {
            if (line[0] === ";") {
                return
            }

            const cmd = line.split(" ")
            if (cmd[0] === "G0" || cmd[0] === "G1") {
                const x = parseValue(cmd.find((v) => v[0] === "X")) || lastX
                const y = parseValue(cmd.find((v) => v[0] === "Y")) || lastY
                const z = parseValue(cmd.find((v) => v[0] === "Z")) || lastZ
                const e = parseValue(cmd.find((v) => v[0] === "E")) || 0

                lastX = x
                lastY = y
                lastZ = z

                if (e === 0) {
                    this.addLine(curve)
                    curve = new CurvePath()
                }

                const newPoint = new Vector3(x, y, z)
                this.calcMinMax(newPoint)
                curve.add(new LineCurve3(lastPoint, newPoint))
                
                lastPoint = newPoint
            }
        })

        this.addLine(curve)
       
        this.combinedLine = BufferGeometryUtils.mergeBufferGeometries(this.lines) || undefined

        this.scene.add(new Mesh(this.combinedLine, this.lineMaterial))
        
        this.fitCamera()
    }

    render() {
        this.running = true
        this.loop()
    }

    update() {
        
    }

    private loop = () => {
        if (!this.running || !this.camera) {
            return
        }
        requestAnimationFrame(this.loop)

        this.update()

	    this.renderer.render(this.scene, this.camera)
    }

    element(): HTMLCanvasElement {
        return this.renderer.domElement
    }

    dispose() {
        this.running = false
        this.lines.forEach(l => l.dispose())
        this.cameraControl?.dispose()
        this.combinedLine?.dispose()
    }

    resize(width: number, height: number) {
        this.camera = this.newCamera(width, height)
        this.renderer.setSize(width, height)
    }
}