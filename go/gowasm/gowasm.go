package gowasm

import (
	"errors"
	"os"
	"syscall/js"
	"time"
)

var (
	ErrNoCallback = errors.New("no callback given")
)

type jsError struct {
	error
}

func (err jsError) ToJS() js.Value {
	errorConstructor := js.Global().Get("Error")
	return errorConstructor.New(err.Error())
}

type WasmRunner interface {
	Run(c Channels)
}

type Channels struct {
	ErrCh    chan error
	ResultCh chan interface{}
	Stdout   chan string
	Stderr   chan string

	stopSignal chan bool
}

func listen(ch chan string) js.Func {
	var listen js.Func
	listen = js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) < 1 || args[0].Type() != js.TypeFunction {
			return jsError{error: ErrNoCallback}.ToJS()
		}

		go func() {
			for {
				select {
				case value, ok := <-ch:
					if !ok {
						break
					}

					go func() {
						args[0].Invoke(value)
					}()
				default:
				}
				time.Sleep(1 * time.Millisecond)
			}
		}()

		return js.Null()
	})

	return listen
}

func (c *Channels) get() js.Func {
	var get js.Func
	get = js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		// release directly as it should anyway only be called once.
		get.Release()
		// Handler for the Promise
		handler := js.FuncOf(func(this js.Value, args []js.Value) interface{} {

			resolve := args[0]
			reject := args[1]

			go func() {
				for {
					select {
					case err := <-c.ErrCh:
						reject.Invoke(jsError{error: err}.ToJS())
						break
					case result := <-c.ResultCh:
						resolve.Invoke(result)
						break
					default:
					}

					time.Sleep(1 * time.Millisecond)
				}

				close(c.ErrCh)
				close(c.ResultCh)
				close(c.Stdout)
				close(c.Stderr)
				close(c.stopSignal)
			}()

			// The handler of a Promise doesn't return any value
			return nil
		})

		// Create and return the Promise object
		promiseConstructor := js.Global().Get("Promise")
		return promiseConstructor.New(handler)
	})
	return get
}

func Run(r WasmRunner) {
	c := Channels{
		ErrCh:      make(chan error),
		ResultCh:   make(chan interface{}),
		Stdout:     make(chan string),
		Stderr:     make(chan string),
		stopSignal: make(chan bool),
	}

	fnName := os.Args[0]

	functions := js.Global().Get("Object").New()
	stdoutListen := listen(c.Stdout)
	stderrListen := listen(c.Stderr)
	functions.Set("get", c.get())
	functions.Set("stdout", stdoutListen)
	functions.Set("stderr", stderrListen)

	js.Global().Set(fnName, functions)

	go func() {
		r.Run(c)
	}()

	<-c.stopSignal

	time.Sleep(1 * time.Second)

	stderrListen.Release()
	stdoutListen.Release()
	js.Global().Delete(fnName)
}
