import * as PlainJSX from "../plainJSX";
import { Window } from "../window";
import { Test } from "../components/Test";

import './test.scss'

export default class TestWindow extends Window {
   
    constructor(text?: string) {
        super()
        this.focus()

        this.setWindowName(<>Test</>)

        this.setWindowContent(
            <div className="gcode-viewer-message"><Test text={text || ""}></Test></div>
        )
    }
}