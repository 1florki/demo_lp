import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/build/three.module.js';

import {
  GLTFHelper
} from 'https://1florki.github.io/threejsutils/gltf.js';

import {
  Gradient
} from 'https://1florki.github.io/threejsutils/gradient.js'

import {
  Noise
} from 'https://1florki.github.io/jsutils2/noise.js'


import {
  LPSphere,
  Helper
} from './lp.js'

const defaultNoiseSettings = {
  octaves: 6,
  persistence: 0.5,
  power: 2,
  min: 0.8,
  max: 1.0
};
const defaultOceanNoiseSettings = {
  octaves: 3,
  scale: 3,
  min: 0.98,
  max: 1.02,
  persistence: 0.5
};

const pitchAxis = new THREE.Vector3(0, 1, 0);
const yawAxis = new THREE.Vector3(1, 0, 0);

export class Planet {
  constructor(opts) {
    opts = opts || {};

    this.subs = opts.subs || 6;

    this.radius = opts.radius || 1;
    this.noise = new Noise(opts.noise || defaultNoiseSettings);

    this.createPlanet(opts);
  }

  createPlanetTerrain(opts) {
    opts = opts || {};

    let cs1 = Gradient.colorStop(0.0, 0x000000),
      cs2 = Gradient.colorStop(0.3, 0xaa9900),
      cs3 = Gradient.colorStop(0.5, 0x117711),
      cs4 = Gradient.colorStop(0.7, 0x669966);

    this.gradient = Gradient.stops([cs1, cs2, cs3, cs4]);
    this.sphere = new LPSphere({
      radius: this.radius,
      subs: this.subs
    });
    this.sphere.apply(this.noise, this.gradient);

    this.mesh = this.sphere.mesh();
    this.mesh.material.metalness = 0;
    this.mesh.material.roughness = 0.9;

    return this.mesh;
  }

  createOcean(opts) {
    opts = opts || {};

    let waterSphere = new LPSphere({
      subs: this.subs - 1
    });

    let gradient = Gradient.between([Gradient.color(0x000022), Gradient.color(0x4477ff)]);
    let noise = new Noise({
      min: 0.85,
      max: 0.87,
      scale: 5,
      oct: 2,
      per: 0.5,
      pow: 2
    });
    waterSphere.apply(noise, gradient);


    let waterSphere2 = new LPSphere({
      subs: this.subs - 1
    });
    noise = new Noise({
      min: 0.85,
      max: 0.87,
      scale: 5,
      oct: 2,
      per: 0.5,
      pow: 2
    });
    waterSphere2.apply(noise);

    let morphGeo = waterSphere2.geo();
    let waterGeo = waterSphere.geo();
    Helper.addMorphToGeo(waterGeo, morphGeo);

    let water = new THREE.Mesh(waterGeo, new THREE.MeshStandardMaterial({
      morphTargets: true,
      morphNormals: true,
      transparent: true,
      opacity: 0.8,
      vertexColors: true
    }))

    this.mesh.add(water);
    this.water = water;
    return water;
  }

  createVegetation() {

    this.gltf = new GLTFHelper({
      tree1: "models/tree1.glb",
      tree2: "models/tree2.glb",
      plant1: "models/plant1.glb",
      plant2: "models/plant2.glb",
      plant3: "models/plant3.glb",
      palm1: "models/palm1.glb",
      palm2: "models/palm2.glb",
      palm3: "models/palm3.glb",
      palm4: "models/palm4.glb",
      pine1: "models/pine1.glb",
      willow1: "models/willow1.glb",
      grass1: "models/grass1.glb",
      grass2: "models/grass2.glb",
      grass3: "models/grass3.glb",
    }, () => {
      console.log(this.gltf.models);
      let r = 0.8;
      let treeScl = 0.02;
      let num = 60;
      this.addTree(this.gltf.models.tree1, num, treeScl, r);
      this.addTree(this.gltf.models.tree2, num, treeScl, r);
      
      this.addTree(this.gltf.models.palm1, num, treeScl, r);
      this.addTree(this.gltf.models.palm2, num, treeScl, r);
      this.addTree(this.gltf.models.palm3, num, treeScl, r);
      this.addTree(this.gltf.models.palm4, num, treeScl, r);
      
      this.addTree(this.gltf.models.plant1, num, treeScl, r);
      this.addTree(this.gltf.models.plant2, num, treeScl, r);
      this.addTree(this.gltf.models.plant3, num, treeScl, r);
      
      this.addTree(this.gltf.models.willow1, num, treeScl, r);
      
      this.addTree(this.gltf.models.grass1, num * 2, treeScl, r);
      this.addTree(this.gltf.models.grass2, num * 2, treeScl, r);
      this.addTree(this.gltf.models.grass3, num * 2, treeScl, r);
    })
  }

