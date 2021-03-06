import {Basic3, basic3} from "./basics.js";
import {GLTFLoader} from "./GLTFLoader.js";
import {Glove} from "./glove.js";

import {LoadingSequence} from "./loading.js";
import {Sky} from "./Sky.js";

export {LoadingSequence};

const COLORS = [
  0x1F51FF,
  0xFE019A,
  0xCFFF04,
  0xFFFF00,
  0x00FF66,
  0x6E0DD0,
];

function RandomNumber(low, high) {
  let r = Math.random();
  return low + (high - low)*r;
}

function RandomElement(o) {
  let keys = Object.keys(o);
  return keys[Math.floor(Math.random()*keys.length)];
}

function RandomColor() {
  let r = Math.random();
  let i = parseInt(r*(COLORS.length));
  return COLORS[i];
}

function RandomNeonLight() {
  let geo = new THREE.TorusGeometry(1.5, 0.2, 10, 100);
  let mat = new THREE.MeshBasicMaterial({color: RandomColor()});
  let mesh = new THREE.Mesh(geo, mat);
  return mesh
}

export class App extends Basic3 {
  constructor({el}) {
    super(...arguments);

    this.el = el;
    [this.ctx, this.renderer] = basic3(el)
    this.renderer.setClearColor(0x000000);

    this.scene = new THREE.Scene();

    this.scene.add(new THREE.AmbientLight(0x999999, 1.0));

    let dirLight = new THREE.DirectionalLight(0x111111, 0.8);
    dirLight.position.set(0, 10, 0);
    dirLight.target.position.set(1, 0, 5);
    this.scene.add(dirLight);
    this.scene.add(dirLight.target);
    this.scene.fog = new THREE.Fog(0x000000, 1, 80);

    let pointLight = new THREE.PointLight(0xFFFFFF, 1.2);
    pointLight.position.set(10, 10, 0);
    this.scene.add(pointLight);

    let sideLight = new THREE.PointLight(0x34bdeb, 0.3);
    pointLight.position.set(5, 0, -5);
    this.scene.add(sideLight);

    this.center = new THREE.Vector3(0, 10, 0);
    this.target = new THREE.Vector3(20, 4, 0);
    this.target = new THREE.Vector3(30, 10, 0);

    this.meshes = {};
    this.neons = [];

    // this.generateNeon();

    // XXX: Re-ablet to display logo
    this.generateLogo();

    this.glove = new Glove(this.center);

    this.scene.add(this.glove.mesh);

    console.log("(>o_o)> damn...");
    this.generateSky();

    this.generateGround();

    this.dx = 0.01;
    this.dy = 0.00;
    this.floating = true;
  }

  generateSky() {

    let sun = new THREE.Vector3();

    const effectController = {
      turbidity: 13.8,
      rayleigh: 3.416,
      mieCoefficient: 0.019,
      mieDirectionalG: 0.7,
      elevation: 0,
      azimuth: 135,
      exposure: this.renderer.toneMappingExposure
    };

    let sky = new Sky();
    const s = 150;
    sky.scale.set(s, s, s);
    sky.position.set(this.target.x, this.target.y, this.target.z);

    console.log(this.sky);
    const uniforms = sky.material.uniforms;
    uniforms[ 'turbidity' ].value = effectController.turbidity;
    uniforms[ 'rayleigh' ].value = effectController.rayleigh;
    uniforms[ 'mieCoefficient' ].value = effectController.mieCoefficient;
    uniforms[ 'mieDirectionalG' ].value = effectController.mieDirectionalG;

    const phi = THREE.MathUtils.degToRad( 90 - effectController.elevation );
    const theta = THREE.MathUtils.degToRad( effectController.azimuth );

    sun.setFromSphericalCoords( 1, phi, theta );

    uniforms[ 'sunPosition' ].value.copy( sun );

    this.renderer.toneMappingExposure = effectController.exposure;

    this.scene.add(sky);
  }

  generateNeon() {

    this.neons = [];

    for (let i=0; i < 80; i++) {

      let x = 3*i-20;
      let y = 12;
      let z = +10;

      let lhs_key = RandomElement(this.meshes);
      let lhs = this.meshes[lhs_key].clone();
      lhs.position.set(x, RandomNumber(7, 12), z);

      let rhs_key = RandomElement(this.meshes);
      let rhs = this.meshes[rhs_key].clone();
      rhs.position.set(x, RandomNumber(9, 12), -z);

      this.scene.add(lhs);
      this.scene.add(rhs);
      this.neons.push(lhs, rhs);
    }
  }

