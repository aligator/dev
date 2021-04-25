import {
    Box3,
    BufferGeometry,
    Mesh,
    PerspectiveCamera,
    Color,
    Scene,
    Vector3,
    WebGLRenderer,
    Texture,
    LineCurve3,
    AmbientLight,
    SpotLight,
    MeshPhongMaterial, Line
} from 'three'
import { OrbitControls } from '@three-ts/orbit-controls'
import {LineTubeGeometry} from "./LineTubeGeometry";
import {LinePoint} from "./LinePoint";

export class GCodeRenderer {

    private running: boolean = false
    private readonly scene: Scene
    private readonly renderer: WebGLRenderer
    private cameraControl?: OrbitControls

    private camera: PerspectiveCamera

    private texture?: Texture
    private gopherBlue = new Color("#29BEB0")
    private lineMaterial = new MeshPhongMaterial({ color: this.gopherBlue, vertexColors: false } )

    private points: LinePoint[] = []
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
/*
    private addLine(point1: Vector3, lastExtrusion: number, point2: Vector3, extrusion: number) {
        //const color = this.lines.length % 2 === 0 ? new Color("#ff0000") : new Color("#00ff00")
        if (point1.equals(point2)) {
            // ToDo: lines of zero length - check why that happens
            return
        }
        const curve = new LineCurve3(point1, point2)
        const length = curve.getLength()

        let radius = (extrusion - lastExtrusion) / length * 10

        const point = new LinePoint(point2, radius);

       /!* const colors: number[] = []
        for (let i = 0, n = lineGeometry.attributes.position.count; i < n; ++ i) {
            colors.push(...this.gopherBlue.toArray());
        }
        lineGeometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
*!/
        this.points.push(point)
    }*/

    private async init() {
        let lastPoint: Vector3 = new Vector3(0, 0, 0)
        this.points.push(new LinePoint(lastPoint, 0))

        this.calcMinMax(lastPoint)

        function parseValue(value?: string): number | undefined {
            if (!value) {
                return undefined
            }
            return Number.parseFloat(value.substring(1))
        }

        const relative: {
            x: boolean,
            y: boolean,
            z: boolean,
            e: boolean
        } = {
            x: false, y: false, z: false, e: false
        }

        let lastX = 0
        let lastY = 0
        let lastZ = 0
        let lastE = 0
        let nextRadius = 0

        function getValue(cmd: string[], name: string, last: number, relative: boolean): number {
            let val = parseValue(cmd.find((v) => v[0] === name))

            if (val !== undefined) {
                if (relative) {
                    val += last
                }
            } else {
                val = last
            }

            return val
        }

        this.gCode.split("\n").forEach((line)=> {
            if (line[0] === ";") {
                return
            }

            const cmd = line.split(" ")
            if (cmd[0] === "G0" || cmd[0] === "G1") {
                const x = getValue(cmd,"X", lastX, relative.x)
                const y = getValue(cmd,"Y", lastY, relative.y)
                const z = getValue(cmd,"Z", lastZ, relative.z)
                const e = getValue(cmd,"E", lastE, relative.e)

                const newPoint = new Vector3(x, y, z)
                const lastPoint = new Vector3(lastX, lastY, lastZ)

                this.points.push(new LinePoint(newPoint, nextRadius))
                this.calcMinMax(newPoint)

                const curve = new LineCurve3(lastPoint, newPoint)
                const length = curve.getLength()
                nextRadius = (e - lastE) / length * 10

                lastX = x
                lastY = y
                lastZ = z
                lastE = e
            } else if (cmd[0] === "G92") {
                // set state
                lastX = parseValue(cmd.find((v) => v[0] === "X")) || lastX
                lastY = parseValue(cmd.find((v) => v[0] === "Y")) || lastY
                lastZ = parseValue(cmd.find((v) => v[0] === "Z")) || lastZ
                lastE = parseValue(cmd.find((v) => v[0] === "E")) || lastE
            }
        })
/*
        this.points = [
            new LinePoint(new Vector3(0, 0, 0), 10),
            new LinePoint(new Vector3(100, 100, 100), 10)
        ]*/

        // this.combinedLine = BufferGeometryUtils.mergeBufferGeometries(this.points) || undefined

        this.combinedLine = new LineTubeGeometry(this.points)
        this.scene.add(new Mesh(this.combinedLine, this.lineMaterial))

        this.fitCamera()
        const ambientLight = new AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

     //   const spotLight = new SpotLight(0xffffff, 0.9);
     //    spotLight.position.set(200, 400, 300);
     //    spotLight.lookAt(new Vector3(0, 0, 0))
        const spotLight2 = new SpotLight(0xffffff, 0.9);
        spotLight2.position.set(-200, -400, -300);
        spotLight2.lookAt(new Vector3(0, 0, 0))
        // this.scene.add(spotLight);
        this.scene.add(spotLight2);
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
        //this.lines.forEach(l => l.dispose())
        this.cameraControl?.dispose()
        this.combinedLine?.dispose()
        this.texture?.dispose()
    }

    resize(width: number, height: number) {
        this.camera = this.newCamera(width, height)
        this.renderer.setSize(width, height)
    }
}