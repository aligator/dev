package wasm

import (
	"bytes"
	"github.com/aligator/goslice/data"
	"github.com/hschendel/stl"
	"io/ioutil"
	"net/http"
)

// face is a 3d triangle face defined by three 3d vectors.
type face struct {
	vectors [3]data.MicroVec3
}

func (f face) Points() [3]data.MicroVec3 {
	return f.vectors
}

type model struct {
	faces []data.Face
}

func (m *model) SetName(name string) {
	// not used yet
	return
}

func (m *model) SetBinaryHeader(header []byte) {
	// not used yet
	return
}

func (m *model) SetASCII(isASCII bool) {
	// not used yet
	return
}

func (m *model) SetTriangleCount(n uint32) {
	// not used yet
	return
}

func (m *model) AppendTriangle(t stl.Triangle) {
	m.faces = append(m.faces, stlTriangleToFace(t))
}

func (m model) FaceCount() int {
	return len(m.faces)
}

func (m model) Face(index int) data.Face {
	return m.faces[index]
}

func (m model) Min() data.MicroVec3 {
	ret := m.faces[0].Points()[0].Copy()

	for _, face := range m.faces {
		for _, vertice := range face.Points() {
			if ret.X() > vertice.X() {
				ret.SetX(vertice.X())
			}

			if ret.Y() > vertice.Y() {
				ret.SetY(vertice.Y())
			}

			if ret.Z() > vertice.Z() {
				ret.SetZ(vertice.Z())
			}
		}
	}

	return ret
}

func (m model) Max() data.MicroVec3 {
	ret := m.faces[0].Points()[0].Copy()

	for _, face := range m.faces {
		for _, vertice := range face.Points() {
			if ret.X() < vertice.X() {
				ret.SetX(vertice.X())
			}

			if ret.Y() < vertice.Y() {
				ret.SetY(vertice.Y())
			}

			if ret.Z() < vertice.Z() {
				ret.SetZ(vertice.Z())
			}
		}
	}

	return ret
}

type Reader struct{}

func (r Reader) Read(filename string) (data.Model, error) {
	model := &model{}
	req, err := http.NewRequest("GET", filename, nil)
	req.Header.Add("js.fetch:credentials", "omit")
	if err != nil {
		return nil, err
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}

	defer res.Body.Close()

	// handle the response
	file, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	solid, err := stl.ReadAll(bytes.NewReader(file))
	for _, t := range solid.Triangles {
		model.AppendTriangle(t)
	}

	return model, nil
}

// stlTriangleToFace converts a triangle from the stl package
// into a face.
func stlTriangleToFace(t stl.Triangle) face {
	return face{vectors: [3]data.MicroVec3{
		data.NewMicroVec3(
			data.Millimeter(t.Vertices[0][0]).ToMicrometer(),
			data.Millimeter(t.Vertices[0][1]).ToMicrometer(),
			data.Millimeter(t.Vertices[0][2]).ToMicrometer()),
		data.NewMicroVec3(
			data.Millimeter(t.Vertices[1][0]).ToMicrometer(),
			data.Millimeter(t.Vertices[1][1]).ToMicrometer(),
			data.Millimeter(t.Vertices[1][2]).ToMicrometer()),
		data.NewMicroVec3(
			data.Millimeter(t.Vertices[2][0]).ToMicrometer(),
			data.Millimeter(t.Vertices[2][1]).ToMicrometer(),
			data.Millimeter(t.Vertices[2][2]).ToMicrometer()),
	}}
}
