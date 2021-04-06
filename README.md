# aligator.dev

This is the source of my website [aligator.dev](https://aligator.dev).  
It is built using just typescript, html and css. No React, no Vue, no jquery, no etc.
In this project I try to use no js dependency other than some build dependencies, to 
explore how good/bad it is possible to create a website with plain ts without thousands of other dependencies 
which are automatically pulled in as soon as React or similar is used.

As typescript itself already provides JSX transpilation, I use just that to build plain dom elements.
So instead of something like this:
```ts
const div = document.createElement('div')
div.innerHTML = `
  <a href="foo.html">Hello World!</a>
  <hr/>
`
const consoleContainer = document.getElementById('console-container')
consoleContainer.innerHTML = div
```
I can use:
```ts
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

I also experiment a bit with Golang to webassembly. That's why it is possible to run
[GoSlice](https://github.com/aligator/goslice) in your browser. Just call `goslice gopher.stl`

## commands
As the website consists of just a virtual terminal, you can just type `help`.
