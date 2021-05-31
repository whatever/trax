import {Basic3, basic3} from "../basics.js";

export class App extends Basic3 {
  constructor({el}) {
    super(...arguments);

    this.el = el;
    [this.ctx, this.renderer] = basic3(el)
    this.renderer.setClearColor("#FFFFFF");
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      el.width/el.height,
      0.1,
      3000,
    );

    console.log("(>o_o)> damn...");
  }

  update() {
  }

  draw() {
    this.renderer.render(this.scene, this.camera);
  }
}
