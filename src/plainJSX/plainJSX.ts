export type HTMLAttributes<T> = Partial<T>

export type HTMLElements<T> = {
    readonly [P in keyof T]: HTMLAttributes<T[P]>
}

export type IntrinsicHTMLElements = HTMLElements<HTMLElementTagNameMap>

export type Child = PlainJSXElement | PlainJSXElement[] | string

type Props = Record<string, unknown> | null

export class PlainJSXElement {
    children: (Element | string)[] = []

    get outerHTML(): string {
        let result = ""

        this.children.forEach((c) => {
            if (!c) {
                return
            }

            if (typeof c === "string") {
                result += c
            } else {
                result += c.outerHTML
            }
        })

        return result
    }

    constructor(
        type: string | ((props?: Props, children?: Child[]) => PlainJSXElement),
        props?: Props,
        ...children: Child[]
    ) {
        let elem: Element

        if (typeof type == "function") {
            this.children.push(...type(props || {}, children || []).children)
            return
        }

        if (typeof type === "string" && type.length !== 0) {
            console.log(type)
            elem = document.createElement(type)
            if (props) {
                Object.keys(props || {}).forEach((k) => {
                    // because it can be any
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ;(elem as any)[k] = props[k]
                })
            }

            const addChild = (
                child: Element | PlainJSXElement | PlainJSXElement[] | string
            ) => {
                if (Array.isArray(child)) {
                    child.forEach(addChild)
                } else if (child instanceof Element) {
                    elem.append(child)
                } else if (child instanceof PlainJSXElement) {
                    elem.append(...child.children)
                } else if (typeof child == "string") {
                    elem.append(child)
                }
            }
            ;(children || []).forEach(addChild)

            this.children.push(elem)
        } else {
            // just an fragment -> just save the children but this time direct into the root child list
            const addChild = (
                child: Element | PlainJSXElement | PlainJSXElement[] | string
            ) => {
                if (Array.isArray(child)) {
                    child.forEach(addChild)
                } else if (child instanceof Element) {
                    this.children.push(child)
                } else if (child instanceof PlainJSXElement) {
                    this.children.push(...child.children)
                } else if (typeof child == "string") {
                    this.children.push(child)
                }
            }
            ;(children || []).forEach(addChild)
        }
    }

    delete(): void {
        this.children.forEach((c) => {
            if (c instanceof Element) {
                c.remove()
            }
        })
        this.children = []
    }

    /**
     * returns the first element as the type T.
     * Only use if you are really sure the type fits.
     */
    getFirstAs<T extends Element>(): T {
        if (this.children.length <= 0 || typeof this.children[0] === "string") {
            throw new Error("first child is no element")
        }
        return this.children[0] as unknown as T
    }
}

type CreateElementType = (
    name: string,
    props?: Omit<Props, "children">,
    ...children: Child[]
) => PlainJSXElement

export const createElement: CreateElementType = (
    name,
    props,
    ...children
): PlainJSXElement => {
    return new PlainJSXElement(name, props, ...children)
}

export const Fragment = (...children: Child[]): PlainJSXElement =>
    createElement("", undefined, ...children)

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace JSX {
    export type Element = PlainJSXElement
    export type IntrinsicElements = IntrinsicHTMLElements
}
