type Ref<T> = {
    update: (cb: (ref: T) => void) => void
}

export const useRef = <T extends HTMLElement>(id: string): Ref<T> => {
    let ref: T | undefined = undefined
    
    const res: Ref<T> = {
        update: (cb) => {
            if (ref === undefined) {
                const element = document.getElementById(id)
                if (element) {
                    ref = element as T
                }
            }

            if (ref === undefined) {
                throw new Error("now something is really wrong")
            }

            cb(ref)
        }
    }

    return res
}