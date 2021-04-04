export type HTMLAttributes<T> = Partial<T>

export type HTMLElements<T> = {
    readonly [P in keyof T]: HTMLAttributes<T[P]>
};

export type IntrinsicElements = HTMLElements<HTMLElementTagNameMap>

export class PlainJSXElement {
    children: (Element | string)[] = []

    get outerHTMdL(): string {
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
   
    constructor(name: string, props?: Omit<Record<string, unknown>, "children">, ...children: (PlainJSXElement | PlainJSXElement[] | string)[]) {
        let elem: Element
    
        if (name.length !== 0) {
            elem = document.createElement(name)
            if (props) {
                Object.keys(props || {}).forEach((k) => {
                    (elem as any)[k] = props[k]
                })
            }

            const addChild = (child: PlainJSXElement | PlainJSXElement[] | string) => {
                if (Array.isArray(child)) {
                    child.forEach(addChild)
                } else if (child instanceof PlainJSXElement) {
                    elem.append(...child.children)
                } else if (typeof child == "string") {
                    elem.append(child)
                }
            }
            (children || []).forEach(addChild)

            this.children.push(elem)
        } else {
            // just an fragment -> just save the children but this time direct into the root child list
            const addChild = (child: PlainJSXElement | PlainJSXElement[] | string) => {
                if (Array.isArray(child)) {
                    child.forEach(addChild)
                } else if (child instanceof PlainJSXElement) {
                    this.children.push(...child.children)
                } else if (typeof child == "string") {
                    this.children.push(child)
                }
            }
            (children || []).forEach(addChild)
        }
    }
}

export const createElement: (name: string, props?: Omit<Record<string, unknown>, "children">, ...children: (PlainJSXElement | PlainJSXElement[] | string)[]) => PlainJSXElement = (name, props, ...children): PlainJSXElement => {
    return new PlainJSXElement(name, props, ...children)
}

export const Fragment = (...children: (PlainJSXElement | PlainJSXElement[] | string)[]):  PlainJSXElement => createElement("", undefined, ...children)