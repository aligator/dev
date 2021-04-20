import three, { BoxGeometry, BufferGeometry, Camera, CylinderGeometry, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, PerspectiveCamera, Renderer, Scene, TorusGeometry, Vector3, WebGLRenderer } from 'three'
import { CameraControl } from './camera'

export class GCodeRenderer {

    private running: boolean = false   
    private readonly scene: Scene
    private readonly renderer: Renderer
    private readonly cameraControl: CameraControl 

    private camera: PerspectiveCamera

    private lineMaterial = new LineBasicMaterial({color: 0x00ff00})

    private lines: BufferGeometry[] = []

    private readonly gCode: string

    constructor(gCode: string, width: number, height: number) {
        console.log("init")
        this.scene = new Scene()
        this.renderer = new WebGLRenderer()
        this.renderer.setSize(width, height)
        this.camera = GCodeRenderer.newCamera(width, height)
        this.gCode = gCode
        
        this.cameraControl = new CameraControl(this.renderer, this.camera, () => undefined)

        this.init()
    }

    private static newCamera(width: number, height: number) {
        const camera = new PerspectiveCamera(75, width / height, 0.1, 1000)
        camera.position.z = 5
        return camera
    }

    private async init() {
        let points: Vector3[] = []

        function parseValue(value?: string): number | undefined {
            if (!value) {
                return undefined
            }  
            return Number.parseFloat(value.substring(1))
        }

        this.gCode.split("\n").forEach((line)=> {
            if (line[0] === ";") {
                return
            }

            const cmd = line.split(" ")
            let lastX = 0
            let lastY = 0
            let lastZ = 0
            if (cmd[0] === "G0" || cmd[0] === "G1") {
                const x = parseValue(cmd.find((v) => v[0] === "X")) || lastX
                const y = parseValue(cmd.find((v) => v[0] === "Y")) || lastY
                const z = parseValue(cmd.find((v) => v[0] === "Z")) || lastZ
                const e = parseValue(cmd.find((v) => v[0] === "E")) || 0

                lastX = x
                lastY = y
                lastZ = z

                if (e === 0) {
                   // console.log(points)
                    const lineGeometry = new BufferGeometry().setFromPoints(points);
                    this.lines.push(lineGeometry)
                    const line = new Line(lineGeometry, this.lineMaterial)
                    this.scene.add(line)
                    points = []
                }

                points.push(new Vector3(x, y, z))
            }
        })

        const lineGeometry = new BufferGeometry().setFromPoints(points);
        this.lines.push(lineGeometry)
        const line = new Line(lineGeometry, this.lineMaterial)
        this.scene.add(line)
        points = []
        
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

    destroy() {
        this.running = false
        this.lines.forEach(l => l.dispose())
    }

    resize(width: number, height: number) {
        console.log("resize", width, height)
        this.camera = GCodeRenderer.newCamera(width, height)
        this.renderer.setSize(width, height)
    }
}