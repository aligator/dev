import PlainJSX, { PlainJSXElement } from "../plainJSX";

import "./Slider.scss"

type Props = Partial<HTMLInputElement>

export function Slider({className, ...rest}: Props): PlainJSXElement {
    return <input className={`slider ${className || ""}`} {...rest} type="range" />
}