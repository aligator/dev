import three, { BoxGeometry, Camera, Color, Mesh, MeshBasicMaterial, PerspectiveCamera, Renderer, Scene, WebGLRenderer } from 'three'

export class GCodeRenderer {

    private running: boolean = false   
    private readonly gCode: string
    private readonly scene: Scene
    private readonly camera: Camera
    private readonly renderer: Renderer

    private cube: Mesh

    constructor(gCode: string, width: number, height: number) {
        console.log("init")
        this.gCode = gCode
        this.scene = new Scene()
        this.camera = new PerspectiveCamera(75, width / height, 0.1, 1000)
        this.renderer = new WebGLRenderer()
        
        this.renderer.setSize(width, height)

        const geometry = new BoxGeometry()
        const material = new MeshBasicMaterial({color: 0x00ff00})
        this.cube = new Mesh(geometry, material)
        this.scene.add(this.cube)
        this.camera.position.z = 5
    }


    render() {
        this.running = true
        this.loop()
    }

    private loop = () => {
        if (!this.running) {
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
}