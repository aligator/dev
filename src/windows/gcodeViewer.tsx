import * as PlainJSX from "../plainJSX";
import {Window} from "../window";
import { GCodeRenderer } from "../gcode/gcode";
import { SpeedColorizer } from "../gcode/SegmentColorizer";


export default class GCodeViewer extends Window {
    private renderer: GCodeRenderer | undefined

    constructor(gcode?: string) {
        super()
        this.focus()
        this.onClose = () => {
            if (!this.renderer) {
                return
            }
            this.renderer.dispose()
            this.renderer = undefined
        }

        this.setWindowName(<>GCode Viewer</>)

        this.setWindowContent(
            <div className="gcode-viewer-message">Loading...</div>
        )

        const getGcode = async () => {
            let gcodeString = gcode
            if (!gcodeString) {
                const res = await fetch("gopher.stl.gcode")
                if (!res.body) {
                    this.setWindowContent(
                        <div className="gcode-viewer-message">No GCode</div>
                    )
                    return
                }
        
                gcodeString = await res.text()
            }
            
            this.renderer = new GCodeRenderer(gcodeString, this.width(), this.height())
            this.renderer.colorizer = new SpeedColorizer(this.renderer.getMinMaxValues().minSpeed || 0, this.renderer.getMinMaxValues().maxSpeed)
            await this.renderer.render()
            
            this.setWindowContent(
                <>{this.renderer.element()}</>
            )

            this.renderer.startLoop()
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