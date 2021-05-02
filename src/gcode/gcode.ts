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
    MeshPhongMaterial
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { LineTubeGeometry } from "./LineTubeGeometry";
import { LinePoint } from "./LinePoint";
import { Lut } from 'three/examples/jsm/math/Lut';
import { SegmentColorizer, SimpleColorizer } from './SegmentColorizer';

export class GCodeRenderer {

    private running: boolean = false
    private readonly scene: Scene
    private readonly renderer: WebGLRenderer
    private cameraControl?: OrbitControls

    private camera: PerspectiveCamera

    private texture?: Texture
    private lineMaterial = new MeshPhongMaterial({  vertexColors: true } )

    private points: LinePoint[] = []
    private combinedLine?: LineTubeGeometry

    private readonly gCode: string

    private min?: Vector3
    private max?: Vector3

    private minTemp: number | undefined = undefined
    private maxTemp = 0
    private minSpeed: number | undefined = undefined
    private maxSpeed = 0

    private layerIndex: {start: number, end: number}[] = []

    public travelWidth: number = 0.01
    public colorizer: SegmentColorizer = new SimpleColorizer()

    constructor(gCode: string, width: number, height: number, background: Color) {
        console.log("init")
        this.scene = new Scene()
        this.renderer = new WebGLRenderer()
        this.renderer.setSize(width, height)
        this.renderer.setClearColor(background, 1)
        this.camera = this.newCamera(width, height)

        this.gCode = gCode

        this.calcMinMaxMetadata()
    }

    public getMinMaxValues() {
        return {
            minTemp: this.minTemp,
            maxTemp: this.maxTemp,
            minSpeed: this.minSpeed,
            maxSpeed: this.maxSpeed
        }
    }

