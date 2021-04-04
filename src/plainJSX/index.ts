import * as PlainJSX from './plainJSX'

export namespace JSX {
    export type Element = PlainJSX.PlainJSXElement
    export type IntrinsicElements = PlainJSX.IntrinsicElements
}

export { Fragment, createElement, HTMLElements, PlainJSXElement} from './plainJSX' 