package main

import (
	"errors"
	"fmt"
	"github.com/aligator/goslice"
	"github.com/aligator/goslice/data"
	"github.com/dev/go/goslice/wasm"
	"github.com/dev/go/gowasm"
	flag "github.com/spf13/pflag"
	"io"
	"log"
	"os"
	"time"
)

// NewWebGoSlice provides a GoSlice with all built in implementations optimized for webassembly.
// For this it contains a custom reader and writer because file access is otherwise not easily possible.
// Also a custom logger is used which writes to the provided writer to avoid writing to stdout.
func newWebGoSlice(options data.Options, onFinished func(gcode string), writer io.Writer) *goslice.GoSlice {
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

type GoSliceRunner struct{}

func (w GoSliceRunner) Run(c gowasm.Channels) {
	stdoutWriter := callbackWriter{
		OnWrite: func(p []byte) (n int, err error) {
			c.Stdout <- string(p)
			time.Sleep(100 * time.Millisecond)
			return len(p), nil
		},
	}

	// A bit of a hack to get help output.
	flag.CommandLine.SetOutput(stdoutWriter)

	printHelp := flag.BoolP("help", "h", false, "print this help")
	o := data.ParseFlags()

	if *printHelp {
		_, _ = fmt.Fprintf(stdoutWriter, "Usage of goslice: goslice STL_FILE [flags]\n")
		flag.Usage()
		os.Exit(0)
	}

	if o.GoSlice.PrintVersion {
		c.Stdout <- "webassembly version"
		c.ResultCh <- nil
		return
	}

	if o.GoSlice.InputFilePath == "" {
		c.ErrCh <- errors.New("the STL_FILE path has to be specified\n")
		return
	}

	p := newWebGoSlice(o, func(gcode string) {
		c.ResultCh <- gcode
		return
	}, stdoutWriter)

	err := p.Process()

	if err != nil {
		c.ErrCh <- errors.New("the STL_FILE path has to be specified\n")
		return
	}
}

func main() {
	gowasm.Run(GoSliceRunner{})
}
