import { Box3, BufferGeometry, Mesh, PerspectiveCamera, Color, Renderer, Scene, Vector3, WebGLRenderer } from 'three'
import { OrbitControls } from 'three-orbitcontrols-ts'
import { MeshLine, MeshLineMaterial } from 'three.meshline';

export class GCodeRenderer {

    private running: boolean = false   
    private readonly scene: Scene
    private readonly renderer: Renderer
    private cameraControl?: OrbitControls 

    private camera: PerspectiveCamera

    private lineMaterial = new MeshLineMaterial({color: new Color("#29beb0"), lineWidth: 0.05})

    private lines: BufferGeometry[] = []

    private readonly gCode: string

    private min?: Vector3
    private max?: Vector3

    constructor(gCode: string, width: number, height: number) {
        console.log("init")
        this.scene = new Scene()
        this.renderer = new WebGLRenderer()
        this.renderer.setSize(width, height)
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
        this.cameraControl.minDistance = -Infinity;
        this.cameraControl.maxDistance = Infinity;
        return camera
    }

    private fitCamera(offset?: number) {
        offset = offset || 1.25;
    
        const boundingBox = new Box3(this.min, this.max);
        const center = new Vector3()
        boundingBox.getCenter(center);    
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

    private async init() {
        let points: Vector3[] = [new Vector3(0, 0, 0)]

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
                    const lineGeometry = new MeshLine();
                    lineGeometry.setPoints(points);
                    this.lines.push(lineGeometry)
                    const line = new Mesh(lineGeometry, this.lineMaterial)
                    this.scene.add(line)
                    const last = points[points.length-1]
                    points = last ? [last] : []
                }

                const newPoint = new Vector3(x, y, z)
                this.calcMinMax(newPoint)
                points.push(newPoint)       
            }
        })

        const lineGeometry = new MeshLine();
        lineGeometry.setPoints(points);
        this.lines.push(lineGeometry)
        const line = new Mesh(lineGeometry, this.lineMaterial)
        this.scene.add(line)
        points = []
        
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
        requestAnimationFrame(this.loop);

        this.update()

	    this.renderer.render(this.scene, this.camera);
    }

    element(): HTMLCanvasElement {
        return this.renderer.domElement
    }

    dispose() {
        this.running = false
        this.lines.forEach(l => l.dispose())
        this.cameraControl?.dispose()
    }

    resize(width: number, height: number) {
        this.camera = this.newCamera(width, height)
        this.renderer.setSize(width, height)
    }
}