  Plane(orientation) {
    let g = new THREE.PlaneGeometry(1000.0, 1000.0, 10.0, 10.0);
    let m = new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.DoubleSide});
    let mesh = new THREE.Mesh(g, m);
    mesh.rotation.x = Math.PI/2;
    mesh.position.y = -10;
    return mesh;
  }

  generateGround() {
    this.scene.add(this.Plane());
  }

  generateLogo() {

    let logoRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
      format: THREE.RGBFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
    });

    let logoCubeCamera = new THREE.CubeCamera(0.5, 1000, logoRenderTarget);
    this.logoCubeCamera  = logoCubeCamera;

    let scene = this.scene;
    let loader = new THREE.FontLoader();

    const material3 = new THREE.MeshPhongMaterial({
      shininess: 60,
      color: 0xFFFFFF,
      emissive: 0xFFFFFF,
      specular: 0xFF4470,
      reflectivity: 0.88,
      envMap: logoRenderTarget.texture,
      // combine: THREE.AddOperation,
    });

    const gltfLoader = new GLTFLoader();

    // Get the entire scene
    gltfLoader.load("static/fruit.gltf", (gltf) => {
      gltf.scene.scale.set(10, 10, 10);
      gltf.scene.children.forEach((v) => {
        console.log("Loaded:", v.name);
        v.children.forEach((u) => {
          u.material = new THREE.MeshBasicMaterial({ color: RandomColor() });
        });
        v.position.set(0, 0, 0);
        v.scale.set(2, 10, 10);

        this.meshes[v.name] = v.clone();
      });

      console.log(this.meshes.cherry);

      this.generateNeon();
    });

    gltfLoader.load("static/trax.gltf", (gltf) => {
      gltf.scene.position.set(this.target.x-20.0, this.target.y, this.target.z);
      gltf.scene.rotation.y = -Math.PI / 2;
      const s = 1.0;
      gltf.scene.scale.set(s, s, s);

      gltf.scene.children[0].children.forEach((v) => {
        v.geometry.computeVertexNormals();
        v.geometry.computeFaceNormals();

        v.material = material3;
        v.material.shading = THREE.SmoothShading;
      });


      this.thing = gltf.scene;
      scene.add(gltf.scene);
    });
  }

  move({ x, y }) {
    // this.target.y = 0.0 + y * 6;
    // this.target.z = 0.0 + x * 6;
  }

  resize(w, h) {
    this.renderer.setSize(w, h);

    this.camera = new THREE.PerspectiveCamera(
      75,
      w / h,
      0.1,
      3000,
    );
    console.log("(>x_x)> resized", w, h);
  }

  resizeFunction(container) {
    return function () {
      const el = document.getElementById("nav");

      let h = Math.floor(el.offsetHeight) - 1;

      if (h < 0) {
        h = window.innerHeight / 2;
      }

      if (window.innerWidth / window.innerHeight > 2.0) {
        h = window.innerHeight;
      }

      this.resize(Math.floor(el.offsetWidth - 1), h);
      // this.resize(window.innerWidth, window.innerHeight/2.0);
    }.bind(this);
  }

  pointerDown(ev) {
    this.dx = this.dy = 0.0;
    this.dragging = true;
    this.floating = false;
    this.mousePos = [ev.clientX, ev.clientY];
    ev.srcElement.style.cursor = "grabbing";
  }

  pointerUp(ev) {
    ev.srcElement.style.cursor = "grab";
    this.dragging = false;
  }

  pointerMove(ev) {

    if (this.dragging) {
      let x = ev.clientX;
      let y = ev.clientY;

      this.dx = (x - this.mousePos[0]) / 888.;
      this.dy = (y - this.mousePos[1]) / 888.;
    }
  }

  update() {
    let t = +new Date() / 1000 / 5;
    this.camera.position.x = this.center.x;
    this.camera.position.y = this.center.y;
    this.camera.position.z = this.center.z;
    this.camera.lookAt(this.target);

    this.neons.forEach((mesh)=> {
      mesh.position.x -= 0.1;
    });

    if (this.thing) {
      this.thing.rotation.x += this.dy;
      this.thing.rotation.y += this.dx;

      if (!this.floating) {
        this.dy *= 0.95;
        this.dx *= 0.95;
      }
    }

    if (this.glove) {
      this.glove.update();
    }

    if (this.logo) {
      this.logo.rotation.x = -1 * t;
      this.logo.rotation.y = +3 * t;
      this.logo.rotation.z = -2 * t;

      let u = 3 * t;
      this.ring.rotation.x = -1 * u;
      this.ring.rotation.y = +3 * u;
      this.ring.rotation.z = -2 * u;
    }
  }

  draw() {
    if (this.thing && this.logoCubeCamera) {
      this.logoCubeCamera.update(this.renderer, this.scene);
    }
    this.renderer.render(this.scene, this.camera);
  }
}
