import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r115/build/three.module.js';

import {
  GLTFHelper
} from 'https://1florki.github.io/threejsutils/gltf.js';
import {
  StereoEffect
} from 'https://1florki.github.io/threejsutils/stereo.js'
import {
  Gradient
} from 'https://1florki.github.io/threejsutils/gradient.js'

import {
  TextGenerator
} from 'https://1florki.github.io/threejsutils/text.js'


import {
  Noise
} from 'https://1florki.github.io/jsutils2/noise.js'


import {
  LPSphere,
  Helper
} from './lp.js'

import {
  Planet
} from './planet.js'

var renderer, scene, camera, clock, stereoEffect, lights = {},
  keys = {};

var text, textNode, planet, water, gltf, cameraNoise;

// settings
var settings = {
  stereo: false,
  fromPlanet: true
}

function setupScene() {
  renderer = new THREE.WebGLRenderer();
  clock = new THREE.Clock();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  let d = renderer.domElement;
  d.style.position = 'absolute';
  d.style.left = '0px';
  d.style.top = '0px';

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight * (settings.stereo ? 2 : 1), 0.01, 150);

  scene.add(camera);

  let background = 0x222299
  scene.background = new THREE.Color(background)

  document.addEventListener("keydown", (event) => keys[event.key] = true, false);
  document.addEventListener("keyup", (event) => keys[event.key] = false, false);
  window.addEventListener('resize', onWindowResize, false);

  lights.ambi = new THREE.AmbientLight(0xffffff, 0.2); // soft white light
  scene.add(lights.ambi);

  lights.dir = new THREE.DirectionalLight(0xffffff, 0.6);
  lights.dir.position.set(-0.8, 0.5, .7);
  scene.add(lights.dir);
  
  let light = new THREE.HemisphereLight(0x224488, 0xcc4433, 0.6);
  camera.add(light);

  if (settings.stereo) {
    stereoEffect = new StereoEffect(renderer);
    stereoEffect.aspect = window.innerWidth / window.innerHeight
    stereoEffect.setEyeSeparation(0.1)
    stereoEffect.setSize(window.innerWidth, window.innerHeight);
  }

  /*
  text = new TextGenerator();
  textNode = new THREE.Object3D();
  textNode.position.z = -1.5;
  textNode.position.y = -0.1;
  scene.add(textNode);*/

  cameraNoise = new Noise({min: -0.003, max: 0.003, scl: 0.1});
  planet = new Planet();

  planet.mesh.position.z = -3;
  scene.add(planet.mesh);
  
  if(settings.fromPlanet) planet.addItemToPlanet(camera, undefined, 0.15, 0, -0.5)
  
  
  planet.makeClouds(100);
  //camera.pitch = -0.5;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight * (settings.stereo ? 2 : 1);
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  if (settings.stereo) stereoEffect.setSize(window.innerWidth, window.innerHeight);
}

function render() {
  if (settings.stereo) stereoEffect.render(scene, camera);
  else renderer.render(scene, camera);
}

function animate(now) {
  requestAnimationFrame(animate);
  let delta = clock.getDelta();
  let total = clock.getElapsedTime();
  // game logic here

  planet.mesh.rotation.y += delta / 5;
  /*
  
  let total = clock.getElapsedTime();
  if (Math.floor(total) != Math.floor(total - delta)) {
    let secondsMesh = text.textMesh("" + Math.floor(total));
    textNode.remove(...textNode.children);
    textNode.add(secondsMesh);
  } 
  textNode.rotation.y = total * Math.PI * 2;
  textNode.rotation.x = total * Math.PI * 2;
  */
  //camera.pitch += 0.01
  planet.moveClouds();
  if(settings.fromPlanet) {
  camera.yaw += cameraNoise.get(total)
  planet.moveItemLocal(camera, new THREE.Vector3(0, 0, -.003))
  }
  planet.water.morphTargetInfluences[0] = (Math.sin(total * 2) + 1) / 2;
  render();
}

setupScene();
animate();
