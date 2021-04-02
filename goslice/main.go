package main

import (
	"errors"
	"fmt"
	"github.com/aligator/goslice"
	"github.com/aligator/goslice/data"
	"github.com/dev/goslice/goslice/wasm"
	"io"
	"log"
	"syscall/js"
)

// NewGoSlice provides a GoSlice with all built in implementations.
func NewWebGoSlice(options data.Options, onFinished func(gcode string), writer io.Writer) *goslice.GoSlice {
	options.GoSlice.Logger = log.New(writer, "", 0)

	s := goslice.NewGoSlice(options)
	s.Reader = wasm.Reader{}
	s.Writer = wasm.Writer{
		OnWrite: onFinished,
	}
	return s
}

type callbackWriter struct {
	OnWrite func(p []byte) (n int, err error)
}

func (w callbackWriter) Write(p []byte) (n int, err error) {
	return w.OnWrite(p)
}

func Run(gcodeCh chan string) error {
	go func() {
		o := data.ParseFlags()
		fmt.Println(o)
		if o.GoSlice.PrintVersion {
			gcodeCh <- ""
			close(gcodeCh)
			return
		}

		if o.GoSlice.InputFilePath == "" {
			gcodeCh <- errors.New("the STL_FILE path has to be specified\n").Error()
			close(gcodeCh)
			return
		}

		p := NewWebGoSlice(o, func(gcode string) {
			gcodeCh <- gcode
			close(gcodeCh)
		}, callbackWriter{
			OnWrite: func(p []byte) (n int, err error) {
				fmt.Println("INVOKE")
				// outerArgs[1] should be a Buffer (from buffer.ts)
				//outerArgs[1].Call("write", string(p))
				return len(p), err
			},
		})

		err := p.Process()

		if err != nil {
			gcodeCh <- errors.New("the STL_FILE path has to be specified\n").Error()
			close(gcodeCh)
			return
		}
	}()
	return nil
}

var canStop = make(chan bool)
var gcode string
var err error

func PollResult() js.Func {
	return js.FuncOf(func(this js.Value, outerArgs []js.Value) interface{} {
		if err != nil {
			close(canStop)
			return js.ValueOf(err)
		}

		if gcode != "" {
			close(canStop)
			return js.ValueOf(gcode)
		}

		return js.Null()
	})
}

func main() {
	fmt.Println("init")

	// Define the function "MyGoFunc" in the JavaScript scope
	js.Global().Set("pollGoSlice", PollResult())
	// Prevent the function from returning, which is required in a wasm module
	fmt.Println("end init")

	gcodeCh := make(chan string)

	Run(gcodeCh)

	gcode = <-gcodeCh

	<-canStop
}
