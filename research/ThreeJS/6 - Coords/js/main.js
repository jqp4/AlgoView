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
// camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 1, 1000 );
camera.position.set(100, 40, 20);
var frustumSize = 1000;

var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
var clock = new THREE.Clock();

var axisSize = 60;
var colors = [
    0xed6a5a, 0xf4f1bb, 0x9bc1bc, 0x5ca4a9, 0xe6ebe0, 0xf0b67f, 0xfe5f55,
    0xd6d1b1, 0xc7efcf, 0xeef5db, 0x50514f, 0xf25f5c, 0xffe066, 0x247ba0,
    0x70c1b3,
];

var jsonData = JSON.parse(data);
var resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
var graph = new THREE.Object3D();
scene.add(graph);

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
    console.log(jsonData);

    createAxis();
    createAxisText();
    creatrLight();
    createVertices();
    createEdges();
}

function createSphere(x, y, z, color_index) {
    const sphereRadius = 3;
    const sphereWidthDivisions = 16;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereGeometry(
        sphereRadius,
        sphereWidthDivisions,
        sphereHeightDivisions
    );

    const sphereMat = new THREE.MeshPhongMaterial({
        color: colors[color_index],
    });
    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.position.set(x, y, z);
    graph.add(mesh);
}

function createOctahedron(x, y, z, color_index) {
    // https://threejs.org/docs/#api/en/geometries/OctahedronGeometry

    const octahedronRadius = 3;
    const octahedronGeo = new THREE.OctahedronGeometry(octahedronRadius);
    const octahedronMat = new THREE.MeshPhongMaterial({
        color: colors[color_index],
    });
    const mesh = new THREE.Mesh(octahedronGeo, octahedronMat);
    mesh.position.set(x, y, z);
    graph.add(mesh);
}

function createVertices() {
    for (let i = 0; i < jsonData.vertices.length; i++) {
        const element = jsonData.vertices[i];
        // console.log(element);
        const coords = element.coords;
        const type = Number(element.type);
        if (type == 1) {
            createSphere(coords[0], coords[1], coords[2], type);
        } else if (type == 2) {
            createOctahedron(coords[0], coords[1], coords[2], type);
        }
    }
}

function createEdges() {
    for (let i = 0; i < jsonData.edges.length; i++) {
        const element = jsonData.edges[i];
        const coords_sourse = element.coords_sourse;
        const coords_target = element.coords_target;
        const type = Number(element.type);
        // console.log(element);

        // createSphere(coords[0], coords[1], coords[2], type);

        var line = new THREE.Geometry();
        line.vertices.push(
            new THREE.Vector3(
                coords_sourse[0],
                coords_sourse[1],
                coords_sourse[2]
            )
        );

        line.vertices.push(
            new THREE.Vector3(
                coords_target[0],
                coords_target[1],
                coords_target[2]
            )
        );

        makeLine(line, type);
    }
}

function createArrow(sourceVector3, targetVector3) {
    var line = new THREE.Geometry();
    line.vertices.push(sourceVector3);
    line.vertices.push(targetVector3);
    makeLine(line, 3);

    var x = targetVector3.x - sourceVector3.x;
    var y = targetVector3.y - sourceVector3.y;
    var z = targetVector3.z - sourceVector3.z;

    var len = Math.sqrt(Math.pow(x), Math.pow(y), Math.pow(z));
    x = x / len;
    y = y / len;
    z = z / len;

    // a =

    var coneSourceVector3 = new THREE.Vector3(
        targetVector3.x - x,
        targetVector3.y - y,
        targetVector3.z - z
    );

    // ??????????

    // https://customizer.github.io/three.js-doc.ru/geometries/coneBufferGeometry.htm
    // https://threejs.org/docs/#api/en/geometries/ConeGeometry

    const coneRadius = 1.5;
    const coneHeight = 4;
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
    mesh.position.set(targetVector3.x, targetVector3.y, targetVector3.z);

    mesh.rotation.x = 1;

    scene.add(mesh);

    // const dir = new THREE.Vector3( 1, 2, 0 );

    // //normalize the direction vector (convert to vector of length 1)
    // dir.normalize();

    // const origin = new THREE.Vector3( 0, 0, 0 );
    // const length = 10;
    // const hex = 0xffff00;

    // const arrowHelper = new THREE.ArrowHelper( dir, origin, length );
    // scene.add( arrowHelper );
}

