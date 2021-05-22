import * as PlainJSX from "../plainJSX";
import { Window } from "../window";
import { PlainJSXElement } from "../plainJSX";

import './alert.scss'

interface Options {
    title: string,
    content: PlainJSXElement
}

export default class Alert extends Window {
    
    constructor({title, content}: Options) {
        super({
            width: 400, 
            height: 200, 
            x: window.innerWidth / 2 - 400 / 2,
            y: window.innerHeight / 2 - 200 / 2
        })
        this.focus()

        this.setWindowName(<>{title}</>)
        this.setWindowContent(
            <div className="alert-container">{content}</div>
        )
    }
}