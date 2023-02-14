import * as PlainJSX from "../plainJSX";
import { Window } from "../window";
import { GCodeRenderer, SpeedColorizer, Color } from "gcode-viewer";
import { Slider } from "../components/Slider";

import './gCodeViewer.scss'

export default class GCodeViewer extends Window {
    private renderer: GCodeRenderer | undefined
    private bottomGap = 20

    constructor(gCode?: string) {
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

        const getGCode = async () => {
            let gCodeString = gCode
            if (!gCodeString) {
                const res = await fetch("gopher.stl.gcode")
                if (!res.body) {
                    this.setWindowContent(
                        <div className="gcode-viewer-message">No GCode</div>
                    )
                    return
                }

                gCodeString = await res.text()
            }

            this.renderer = new GCodeRenderer(gCodeString, this.width(), this.height() - this.bottomGap, new Color(0x808080))
            this.renderer.colorizer = new SpeedColorizer(this.renderer.getMinMaxValues().minSpeed || 0, this.renderer.getMinMaxValues().maxSpeed)
            await this.renderer.render()

            this.setWindowContent(
                <div className="gcode-viewer">
                    {this.renderer.element()}
                    <div className="toolbar">
                        <Slider  // TODO: make toolbar generic in window?
                            min="1"
                            max={this.renderer.layerCount().toString()}
                            value={this.renderer.layerCount().toString()}
                            className="slider end-slider"
                            oninput={(e: Event) => {
                                const target = e.target as HTMLInputElement
                                this.renderer?.sliceLayer(0, Number.parseInt(target.value))
                            }} />
                    </div>
                </div>
            )

            this.onResize = () => {
                if (!this.renderer) {
                    return
                }

                this.renderer.resize(this.width(), this.height() - this.bottomGap)
            }
        }

        getGCode()
    }
}