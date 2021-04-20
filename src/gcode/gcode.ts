import three, { BoxGeometry, Camera, Color, Mesh, MeshBasicMaterial, PerspectiveCamera, Renderer, Scene, WebGLRenderer } from 'three'

export class GCodeRenderer {

    private running: boolean = false   
    private readonly gCode: string
    private readonly scene: Scene
    private readonly renderer: Renderer

    private camera: Camera | undefined

    private cube: Mesh

    constructor(gCode: string, width: number, height: number) {
        console.log("init")
        this.gCode = gCode
        this.scene = new Scene()
        this.renderer = new WebGLRenderer()
        
        this.renderer.setSize(width, height)

        const geometry = new BoxGeometry()
        const material = new MeshBasicMaterial({color: 0x00ff00})
        this.cube = new Mesh(geometry, material)
        this.scene.add(this.cube)

        this.initCamera(width, height)
    }

    private initCamera(width: number, height: number) {
        this.camera = new PerspectiveCamera(75, width / height, 0.1, 1000)
        this.camera.position.z = 5
    }

    render() {
        this.running = true
        this.loop()
    }

    private loop = () => {
        if (!this.running || !this.camera) {
            return
        }

        requestAnimationFrame(this.loop);
        console.log("render")
        this.cube.rotation.x += 0.01;
		this.cube.rotation.y += 0.01;
	    this.renderer.render(this.scene, this.camera);
    }

    element(): HTMLCanvasElement {
        return this.renderer.domElement
    }

    stop() {
        this.running = false
    }

    resize(width: number, height: number) {
        console.log("resize", width, height)
        this.initCamera(width, height)
        this.renderer.setSize(width, height)
    }
}