  makeClouds(num, scl) {
    this.clouds = [];
    for(let i = 0; i < num; i++) {
      
      let pos = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
      let c = this.createCloud(scl)
      this.addItemToPlanet(c, pos, 0.15, Math.random() * 7);
      this.clouds.push(c);
    }
  }
  
  moveClouds(speed) {
    speed = speed || (0.0001 + Math.random() * 0.0001) * 4;
    let forward = new THREE.Vector3(0, 0, speed);
    for(let i = 0; i < this.clouds.length; i++) {
      let c = this.clouds[i];
      this.moveItemLocal(c, forward);
    }
  }
  
  createCloud(scl) {
    scl = scl || 0.05 + Math.random() * 0.1;
    let sphere = new LPSphere({radius: 1, subs: 1});
    let noise = new Noise({min: 0.5});
    let gradient = Gradient.between([Gradient.color(0x444444), Gradient.color(0xffffff)]);
    sphere.apply(noise, gradient);
    
    sphere.scale([scl, 0.3 * scl, scl]);
    let mesh = sphere.mesh();
    mesh.material.transparent = true;
    mesh.material.opacity = 0.7;
    return mesh;
  }
  
  addTree(tree, num, scl, r) {
    r = r || 1
    tree.traverse(a => {
      if (a.material) {
          a.material.metalness = 0;
          a.material.roughness = r;
        }
    })
    for (let i = 0; i < num; i++) {
      let pos = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
      pos.normalize();
      let h = this.noise.get(pos.x, pos.y, pos.z);
      while (h < 0.87) {
        pos = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
        pos.normalize();
        h = this.noise.get(pos.x, pos.y, pos.z);
      }
      let s = tree.clone();
      s.scale.set(scl, scl, scl);
      this.addItemToPlanet(s, pos, -0.002, Math.random() * 10);

    }
  }

  createPlanet(opts) {
    opts = opts || {};
    this.createPlanetTerrain(opts);
    this.createOcean(opts);
    this.createVegetation();
    return this.mesh;
  }

  addItemToPlanet(item, pos, aboveGround, yaw, pitch) {
    if (this.mesh == undefined || item == undefined) return;

    this.mesh.add(item);
    item.position.set(0, 1, 0);

    item.yaw = yaw || 0;
    item.pitch = pitch || 0;
    item.aboveGround = aboveGround;

    this.updatePositionItem(item, new THREE.Vector3(0, 1, 0));
    if (pos) this.updatePositionItem(item, pos);
    return item;
  }

  updatePositionItem(item, newPos) {
    if (item == undefined) return;
    if (item.rotBuffer == undefined) {
      item.rotBuffer = new THREE.Quaternion();
    }

    item.oldPosition = item.position.clone();
    item.position.copy(newPos);
    if (item.aboveGround != undefined) {
      newPos.normalize();
      let h = this.noise.get(newPos.x, newPos.y, newPos.z) + item.aboveGround;;
      item.position.setLength(h);
    }

    let currentRotation = new THREE.Quaternion();
    currentRotation.setFromUnitVectors(
      item.oldPosition.clone().normalize(),
      item.position.clone().normalize()
    );
    item.rotBuffer.premultiply(currentRotation);

    item.quaternion.copy(item.rotBuffer);

    var localRotation = new THREE.Quaternion();

    localRotation.setFromAxisAngle(pitchAxis, item.yaw || 0);
    item.quaternion.multiply(localRotation);
    localRotation.setFromAxisAngle(yawAxis, item.pitch || 0);
    item.quaternion.multiply(localRotation);
  }

  // moves an object on the planet depending on rotation of item ([0,0,1] moves object forward locally)
  moveItemLocal(item, movement) {
    movement.applyQuaternion(item.quaternion);
    let newPos = item.position.clone();
    newPos.add(movement);
    this.updatePositionItem(item, newPos);
  }
}
