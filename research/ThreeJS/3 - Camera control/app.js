// import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
// import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/OrbitControls.js';
// import {GUI} from 'https://threejsfundamentals.org/threejs/../3rdparty/dat.gui.module.js';

// import * as THREE from "./lib/three.js";
// import { OrbitControls } from "./lib/OrbitControls.js";
// import {GUI} from './lib/gui.module.js';

function main() {
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({ canvas });

    const fov = 45;
    const aspect = 2; // холст по умолчанию
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);

    //   class MinMaxGUIHelper {
    //     constructor(obj, minProp, maxProp, minDif) {
    //       this.obj = obj;
    //       this.minProp = minProp;
    //       this.maxProp = maxProp;
    //       this.minDif = minDif;
    //     }
    //     get min() {
    //       return this.obj[this.minProp];
    //     }
    //     set min(v) {
    //       this.obj[this.minProp] = v;
    //       this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
    //     }
    //     get max() {
    //       return this.obj[this.maxProp];
    //     }
    //     set max(v) {
    //       this.obj[this.maxProp] = v;
    //       this.min = this.min;  // это вызовет минимальный установщик
    //     }
    //   }

    //   function updateCamera() {
    //     camera.updateProjectionMatrix();
    //   }

    //   const gui = new GUI();
    //   gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
    //   const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
    //   gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
    //   gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);

    const controls = new THREE.OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("black");

    // плоскость
    {
        const planeSize = 40;

        const loader = new THREE.TextureLoader();
        const texture = loader.load(
            "https://threejsfundamentals.org/threejs/resources/images/checker.png"
        );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.magFilter = THREE.NearestFilter;
        const repeats = planeSize / 2;
        texture.repeat.set(repeats, repeats);

        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.rotation.x = Math.PI * -0.5;
        scene.add(mesh);
    }

    // куб
    {
        const cubeSize = 4;
        const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cubeMat = new THREE.MeshPhongMaterial({ color: "#8AC" });
        const mesh = new THREE.Mesh(cubeGeo, cubeMat);
        mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
        scene.add(mesh);
    }

    // центр куб
    {
        const cubeSize = 0.5;
        const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cubeMat = new THREE.MeshPhongMaterial({ color: "red" });
        const mesh = new THREE.Mesh(cubeGeo, cubeMat);
        // mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
        scene.add(mesh);
    }

    // сфера
    {
        const sphereRadius = 3;
        const sphereWidthDivisions = 32;
        const sphereHeightDivisions = 16;
        const sphereGeo = new THREE.SphereGeometry(
            sphereRadius,
            sphereWidthDivisions,
            sphereHeightDivisions
        );
        const sphereMat = new THREE.MeshPhongMaterial({ color: "#CA8" });
        const mesh = new THREE.Mesh(sphereGeo, sphereMat);
        mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
        scene.add(mesh);
    }

    // конус
    {
        // https://customizer.github.io/three.js-doc.ru/geometries/coneBufferGeometry.htm

        const coneRadius = 1;
        const coneHeight = 3;
        const coneRadiusSegments = 16;

        var coneGeo = new THREE.ConeGeometry(
            coneRadius,
            coneHeight,
            coneRadiusSegments
        );

        const coneMat = new THREE.MeshPhongMaterial({
            // flatShading: true,
            color: "#CA8",
        });
        const mesh = new THREE.Mesh(coneGeo, coneMat);
        mesh.position.set(0, coneHeight / 2, -5);
        scene.add(mesh);
    }

    // свет
    {
        const color = 0xffffff;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(0, 10, 2);
        light.target.position.set(-5, 0, 0);
        scene.add(light);
        scene.add(light.target);

        // https://www.youtube.com/watch?v=T6PhV4Hz0u4
        const ambientIntensity = 0.2;
        const ambientlight = new THREE.AmbientLight(color, ambientIntensity);
        scene.add(ambientlight);
    }

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render() {
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();
