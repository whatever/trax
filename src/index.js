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
    this.scene.fog = new THREE.Fog(0x003366, 10, 60);

    this.generateLogo();

    let pointLight = new THREE.PointLight(0xFFFFFF, 0.3);
    pointLight.position.set(0, 10, 0);
    this.scene.add(pointLight);

    this.center = new THREE.Vector3(0, 10, 0);
    this.target = new THREE.Vector3(10, 4, 0);
  }

  generateLogo() {

    let logoRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
      format: THREE.RGBFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
      encoding: THREE.sRGBEncoding,
    });

    let logoCubeCamera = new THREE.CubeCamera(1, 10000, logoRenderTarget);
    this.logoCubeCamera  = logoCubeCamera;

    let scene = this.scene;
    let loader = new THREE.FontLoader();
    loader.load("helvetiker.json", function (font) {
      let geo = new THREE.TextGeometry("TRAX", {
        font: font,
        size: 1,
        height: 1,
      });
      let mat = new THREE.MeshBasicMaterial({
        envMap: logoRenderTarget.texture,
        combine: THREE.MultiplyOperation,
        reflectivity: 0.9,
      });
      let mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(10, 5, -2);
      logoCubeCamera.position.set(10, 5, -2);
      mesh.lookAt(-0.2, 10, 0.3);
      this.logo = mesh;

      scene.add(mesh);
    }.bind(this));
  }

  generateCity() {

    let tex = generateTexture(this.renderer);

    let floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(10.0, 10.0),
      new THREE.MeshBasicMaterial({color: 0xFFFFFF}),
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

    /*
    geo.faceVertexUvs[0][2][0].set( 0, 0 );
    geo.faceVertexUvs[0][2][1].set(0, 0);
    geo.faceVertexUvs[0][2][2].set(0, 0);
    geo.faceVertexUvs[0][2][3].set(0, 0);
    */

    let mat = new THREE.MeshLambertMaterial({
      "map": tex,
    });

    return new THREE.Mesh(geo, mat);
  }

  move({ x, y }) {
    this.target.y = 0.0 + y * 6;
    this.target.z = 0.0 + x * 6;
  }

  update() {
    this.camera.position.x = this.center.x;
    this.camera.position.y = this.center.y;
    this.camera.position.z = this.center.z;
    this.camera.lookAt(this.target);

    if (this.logo) {
      // let t = +new Date() / 1000.0;
      // this.logo.rotation.x = t;
    }
  }

  draw() {
    this.renderer.render(this.scene, this.camera);
    this.logoCubeCamera.update(this.renderer, this.scene);
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