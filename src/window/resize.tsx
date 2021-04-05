import * as PlainJSX from "../plainJSX";

export function makeResizeable(resizeable: HTMLDivElement) {
    const top: HTMLDivElement = (<div className='resizer top'></div>).getFirstAs()
    const bottom: HTMLDivElement = (<div className='resizer bottom'></div>).getFirstAs()
    const left: HTMLDivElement = (<div className='resizer left'></div>).getFirstAs()
    const right: HTMLDivElement = (<div className='resizer right'></div>).getFirstAs()

    resizeable.append(
        top,
        bottom,
        left,
        right
    )

    top.onmousedown = (e) => {
        document.onmouseup = clearOnMouseMove
        document.onmousemove = (e => {
            const y = e.clientY;

            const currentHeight = parseFloat(resizeable.style.height || "0")
            const currentY = parseFloat(resizeable.style.top || "0")
            const newHeight = currentHeight + currentY - y

            resizeable.style.top = `${y}px`
            resizeable.style.height = `${newHeight}px`
            resizeable.style.maxHeight = `${newHeight}px`
        })
    }

    bottom.onmousedown = (e) => {
        document.onmouseup = clearOnMouseMove
        document.onmousemove = (e => {
            const y = e.clientY;

            const currentY = parseFloat(resizeable.style.top || "0")
            const newHeight = y - currentY

            resizeable.style.height = `${newHeight}px`
            resizeable.style.maxHeight = `${newHeight}px`
        })
    }

    left.onmousedown = (e) => {
        document.onmouseup = clearOnMouseMove
        document.onmousemove = (e => {
            const x = e.clientX;

            const currentX = parseFloat(resizeable.style.left || "0")
            const currentWidth = parseFloat(resizeable.style.width || "0")

            const newWidth = currentWidth + currentX - x

            resizeable.style.left = `${x}px`
            resizeable.style.width = `${newWidth}px`
        })
    }

    right.onmousedown = (e) => {
        document.onmouseup = clearOnMouseMove
        document.onmousemove = (e => {
            const x = e.clientX;

            const currentX = parseFloat(resizeable.style.left || "0")
            const newWidth = x - currentX

            resizeable.style.width = `${newWidth}px`
        })
    }

    function clearOnMouseMove(): void {
        document.onmousemove = null
    }
}