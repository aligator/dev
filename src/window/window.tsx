import * as PlainJSX from "../plainJSX";
import {getRoot} from "../utils";
import {PlainJSXElement} from "../plainJSX";
import  "./resize"
import "./move"
import {dragElement} from "./move";

let lastWinID = 0;

export class Window {
    readonly windowID: string
    private readonly headerElement: HTMLDivElement
    private readonly contentElement: HTMLDivElement
    onClick?: (e: MouseEvent) => void

    component: PlainJSXElement
    element: HTMLDivElement

    constructor() {
        this.windowID = `console-window-${lastWinID}`
        lastWinID++
        const header = <div className="window-header"></div>
        const content = <div className="window-content"></div>
        this.headerElement = (header).getFirstAs()
        this.contentElement = (content).getFirstAs()

        this.component = (
            <div id={this.windowID} className="window">
                {header}
                {content}
                <div className='resizer top'></div>
                <div className='resizer bottom'></div>
                <div className='resizer left'></div>
                <div className='resizer right'></div>
            </div>
        )

        this.element = this.component.getFirstAs()
        dragElement(this.element, this.headerElement)

        this.element.addEventListener("click", (e) => {
            this.focus()

            if (this.onClick) {
                this.onClick(e)
            }
        })

        getRoot().append(this.element)
    }

    setWindowName(component: PlainJSXElement) {
        this.headerElement.innerHTML = ""
        this.headerElement.append(...component.children)
    }
    setWindowContent(component: PlainJSXElement) {
        this.contentElement.innerHTML = ""
        this.contentElement.append(...component.children)
    }
    close() {
        this.component.delete()
    }
    focus() {
        this.element.focus()
        const focused = document.getElementsByClassName("window-focused")
        for (let i=0; i<=focused.length; i++) {
            const item = focused.item(i)
            if (item) {
                item.classList.remove("window-focused")
            }
        }
        this.element.classList.add("window-focused")
    }
}