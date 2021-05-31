// Return context, scene, renderer
export function basic3(el) {
  let ctx = el.getContext("webgl", {preserveDrawingBuffer: true});
  let renderer = new THREE.WebGLRenderer({
    canvas: el,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(el.width, el.height);
  renderer.setClearColor("#FFFFFF");
  return [ctx, renderer];
}

// 
export function basic2(el) {
  return el.getContext("2D");
}

export class Basic3 {
  constructor({el}) {
    [this.ctx, this.renderer] = basic3(el);
    this.renderer.setClearColor("#FFFFFF");
    this.el = el;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      el.width/el.height,
      0.1,
      3000,
    );
  }

  setup() {
  }

  update(t) {
    console.error("{{update}} not implemented");
    throw Error("no implementation");
  }

  draw() {
    this.renderer.render(this.scene, this.camera);
  }

  toDataURL() {
    return this.el.toDataURL('image/png');
  }
}

// Modify a mesh to have normalized, shaded faces
function fixup(mesh) {
    mesh.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshBasicMaterial({ color: 0xff6600 });
            child.geometry.computeFaceNormals();
            child.geometry.computeVertexNormals();
            child.material.shading = THREE.SmoothShading;
        }
    });
}
