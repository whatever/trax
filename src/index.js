import {Basic3, basic3} from "../basics.js";

export class App extends Basic3 {
  constructor({el}) {
    super(...arguments);

    this.el = el;
    [this.ctx, this.renderer] = basic3(el)
    this.renderer.setClearColor(0x000000);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      el.width/el.height,
      0.1,
      3000,
    );

    console.log("(>o_o)> damn...");

    this.generateCity();

    this.scene.add(new THREE.AmbientLight(0xDDDDDD, 0.1));

    let dirLight = new THREE.DirectionalLight(0xB72AC7, 0.2);
    dirLight.position.set(0, 10, 0);
    dirLight.target.position.set(1, 0, 5);
    this.scene.add(dirLight);
    this.scene.add(dirLight.target);
    this.scene.fog = new THREE.Fog(0x000000, 10, 60);

    this.generateLogo();

    let pointLight = new THREE.PointLight(0xFFFFFF, 0.3);
    pointLight.position.set(0, 10, 0);
    this.scene.add(pointLight);

    this.center = new THREE.Vector3(0, 10, 0);
    this.target = new THREE.Vector3(10, 4, 0);
  }

  generateLogo() {
    let scene = this.scene;
    let loader = new THREE.FontLoader();
    loader.load("helvetiker.json", function (font) {
      let geo = new THREE.TextGeometry("TRAX", {
        font: font,
        size: 1,
        height: 1,
      });
      let mat = new THREE.MeshPhysicalMaterial({
        "color": 0x33303A,
        "emissive": 0x000000,
        "roughness": 0.25,
        "reflectivity": 1.0,
        "clearcoat": 1.0,
      });
      let mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(10, 5, -2);
      mesh.lookAt(-0.2, 10, 0.3);

      scene.add(mesh);
    });
  }

  generateCity() {
    for (let i = 0; i <= 20; i++) {
      for (let j = -10; j <= 10; j++) {
        let w = 1;
        let h = 5.0+Math.random() * 7;
        let x = 2 * i;
        let y = h / 2;
        let z = 2 * j;
        let geo = new THREE.BoxGeometry(w, h, w);
        let mat = new THREE.MeshPhysicalMaterial({
          "emissive": 0x4709AD,
          "roughness": 0.5,
        });
        let mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, 0, z);
        this.scene.add(mesh);
      }
    }
  }

  move({x, y}) {
    this.target.y = 0.0+y*3;
    this.target.z = 0.0+x*3;
  }

  update() {
    this.camera.position.x = this.center.x;
    this.camera.position.y = this.center.y;
    this.camera.position.z = this.center.z;
    this.camera.lookAt(this.target);
  }

  draw() {
    this.renderer.render(this.scene, this.camera);
  }
}