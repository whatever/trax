export class Glove {

    constructor(end) {
        let geo = new THREE.BoxGeometry(6, 6, 6);
        let mat = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
        this.mesh = new THREE.Mesh(geo, mat);

        this.start = end.clone().add(new THREE.Vector3(100, 0, 0));
        this.end = end.clone();
    }

    update() {
        let t = new Date()/1000./5.0;
        let u = t % 1.0;
        let x = (1-u)*this.start.x + u*this.end.x;
        let y = (1-u)*this.start.y + u*this.end.y;
        let z = (1-u)*this.start.z + u*this.end.z;
        this.mesh.position.set(x, y, z);
        this.mesh.rotation.set(2*t, -1*t, 3*t);
    }

    punch() {
    }
}