    private newCamera(width: number, height: number) {
        const camera = new PerspectiveCamera(75, width / height, 0.1, 1000)
        camera.position.z = 100

        if (this.cameraControl) {
            this.cameraControl.dispose()
        }
        this.cameraControl = new OrbitControls(camera, this.renderer.domElement)
        this.cameraControl.enablePan = true
        this.cameraControl.enableZoom = true
        this.cameraControl.minDistance = -Infinity
        this.cameraControl.maxDistance = Infinity

        this.cameraControl?.addEventListener("change", () => {
            requestAnimationFrame(() => this.draw())    
        })

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
            this.min = newPoint.clone()
        }
        if (this.max === undefined) {
            this.max = newPoint.clone()
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

    private parseValue(value?: string): number | undefined {
        if (!value) {
            return undefined
        }
        return Number.parseFloat(value.substring(1))
    }

    /**
     * Pre-calculates the min max metadata which may be needed for the colorizers.
     */
    private calcMinMaxMetadata() {
        this.gCode.split("\n").forEach((line)=> {
            if (line[0] === ";") {
                return
            }

            const cmd = line.split(" ")
            if (cmd[0] === "G0" || cmd[0] === "G1") {
                // Feed rate -> speed
                const f = this.parseValue(cmd.find((v) => v[0] === "F"))

                if (f === undefined) {
                    return
                }

                if (f > this.maxSpeed) {
                    this.maxSpeed = f
                }
                if (this.minSpeed === undefined || f < this.minSpeed) {
                    this.minSpeed = f
                }
            } else if (cmd[0] === "M104" || cmd[0] === "M109") {
                // hot end temperature
                // M104 S205 ; set hot end temp
                // M109 S205 ; wait for hot end temp
                const hotendTemp = this.parseValue(cmd.find((v) => v[0] === "S")) || 0

                if (hotendTemp > this.maxTemp) {
                    this.maxTemp = hotendTemp
                }
                if (this.minTemp === undefined || hotendTemp < this.minTemp) {
                    this.minTemp = hotendTemp
                }
            }
        })
    }

    public async render() {
        let lastPoint: Vector3 = new Vector3(0, 0, 0)

        const layerPointsCache: Map<number, {start: number, end: number}> = new Map()

        const relative: {
            x: boolean,
            y: boolean,
            z: boolean,
            e: boolean
        } = {
            x: false, y: false, z: false, e: false
        }

        let lastE = 0
        let hotendTemp = 0
        let lastF = 0

        const getValue = (cmd: string[], name: string, last: number, relative: boolean): number => {
            let val = this.parseValue(cmd.find((v) => v[0] === name))

            if (val !== undefined) {
                if (relative) {
                    val += last
                }
            } else {
                val = last
            }

            return val
        }

        this.gCode.split("\n").forEach((line, i)=> {
            if (line[0] === ";") {
                return
            }

            const cmd = line.split(" ")
            if (cmd[0] === "G0" || cmd[0] === "G1") {
                const x = getValue(cmd,"X", lastPoint.x, relative.x)
                const y = getValue(cmd,"Y", lastPoint.y, relative.y)
                const z = getValue(cmd,"Z", lastPoint.z, relative.z)
                const e = getValue(cmd,"E", lastE, relative.e)
                const f = this.parseValue(cmd.find((v) => v[0] === "F")) || lastF

                const newPoint = new Vector3(x, y, z)

                const curve = new LineCurve3(lastPoint, newPoint)
                const length = curve.getLength()

                // TODO: why are there some with length 0 is it an error in GoSlice??
                if (length !== 0) {
                    let radius = (e - lastE) / length * 10

                    if (radius == 0) {
                        radius = this.travelWidth
                    } else {
                        this.calcMinMax(newPoint)
                    }

                    const color = this.colorizer.getColor({
                        radius,
                        segmentStart: lastPoint,
                        segmentEnd: newPoint,
                        speed: f,
                        temp: hotendTemp
                    });

                    // Insert the last point with the current radius.
                    // As the GCode contains the extrusion for the current line, 
                    // but the LinePoint contains the radius for the 'next' line
                    // we need to combine the last point with the current radius.
                    this.points.push(new LinePoint(lastPoint.clone(), radius, color))

                    if (lastPoint.z !== newPoint.z) {
                        let last = layerPointsCache.get(lastPoint.z)
                        let current = layerPointsCache.get(newPoint.z)

                        if (last === undefined) {
                            last = {
                                end: 0,
                                start: 0
                            }
                        }

                        if (current === undefined) {
                            current = {
                                end: 0,
                                start: 0
                            }
                        }

                        last.end = this.points.length-1
                        current.start = this.points.length

                        layerPointsCache.set(lastPoint.z, last)
                        layerPointsCache.set(newPoint.z, current)
                    }

                    lastPoint = newPoint
                }

                lastPoint = new Vector3(x, y, z)
                lastE = e
                lastF = f
            } else if (cmd[0] === "G92") {
                // set state
                lastPoint = new Vector3(
                    this.parseValue(cmd.find((v) => v[0] === "X")) || lastPoint.x,
                    this.parseValue(cmd.find((v) => v[0] === "Y")) || lastPoint.y,
                    this.parseValue(cmd.find((v) => v[0] === "Z")) || lastPoint.z
                )
                lastE = this.parseValue(cmd.find((v) => v[0] === "E")) || lastE
            } else if (cmd[0] === "M104" || cmd[0] === "M109") {
                // hot end temperature
                // M104 S205 ; start heating hot end
                // M109 S205 ; wait for hot end temperature
                hotendTemp = this.parseValue(cmd.find((v) => v[0] === "S")) || 0
            }
        })

        this.combinedLine = new LineTubeGeometry(this.points)
        this.scene.add(new Mesh(this.combinedLine, this.lineMaterial))

        this.layerIndex = Array.from(layerPointsCache.values()).sort((v1, v2) => v1.start - v2.start)

        this.fitCamera()
        const ambientLight = new AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const spotLight = new SpotLight(0xffffff, 0.9);
        spotLight.position.set(200, 400, 300);
        spotLight.lookAt(new Vector3(0, 0, 0))
        const spotLight2 = new SpotLight(0xffffff, 0.9);
        spotLight2.position.set(-200, -400, -300);
        spotLight2.lookAt(new Vector3(0, 0, 0))
        this.scene.add(spotLight);
        this.scene.add(spotLight2);
    }

    public startLoop() {
        if (this.combinedLine === undefined) {
            throw new Error("render has not been called yet")
        }
        this.running = true
        this.draw()
    }

    private draw() {
        if (!this.running || !this.camera) {
            return
        }
        this.renderer.render(this.scene, this.camera)
    }

    public slice(start?: number, end?: number) {
        this.combinedLine?.slice(start, end)
        this.draw()
    }

    public sliceLayer(start?: number, end?: number) {
        this.combinedLine?.slice(start && this.layerIndex[start]?.start, end && this.layerIndex[end]?.end)
        this.draw()
    }

    public element(): HTMLCanvasElement {
        return this.renderer.domElement
    }

    public dispose() {
        this.running = false
        this.cameraControl?.dispose()
        this.combinedLine?.dispose()
        this.texture?.dispose()
    }

    public pointsCount(): number {
        return this.combinedLine?.pointsCount() || 0
    }

    public layers(): number {
        return this.layerIndex.length || 0
    }

    public resize(width: number, height: number) {
        this.camera = this.newCamera(width, height)
        this.renderer.setSize(width, height)
        this.draw()
    }
}