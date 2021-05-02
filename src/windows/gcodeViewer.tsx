import * as PlainJSX from "../plainJSX";
import {Window} from "../window";
import { GCodeRenderer } from "../gcode/gcode";
import { SpeedColorizer } from "../gcode/SegmentColorizer";
import { Color } from "three";


export default class GCodeViewer extends Window {
    private renderer: GCodeRenderer | undefined
    private bottomGap: number = 20

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

            this.renderer = new GCodeRenderer(gcodeString, this.width(), this.height() - this.bottomGap, new Color(0x808080))
            this.renderer.colorizer = new SpeedColorizer(this.renderer.getMinMaxValues().minSpeed || 0, this.renderer.getMinMaxValues().maxSpeed)
            await this.renderer.render()

            this.setWindowContent(
                <div className="gcode-viewer">
                    {this.renderer.element()}
                    <div className="toolbar">
                    <input  // TODO: make toolbar generic in window?
                        type="range" 
                        min="1" 
                        max={this.renderer.layers().toString()} 
                        value={this.renderer.layers().toString()} 
                        className="end-slider" 
                        oninput={(e: Event) => {
                            const target = e.target as HTMLInputElement
                            this.renderer?.sliceLayer(0, Number.parseInt(target.value))
                        }} />
                    </div>
                </div>
            )

            this.renderer.startLoop()
            this.onResize = () => {
                if (!this.renderer) {
                    return
                }

                this.renderer.resize(this.width(), this.height() - this.bottomGap)
            }
        }

        getGcode()
    }
}