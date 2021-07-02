import {Basic3, basic3} from "../basics.js";
import {GLTFLoader} from "./GLTFLoader.js";
import {Glove} from "./glove.js";

import {LoadingSequence} from "./loading.js";

export {LoadingSequence};

const COLORS = [
  0x1F51FF,
  0xFE019A,
  0xCFFF04,
];

function RandomNumber(low, high) {
  let r = Math.random();
  return low + (high - low)*r;
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

    this.resize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();

    this.scene.add(new THREE.AmbientLight(0x999999, 1.0));

    let dirLight = new THREE.DirectionalLight(0x111111, 0.8);
    dirLight.position.set(0, 10, 0);
    dirLight.target.position.set(1, 0, 5);
    this.scene.add(dirLight);
    this.scene.add(dirLight.target);
    this.scene.fog = new THREE.Fog(0x003366, 10, 60);

    let pointLight = new THREE.PointLight(0xFFFFFF, 0.8);
    pointLight.position.set(10, 10, 0);
    this.scene.add(pointLight);

    this.center = new THREE.Vector3(0, 10, 0);
    this.target = new THREE.Vector3(20, 4, 0);
    this.target = new THREE.Vector3(30, 10, 0);

    this.generateNeon();

    // XXX: Re-ablet to display logo
    this.generateLogo();

    // XXX: Re-ablet to display floor
    // this.generateAlley();

    // XXX: Re-enable to display baked lights
    // this.generateSomething();

    this.glove = new Glove(this.center);

    this.scene.add(this.glove.mesh);

    console.log("(>o_o)> damn...");
  }

  generateSomething() {
    const loader = new GLTFLoader();
    let scene = this.scene;
    loader.load("./half-baked.gltf", (gltf) => {
      gltf.scene.position.set(30, 5, 0);
      scene.add(gltf.scene);
      console.log("Loaded");
    });
  }

  generateNeon() {

    this.neons = [];

    for (let i=0; i < 80; i++) {

      let x = 1*i-20;
      let y = 12;
      let z = +10;

      let lhs = RandomNeonLight();
      lhs.rotation.x = Math.PI/2;
      lhs.rotation.y = Math.PI/2;
      lhs.rotation.z = 0;

      lhs.position.set(x, RandomNumber(7, 12), z);

      let rhs = RandomNeonLight();
      rhs.rotation.x = Math.PI/2;
      rhs.rotation.y = Math.PI/2;
      rhs.rotation.z = 0;
      rhs.position.set(x, RandomNumber(9, 15), -z);

      this.scene.add(lhs);
      this.scene.add(rhs);

    }
  }

  Plane(orientation) {
    let g = new THREE.PlaneGeometry(400.0, 20.0, 10.0, 10.0);
    let m = new THREE.MeshBasicMaterial({color: 0x333333, side: THREE.DoubleSide});
    let mesh = new THREE.Mesh(g, m);
    mesh.rotation.x = Math.PI/2;
    return mesh;
  }

  generateAlley() {
    this.alley = this.Plane({x: Math.PI/2});
    this.alley.position.set(this.target.x, this.target.y-10.0, this.target.z);
    this.scene.add(this.alley);

    console.log("Alley generated.");
  }

  generateGround() {
  }

  generateLogo() {

    let logoRenderTarget = new THREE.WebGLCubeRenderTarget(1024, {
      format: THREE.RGBFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
      //encoding: THREE.sRGBEncoding,
    });

    let logoCubeCamera = new THREE.CubeCamera(0.5, 1000, logoRenderTarget);
    this.logoCubeCamera  = logoCubeCamera;

    let scene = this.scene;
    let loader = new THREE.FontLoader();
    let objLoader = new THREE.OBJLoader();

    let mat = new THREE.MeshLambertMaterial({
      color: 0xFFFF00,
      envMap: logoRenderTarget.texture,
      // combine: THREE.MultiplyOperation,
      // reflectivity: 1.0,
    });

    const material3 = new THREE.MeshPhongMaterial({
      shininess: 10,
      color: 0xFFFFFF,
      specular: 0xFF4470,
      reflectivity: 0.86,
      envMap: logoRenderTarget.texture,
    });

    // let normalMat = new THREE.MeshNormalMaterial();

    // let basic = new THREE.MeshBasicMaterial({color: 0xFF0000});

    const gltfLoader = new GLTFLoader();

    gltfLoader.load("static/trax.gltf", function (gltf) {
      gltf.scene.position.set(this.target.x, this.target.y, this.target.z);
      gltf.scene.rotation.y = -Math.PI/2;

      gltf.scene.children[0].children.forEach((v) => {
        v.geometry.computeVertexNormals();
        v.geometry.computeFaceNormals();
        v.material = material3;
      });


      this.thing = gltf.scene;
      scene.add(gltf.scene);
    }.bind(this));
  }

  generateCity() {

    let tex = generateTexture(this.renderer);

    let floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(10.0, 10.0),
      new THREE.MeshBasicMaterial({color: RandomColor()}),
    );

    this.scene.add(floorMesh);

    for (let i = 0; i <= 20; i++) {
      for (let j = -10; j <= 10; j++) {
        let x = 2 * i;
        let z = 2 * j;
        let mesh = this.generateBuilding(tex);
        mesh.position.set(x, 0, z);
        this.scene.add(mesh);
      }
    }
  }

  generateBuilding(tex) {

    let w = 1;
    let h = 5.0 + Math.random() * 7;
    let geo = new THREE.BoxGeometry(w, h, w);

    let mat = new THREE.MeshLambertMaterial({
      "map": tex,
    });

    return new THREE.Mesh(geo, mat);
  }

  move({ x, y }) {
    this.target.y = 0.0 + y * 6;
    this.target.z = 0.0 + x * 6;
  }
  
  resize(w, h) {
    this.renderer.setSize(w, h);

    this.camera = new THREE.PerspectiveCamera(
      75,
      w/h,
      0.1,
      3000,
    );
    console.log("(>x_x)> resized", w, h);
  }

  resizeFunction(container) {
    return function() {
      this.resize(window.innerWidth, window.innerHeight);
    }.bind(this);
  }

  update() {
    let t = +new Date() / 1000 / 5;
    this.camera.position.x = this.center.x;
    this.camera.position.y = this.center.y;
    this.camera.position.z = this.center.z;
    this.camera.lookAt(this.target);

    if (this.thing) {
      this.thing.rotation.y = 5*t;
    }

    if (this.glove) {
      this.glove.update();
    }

    if (this.logo) {
      this.logo.rotation.x = -1*t;
      this.logo.rotation.y = +3*t;
      this.logo.rotation.z = -2*t;

      let u = 3*t;
      this.ring.rotation.x = -1*u;
      this.ring.rotation.y = +3*u;
      this.ring.rotation.z = -2*u;
    }
  }

  draw() {
    if (this.thing && this.logoCubeCamera) {
      this.logoCubeCamera.update(this.renderer, this.scene);
    }
    this.renderer.render(this.scene, this.camera);
  }
}


function generateTexture(renderer) {
  // build a small canvas 32x64 and paint it in white
  var canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 64;
  var context = canvas.getContext('2d');
  // plain it in white
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, 32, 64);
  // draw the window rows - with a small noise to simulate light variations in each room
  for (var y = 2; y < 64; y += 2) {
    for (var x = 0; x < 32; x += 2) {
      var value = Math.floor(Math.random() * 64);
      context.fillStyle = 'rgb(' + [value, value, value].join(',') + ')';
      context.fillRect(x, y, 2, 1);
    }
  }

  // build a bigger canvas and copy the small one in it
  // This is a trick to upscale the texture without filtering
  var canvas2 = document.createElement('canvas');
  canvas2.width = 512;
  canvas2.height = 1024;
  var context = canvas2.getContext('2d');
  // disable smoothing
  context.imageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;
  context.imageSmoothingEnabled = false;
  // then draw the image
  context.drawImage(canvas, 0, 0, canvas2.width, canvas2.height);
  // return the just built canvas2


  var texture = new THREE.Texture(canvas2);
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.needsUpdate = true;

  return texture;
}
