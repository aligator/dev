import * as PlainJSX from "../plainJSX"
import { getRoot } from "../utils"
import { PlainJSXElement } from "../plainJSX"
import "./resize"
import "./move"
import { dragElement } from "./move"
import { makeResizeable } from "./resize"

import "./window.css"

let lastWinID = 0

export class Window {
    readonly windowID: string
    private readonly titleElement: HTMLDivElement
    private readonly headerElement: HTMLDivElement
    private readonly contentElement: HTMLDivElement

    onClose?: () => void
    onClick?: (e: MouseEvent) => void
    onResize?: (width: number, height: number) => void

    component: PlainJSXElement
    element: HTMLDivElement

    constructor() {
        this.windowID = `window-${lastWinID}`
        lastWinID++
        const content = <div className="window-content"></div>
        const title = <div className="window-title" />
        const header = (
            <div className="window-header">
                <div className="window-buttons">
                    <div
                        className="window-button window-button-close"
                        onclick={() => this.close()}
                    />
                </div>
                <div className="window-header-spacer"></div>
                {title}
                <div className="window-header-spacer"></div>
            </div>
        )
        this.titleElement = title.getFirstAs()
        this.headerElement = header.getFirstAs()
        this.contentElement = content.getFirstAs()

        this.component = (
            <div id={this.windowID} className="window">
                {header}
                {content}
            </div>
        )

        this.element = this.component.getFirstAs()
        this.element.style.width = "900px"
        this.element.style.maxHeight = "800px"
        this.element.style.height = "800px"

        dragElement(this.element, this.headerElement)
        makeResizeable(this.element, (width: number, height: number) => {
            if (this.onResize) {
                this.onResize(width, height)
            }
        })

        this.element.addEventListener("click", (e) => {
            this.focus()

            if (this.onClick) {
                this.onClick(e)
            }
        })

        getRoot().append(this.element)
    }

    width(): number {
        return this.element.clientWidth
    }

    height(): number {
        return this.element.clientHeight - this.headerElement.clientHeight
    }

    setWindowName(component: PlainJSXElement): void {
        this.titleElement.innerHTML = ""
        this.titleElement.append(...component.children)
    }
    setWindowContent(component: PlainJSXElement): void {
        this.contentElement.innerHTML = ""
        this.contentElement.append(...component.children)
    }
    close(): void {
        if (this.onClose) {
            this.onClose()
        }

        this.component.delete()
    }
    focus(): void {
        this.element.focus()
        const focused = document.getElementsByClassName("window-focused")
        for (let i = 0; i <= focused.length; i++) {
            const item = focused.item(i)
            if (item) {
                item.classList.remove("window-focused")
            }
        }
        this.element.classList.add("window-focused")
    }
}
