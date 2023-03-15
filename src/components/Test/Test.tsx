import PlainJSX, { PlainJSXElement } from "../../plainJSX"
import { useRef } from "../../plainJSX/utils"
import { Slider } from "../Slider"

import "./Test.scss"

interface Props {
    text: string
}

export default function Test({ text }: Props): PlainJSXElement {
    let counter = 0
    const counterRef = useRef()

    const handleClick = () => {
        counter++
        counterRef.update((ref) => {
            ref.innerText = `${counter}`
        })
    }

    return (
        <div>
            {text}
            <div id={counterRef.id}>{`${counter}`}</div>
            <button onclick={handleClick}>Do NOT Click Me</button>
            <Slider
                min="1"
                max={"10"}
                value={counter.toString()}
                className="slider end-slider"
                oninput={(e) => {
                    const target = e.target as HTMLInputElement
                    counterRef.update((ref) => {
                        counter = Number.parseInt(target.value) || counter
                        ref.innerText = `${counter}`
                    })
                }}
            />
        </div>
    )
}
