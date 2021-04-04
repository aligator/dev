type ElementNode = (Element | string)
type ElementNodes = ElementNode | ElementNode[]

export type HTMLAttributes<T> = Partial<T>

export type HTMLElements<T> = {
    readonly [P in keyof T]: HTMLAttributes<T[P]>
};

export type IntrinsicElements = HTMLElements<HTMLElementTagNameMap>

export class PlainJSXElement {
    private readonly document: DocumentFragment
    get outerHTML(): string {
        let result = ""

        for (let i=0; i<=this.document.childNodes.length; i++) {
            if (!this.document.childNodes.item(i)) {
                continue
            }

            if ((this.document.childNodes.item(i) as unknown as {outerHTML: string}).outerHTML !== undefined) {
                result += (this.document.childNodes.item(i) as unknown as {outerHTML: string}).outerHTML
            } else {
                result += this.document.childNodes.item(i).textContent
            }
        }
        return result
    }
   
    constructor(name: string, props?: Omit<Record<string, unknown>, "children">, ...children: (PlainJSXElement | PlainJSXElement[] | string)[]) {
        this.document = document.createDocumentFragment()
        let elem: Element | DocumentFragment
    
        if (name.length === 0) {
            // If just an empty fragment, add the children directly to the document.
            elem = document.createDocumentFragment()
        } else {
            elem = document.createElement(name)
            if (props) {
                Object.keys(props || {}).forEach((k) => {
                    (elem as any)[k] = props[k]
                })
            }
        }

        const addChild = (child: PlainJSXElement | PlainJSXElement[] | string) => {
            if (Array.isArray(child)) {
                child.forEach(addChild)
            } else if (child instanceof PlainJSXElement) {
                elem.appendChild(child.document)
            } else if (typeof child == "string") {
                elem.append(child)
            }
        }
    
        (children || []).forEach(addChild)
    
        this.document.appendChild(elem)
    }
}

export const createElement: (name: string, props?: Omit<Record<string, unknown>, "children">, ...children: (PlainJSXElement | PlainJSXElement[] | string)[]) => PlainJSXElement = (name, props, ...children): PlainJSXElement => {
    return new PlainJSXElement(name, props, ...children)
}

export const Fragment = (...children: (PlainJSXElement | PlainJSXElement[] | string)[]):  PlainJSXElement => createElement("", undefined, ...children)