function createLines() {
    var line = new THREE.Geometry();
    line.vertices.push(new THREE.Vector3(-30, -30, -30));
    line.vertices.push(new THREE.Vector3(30, -30, -30));
    makeLine(line, 3);
    // createArrow(
    //     new THREE.Vector3(-30, -30, -30),
    //     new THREE.Vector3(30, -30, -30)
    // );

    var line = new THREE.Geometry();
    line.vertices.push(new THREE.Vector3(-30, -30, -30));
    line.vertices.push(new THREE.Vector3(-30, 30, -30));
    makeLine(line, 3);

    var line = new THREE.Geometry();
    line.vertices.push(new THREE.Vector3(-30, -30, -30));
    line.vertices.push(new THREE.Vector3(-30, -30, 30));
    makeLine(line, 3);

    // var line = new Float32Array(600);
    // for (var j = 0; j < 200 * 3; j += 3) {
    //     line[j] = -30 + 0.1 * j;
    //     line[j + 1] = 5 * Math.sin(0.01 * j) * Math.cos(0.005 * j);
    //     line[j + 2] = 0;
    // }
    // makeLine(line, 1);
}

function createAxis() {
    var line = new THREE.Geometry();
    line.vertices.push(new THREE.Vector3(0, 0, 0));
    line.vertices.push(new THREE.Vector3(60, 0, 0));
    makeLine(line, 3);
    // createArrow(
    //     new THREE.Vector3(-30, -30, -30),
    //     new THREE.Vector3(30, -30, -30)
    // );

    var line = new THREE.Geometry();
    line.vertices.push(new THREE.Vector3(0, 0, 0));
    line.vertices.push(new THREE.Vector3(0, 60, 0));
    makeLine(line, 3);

    var line = new THREE.Geometry();
    line.vertices.push(new THREE.Vector3(0, 0, 0));
    line.vertices.push(new THREE.Vector3(0, 0, 60));
    makeLine(line, 3);

    // var line = new Float32Array(600);
    // for (var j = 0; j < 200 * 3; j += 3) {
    //     line[j] = -30 + 0.1 * j;
    //     line[j + 1] = 5 * Math.sin(0.01 * j) * Math.cos(0.005 * j);
    //     line[j + 2] = 0;
    // }
    // makeLine(line, 1);
}

function textParameters(text, fontSize) {
    return {
        alignment: "center",
        backgroundColor: "rgba(0,0,0,0)",
        color: "#000000",
        fontFamily: "sans-serif",
        fontSize: fontSize,
        fontStyle: "normal",
        fontVariant: "normal",
        fontWeight: "normal",
        lineGap: 0.25,
        padding: 0.5,
        strokeColor: "#fff",
        strokeWidth: 0,
        text: text,
    };
}

function createAxisText() {
    const fontSize = 6;
    const axisPos = axisSize + fontSize / 1.5;

    var parameters_x = textParameters("x", fontSize);
    var parameters_y = textParameters("y", fontSize);
    var parameters_z = textParameters("z", fontSize);

    var label_x = new THREE.TextSprite(parameters_x);
    var label_y = new THREE.TextSprite(parameters_y);
    var label_z = new THREE.TextSprite(parameters_z);

    label_x.position.set(axisPos, 0, 0);
    label_y.position.set(0, axisPos, 0);
    label_z.position.set(0, 0, axisPos);

    graph.add(label_x);
    graph.add(label_y);
    graph.add(label_z);
}

function creatrLight() {
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
    // let p = camera.position;
    // let d = camera.quaternion;
    // let ps = [p.x.toFixed(2), p.y.toFixed(2), p.z.toFixed(2)];
    // let ds = [d.x.toFixed(2), d.y.toFixed(2), d.z.toFixed(2)];
    // instance.text = [ps, ds].join("\n");

    renderer.render(scene, camera);
}
