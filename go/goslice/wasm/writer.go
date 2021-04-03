package wasm

type Writer struct {
	OnWrite func(gcode string)
}

func (w Writer) Write(gcode string, destination string) error {
	w.OnWrite(gcode)
	return nil
}
