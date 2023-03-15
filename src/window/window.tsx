import * as PlainJSX from "../plainJSX"
import { getRoot } from "../utils"
import { PlainJSXElement } from "../plainJSX"
import "./resize"
import "./move"
import { dragElement } from "./move"
import { makeResizeable } from "./resize"

import "./window.css"

export type ResizeHandler = (width: number, height: number) => void

let lastWinID = 0

function getBorderWidth() {
    return parseFloat(
        getComputedStyle(document.body).getPropertyValue(
            "--window-border-width"
        )
    )
}

export class Window {
    readonly windowID: string
    private readonly titleElement: HTMLDivElement
    private readonly headerElement: HTMLDivElement
    private readonly contentElement: HTMLDivElement

    private _isMaximized = false
    public get isMaximized(): boolean {
        return this._isMaximized
    }
    public set isMaximized(newValue: boolean) {
        this._isMaximized = newValue
        if (this._isMaximized) {
            this.element.style.width = `${
                window.innerWidth - getBorderWidth() * 2
            }px`
            this.element.style.height = `${
                window.innerHeight - getBorderWidth()
            }px`
            this.element.style.left = "0px"
            this.element.style.top = "0px"
            this.element.style.maxHeight = "100%"
        }
    }

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
                    <button
                        className="window-button window-button-close"
                        onclick={() => this.close()}
                    />
                    <button
                        className="window-button window-button-maximize"
                        onclick={() => (this.isMaximized = !this.isMaximized)}
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
        this.element.style.width = `${window.innerWidth * 0.9}px`
        this.element.style.maxHeight = `100%`
        this.element.style.height = `${window.innerHeight * 0.9}px`

        makeResizeable(this.element, (width: number, height: number) => {
            if (this.onResize) {
                this.onResize(width, height)
            }
            this.isMaximized = false
        })

        dragElement(this.element, this.headerElement, () => {
            this.isMaximized = false
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
