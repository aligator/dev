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
            this.renderer.stop()
            this.renderer = undefined
        }

        this.setWindowName(<>GCode Viewer</>)

        this.setWindowContent(
            <div id="gcode-viewer-container">Loading...</div>
        )

        fetch("/gopher.stl.gcode").then((res) => res.text().then((gCode) => {
            this.renderer = new GCodeRenderer(gCode, this.width(), this.height())
            this.setWindowContent(
                <>{this.renderer.element()}</>
            )

            this.renderer.render()
        }))
    }
}