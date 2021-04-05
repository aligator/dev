/*const windows = document.getElementsByClassName("window")
for (let i=0; i<=windows.length; i++) {
    const element = windows.item(i)
    if (element) {
        dragElement(element as HTMLDivElement)
    }
}*/

export function dragElement(movable: HTMLDivElement, handle: HTMLDivElement) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    // if present, the header is where you move the DIV from:
    handle.onmousedown = dragMouseDown

    function dragMouseDown(e: MouseEvent) {
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e: MouseEvent) {
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        let newPosTop = (movable.offsetTop - pos2)
        let newPosLeft = (movable.offsetLeft - pos1)
        if (newPosTop < 0) {
            newPosTop = 0
        }
        if (newPosLeft < 0) {
            newPosLeft = 0
        }
        movable.style.top = newPosTop + "px";
        movable.style.left = newPosLeft + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}