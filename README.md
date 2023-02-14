# aligator.dev

This is the source of my website [aligator.dev](https://aligator.dev).  
It is built using just typescript, html and scss (+ some dev-deps). No React, no Vue, no jquery, no etc.

As typescript itself already provides JSX transpilation, I use just that to build plain dom elements.
So instead of something like this:
```ts
const div = document.createElement('div')
div.innerHTML = `
  <a href="foo.html">Hello World!</a>
  <hr/>
`
const consoleContainer = document.getElementById('console-container')
consoleContainer.append(div)
```
I can use:
```tsx
const div = (
    <div>
        <a href="foo.html">Hello World!</a>
        <hr/>
    </div>
)

const consoleContainer = document.getElementById('console-container')
consoleContainer.append(...div.children)
```
And this with only typescript as (dev)-dependency which I use anyway.

The needed "glue" code (which is really not much) for that resides in `src/plainJSX` and typescript needs to now about it by using this config:
```json
{
    "compilerOptions": {
       ...
        "jsx": "react",
        "jsxFactory": "PlainJSX.createElement",
        "jsxFragmentFactory": "PlainJSX.Fragment",
       
    },
    ...
}
```

## Commands
As the website consists of just a virtual terminal, you can just type `help`.

## GoSlice
I also experiment a bit with Golang to webassembly. That's why it is possible to run
[GoSlice](https://github.com/aligator/goslice) in your browser. Just call `goslice gopher.stl`
Note that the repo includes a pre-built webassembly version. If you compile it with `yarn build:go` you have to make sure that the file `public/js/wasm_exec.js` matches your used Go version. You can get it from [here (use a matching branch)](https://github.com/golang/go/blob/master/misc/wasm/wasm_exec.js)

# Related
My other projects which are used on this page:  
* [GoSlice](https://github.com/aligator/GoSlice) An experimental stl-file slicer written in Go
* [gcode-viewer](https://github.com/aligator/gcode-viewer) A simple GCode viewer made for GoSlice (but may read other GCode also)
