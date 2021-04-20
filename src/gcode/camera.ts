import { PerspectiveCamera, Renderer } from "three"

export class CameraControl {
    zoomMode: boolean = false
    press: boolean = false
    sensitivity: number = 0.02

    constructor(renderer: Renderer, public camera: PerspectiveCamera, updateCallback:() => void){
        renderer.domElement.addEventListener('mousemove', event => {
            if(!this.press){ return }

            if(event.button == 0){
                camera.position.y += event.movementY * this.sensitivity
                camera.position.x -= event.movementX * this.sensitivity        
            } else if(event.button == 2){
                camera.quaternion.y -= event.movementX * this.sensitivity/10
                camera.quaternion.x -= event.movementY * this.sensitivity/10
            }

            updateCallback()
        })    

        renderer.domElement.addEventListener('mousedown', () => { this.press = true })
        renderer.domElement.addEventListener('mouseup', () => { this.press = false })
        renderer.domElement.addEventListener('mouseleave', () => { this.press = false })

        document.addEventListener('keydown', event => {
            if(event.key == 'Shift'){
                this.zoomMode = true
            }
        })

        document.addEventListener('keyup', event => {
            if(event.key == 'Shift'){
                this.zoomMode = false
            }
        })

        renderer.domElement.addEventListener('wheel', (event) => {
            console.log("wheel")
            const wheelEvent = event as WheelEvent
            if(this.zoomMode){ 
                camera.fov += wheelEvent.deltaY * this.sensitivity
                camera.updateProjectionMatrix()
            } else {
                camera.position.z += wheelEvent.deltaY * this.sensitivity
            }

            updateCallback()
        })
    }
}