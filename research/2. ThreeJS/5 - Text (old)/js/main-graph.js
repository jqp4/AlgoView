"use strict";

//import THREE from "./three.min";

let container = document.getElementById("container");

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    400
);
// var camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 1, 1000 );
camera.position.set(100, 40, 20);
var frustumSize = 1000;

var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
var clock = new THREE.Clock();

var colors = [
    0xed6a5a, 0xf4f1bb, 0x9bc1bc, 0x5ca4a9, 0xe6ebe0, 0xf0b67f, 0xfe5f55,
    0xd6d1b1, 0xc7efcf, 0xeef5db, 0x50514f, 0xf25f5c, 0xffe066, 0x247ba0,
    0x70c1b3,
];

var resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
var graph = new THREE.Object3D();
scene.add(graph);

let instance;

init();
render();

function makeLine(geo, c) {
    var g = new MeshLine();
    g.setGeometry(geo);

    var material = new MeshLineMaterial({
        useMap: false,
        color: new THREE.Color(colors[c]),
        opacity: 1,
        resolution: resolution,
        sizeAttenuation: false,
        lineWidth: 10,
    });
    var mesh = new THREE.Mesh(g.geometry, material);
    graph.add(mesh);
}

function init() {
    createLines();
}

function createLines() {
    var line = new Float32Array(600);
    for (var j = 0; j < 200 * 3; j += 3) {
        line[j] = -30 + 0.1 * j;
        line[j + 1] = 5 * Math.sin(0.01 * j);
        line[j + 2] = -20;
    }
    makeLine(line, 0);

    var line = new Float32Array(600);
    for (var j = 0; j < 200 * 3; j += 3) {
        line[j] = -30 + 0.1 * j;
        line[j + 1] = 5 * Math.cos(0.02 * j);
        line[j + 2] = -10;
    }
    makeLine(line, 1);

    var line = new Float32Array(600);
    for (var j = 0; j < 200 * 3; j += 3) {
        line[j] = -30 + 0.1 * j;
        line[j + 1] = 5 * Math.sin(0.01 * j) * Math.cos(0.005 * j);
        line[j + 2] = 0;
    }
    makeLine(line, 2);

    var line = new Float32Array(600);
    for (var j = 0; j < 200 * 3; j += 3) {
        line[j] = -30 + 0.1 * j;
        line[j + 1] = 0.02 * j + 5 * Math.sin(0.01 * j) * Math.cos(0.005 * j);
        line[j + 2] = 10;
    }
    makeLine(line, 4);

    var line = new Float32Array(600);
    for (var j = 0; j < 200 * 3; j += 3) {
        line[j] = -30 + 0.1 * j;
        line[j + 1] = Math.exp(0.005 * j);
        line[j + 2] = 20;
    }
    makeLine(line, 5);

    var line = new THREE.Geometry();
    line.vertices.push(new THREE.Vector3(-30, -30, -30));
    line.vertices.push(new THREE.Vector3(30, -30, -30));
    makeLine(line, 3);

    var line = new THREE.Geometry();
    line.vertices.push(new THREE.Vector3(-30, -30, -30));
    line.vertices.push(new THREE.Vector3(-30, 30, -30));
    makeLine(line, 3);

    var line = new THREE.Geometry();
    line.vertices.push(new THREE.Vector3(-30, -30, -30));
    line.vertices.push(new THREE.Vector3(-30, -30, 30));
    makeLine(line, 3);

    // new THREE.TextGeometry( text, parameters );

    // {
    //     var text = new THREE.MeshText2D("RIGHT", {
    //         // align: THREE.textAlign.right,
    //         font: "30px Arial",
    //         fillStyle: "#000000",
    //         antialias: true,
    //     });

    //     graph.add(text);
    // }

    // сфера
    // {
    //     const sphereRadius = 3;
    //     const sphereWidthDivisions = 32;
    //     const sphereHeightDivisions = 16;
    //     const sphereGeo = new THREE.SphereGeometry(
    //         sphereRadius,
    //         sphereWidthDivisions,
    //         sphereHeightDivisions
    //     );
    //     // const sphereMat = new THREE.MeshPhongMaterial({ color: "#CA8" });

    //     const sphereMat = new TextGeometry("Hello three.js!", {
    //         font: font,
    //         size: 80,
    //         height: 5,
    //         curveSegments: 12,
    //         bevelEnabled: true,
    //         bevelThickness: 10,
    //         bevelSize: 8,
    //         bevelOffset: 0,
    //         bevelSegments: 5,
    //     });

    //     const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    //     mesh.position.set(30, -30, -30);
    //     graph.add(mesh);
    // }

    
         instance = new THREE.TextSprite({
            alignment: "center",
            backgroundColor: "rgba(0,0,0,0)",
            color: "#fff",
            fontFamily: "sans-serif",
            fontSize: 10,
            fontStyle: "normal",
            fontVariant: "normal",
            fontWeight: "normal",
            lineGap: 0.25,
            padding: 0.5,
            strokeColor: "#fff",
            strokeWidth: 0,
            text: "999",
        });

        // instance.position.set(-30, -30, -30);
        // let p = camera.position;
        // let d = camera.quaternion;
        // let ps = [p.x.toFixed(2), p.y.toFixed(2), p.z.toFixed(2)];
        // let ds = [d.x.toFixed(2), d.y.toFixed(2), d.z.toFixed(2)];

        // instance.text = [ps, ds].join("\n");

        graph.add(instance);
    
}

onWindowResize();

function onWindowResize() {
    var w = container.clientWidth;
    var h = container.clientHeight;

    var aspect = w / h;

    camera.left = (-frustumSize * aspect) / 2;
    camera.right = (frustumSize * aspect) / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;

    camera.updateProjectionMatrix();

    renderer.setSize(w, h);

    resolution.set(w, h);
}

window.addEventListener("resize", onWindowResize);

function render() {
    requestAnimationFrame(render);
    controls.update();
    // graph.rotation.y += 0.25 * clock.getDelta();
    let p = camera.position;
    let d = camera.quaternion;
    let ps = [p.x.toFixed(2), p.y.toFixed(2), p.z.toFixed(2)];
    let ds = [d.x.toFixed(2), d.y.toFixed(2), d.z.toFixed(2)];

    instance.text = [ps, ds].join("\n");

    renderer.render(scene, camera);
}
