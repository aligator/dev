import * as PlainJSX from "../plainJSX";
import { Window } from "../window";
import { GCodeRenderer, SpeedColorizer, Color } from "gcode-viewer";
import { Slider } from "../components/Slider";

import './gCodeViewer.scss'
import { useRef } from "../plainJSX/utils";

export default class GCodeViewer extends Window {
    private renderer: GCodeRenderer | undefined
    private bottomGap = 20

    constructor(gCode?: string) {
        super({})
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
             // const res = await fetch("Frontal_Bone.stl.gcode")
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
            this.renderer.pointsPerObject = 30000
            this.renderer.colorizer = new SpeedColorizer(this.renderer.getMinMaxValues().minSpeed || 0, this.renderer.getMinMaxValues().maxSpeed)
            await this.renderer.render()

            const ref = useRef()
            let from = 0
            let to = this.renderer.pointsCount()
            console.log(from, to)

            this.setWindowContent(
                <div className="gcode-viewer">
                    {this.renderer.element()}
                    <div className="toolbar">
                        <div id={ref.id} className="slider-value" />
                        <Slider  // TODO: make toolbar generic in window?
                            min="0"
                            max={(this.renderer.pointsCount()-1).toString()}
                            value={from.toString()}
                            className="slider end-slider"
                            oninput={(e: Event) => {
                                const target = e.target as HTMLInputElement
                                console.log(target.value)
                                from = Number.parseInt(target.value)
                                this.renderer?.slice(from, to)
                                ref.update((el) => {
                                    el.innerText = target.value
                                })
                            }} />
                        <Slider  // TODO: make toolbar generic in window?
                            min="1"
                            max={this.renderer.pointsCount().toString()}
                            value={to.toString()}
                            className="slider end-slider"
                            oninput={(e: Event) => { 
                                const target = e.target as HTMLInputElement
                                to = Number.parseInt(target.value)
                                
                                ref.update((el) => {
                                    el.innerText = `${from}-${to}`
                                })
                                this.renderer?.slice(from, to)
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