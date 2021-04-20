import * as PlainJSX from "../plainJSX";
import {Window} from "../window";
import { GCodeRenderer } from "../gcode/gcode";


export default class GCodeViewer extends Window {
    private renderer: GCodeRenderer | undefined

    constructor() {
        super()
        this.focus()
        this.onClose = () => {
            if (!this.renderer) {
                return
            }
            this.renderer.destroy()
            this.renderer = undefined
        }

        this.setWindowName(<>GCode Viewer</>)

        this.setWindowContent(
            <div id="gcode-viewer-container">Loading...</div>
        )

        const getGcode = async () => {
            const res = await fetch("gopher.stl.gcode")
            if (!res.body) {
                this.setWindowContent(
                    <div id="gcode-viewer-container">No GCode</div>
                ) 
                return
            }
    
            const gcode = await res.text()
            this.renderer = new GCodeRenderer(gcode, this.width(), this.height())
            this.setWindowContent(
                <>{this.renderer.element()}</>
            )

            this.renderer.render()
            this.onResize = () => {
                if (!this.renderer) {
                    return
                }

                this.renderer.resize(this.width(), this.height())
            }
        }

        getGcode()
    }
}