let lastId = 0

type Ref<T> = {
    id: string
    update: (cb: (ref: T) => void) => void
}

/**
 * Allows you to bind a HTMLElement to a variable.
 * Just assign the id to the element you want to bind.
 *
 * To use it, just call update(cb) on the reference and
 * you can use it inside the callback.
 * The callback will only be called when the id could be found.
 *
 * @returns the reference object.
 */
export const useRef = <T extends HTMLElement>(): Ref<T> => {
    let ref: T | undefined = undefined

    const res: Ref<T> = {
        id: `ref-${lastId++}`,
        update: (cb) => {
            if (ref === undefined) {
                const element = document.getElementById(res.id)
                if (element) {
                    ref = element as T
                }
            }

            if (ref === undefined) {
                return
            }

            cb(ref)
        },
    }

    return res
}
