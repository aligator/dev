import * as PlainJSX from "./plainJSX";
import Terminal from './windows/terminal'
import './window'
import GCodeViewer from "./windows/gcodeViewer";

function run() {
    new Terminal()
    new GCodeViewer()
}

run()