"use strict";

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

var resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
var graph = new THREE.Object3D();
scene.add(graph);

class Params {
    constructor() {
        this.curves = true;
        this.circles = false;
        this.lineWidth = 6;
        this.taper = "parabolic";
        this.strokes = false;
        this.sizeAttenuation = false;
        this.autoRotate = false;
        this.autoUpdate = true;
        this.update = function () {
            clearScene();
            init();
        };
    }
}

var params = new Params();
var gui = new dat.GUI();

window.addEventListener("load", function () {
    function update() {
        if (params.autoUpdate) {
            clearScene();
            init();
        }
    }

    // gui.add(params, "curves").onChange(update);
    // gui.add(params, "circles").onChange(update);
    gui.add(params, "lineWidth", 1, 20).name("line width").onChange(update);
    // gui.add(params, "axisLength", 40, 80).name("axis length").onChange(update);
    // gui.add(params, "taper", ["none", "linear", "parabolic", "wavy"]).onChange(
    //     update
    // );
    // gui.add(params, "strokes").onChange(update);
    // gui.add(params, "sizeAttenuation").onChange(update);
    // gui.add(params, "autoUpdate").onChange(update);

    gui.add(params, "autoRotate")
        .name("auto rotate")
        .onChange(function () {
            clock.getDelta();
        });

    gui.add(params, "update");

    // var loader = new THREE.TextureLoader();
    // loader.load("assets/stroke.png", function (texture) {
    //     strokeTexture = texture;
    //     init();
    // });
});

const colors = [
    0xed6a5a, 0xf4f1bb, 0x9bc1bc, 0x5ca4a9, 0xe6ebe0, 0xf0b67f, 0xfe5f55,
    0xd6d1b1, 0xc7efcf, 0xeef5db, 0x50514f, 0xf25f5c, 0xffe066, 0x247ba0,
    0x70c1b3,
];

const jsonData = JSON.parse(data);

class Vertex {
    /**
     *
     * @param {number} id
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {string} type
     */
    constructor(id, x, y, z, type) {
        this.id = id;
        this.pos = new THREE.Vector3(x, y, z);
        this.type = type;

        this.buildVertexObject();
    }

    buildVertexObject() {
        if (this.type == "0") {
            createSphere(this.pos.x, this.pos.y, this.pos.z, 1);
        } else if (this.type == "1") {
            createOctahedron(this.pos.x, this.pos.y, this.pos.z, 2);
        } else {
            // будет позже возможно 
        }
    }
}

class Edge {
    // /**
    //  *
    //  * @param {number} id
    //  * @param {number} sourceVertexId
    //  * @param {number} targetVertexId
    //  * @param {string} type
    //  */
    // constructor(id, sourceVertexId, targetVertexId, type) {
    //     this.id = id;
    //     this.sourceVertexId = sourceVertexId;
    //     this.type = type;

    //     this.buildVertexObject();
    // }

    /**
     *
     * @param {number} id
     * @param {Vertex} sourceVertex
     * @param {Vertex} targetVertex
     * @param {string} type
     */
    constructor(id, sourceVertex, targetVertex, type) {
        this.id = id;
        this.sourceVertex = sourceVertex;
        this.targetVertex = targetVertex;
        this.type = type;

        this.buildEdgeObject();
    }

    buildEdgeObject() {
        createArrow(this.sourceVertex.pos, this.targetVertex.pos, 6);
    }


}

class AlgoView {
    constructor() {
        // this.jsonData = JSON.parse(data);
        this.dataInit();
    }

    dataInit() {
        this.jsonData = JSON.parse(data);
    }
}

let vertices = new Map();
let edges = new Map();

// let algoView = new AlgoView();

var xMaxPos = 0;
var yMaxPos = 0;
var zMaxPos = 0;

const axisShift = 15;
var oxAxisLength = () => xMaxPos + axisShift;
var oyAxisLength = () => yMaxPos + axisShift;
var ozAxisLength = () => zMaxPos + axisShift;

init();
render();

function clearScene() {
    scene.remove(graph);
    graph = new THREE.Object3D();
    scene.add(graph);
}

function makeLine(geo, colorIndex) {
    var g = new MeshLine();
    g.setGeometry(geo);

    var material = new MeshLineMaterial({
        useMap: false,
        color: new THREE.Color(colors[colorIndex]),
        opacity: 1,
        resolution: resolution,
        sizeAttenuation: false,
        lineWidth: params.lineWidth,
    });
    var mesh = new THREE.Mesh(g.geometry, material);
    graph.add(mesh);
}

function init() {
    // console.log(jsonData);

    createLight();
    createVertices();
    createEdges();
    createAxis();
    createAxisText();

    // createLight();
    // createArrowsTest();
    // createAxisText();
}

function createSphere(x, y, z, colorIndex) {
    const sphereRadius = 2;
    const sphereWidthDivisions = 16;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereGeometry(
        sphereRadius,
        sphereWidthDivisions,
        sphereHeightDivisions
    );

    const sphereMat = new THREE.MeshPhongMaterial({
        color: colors[colorIndex],
    });
    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.position.set(x, y, z);
    graph.add(mesh);
}

function createOctahedron(x, y, z, colorIndex) {
    // https://threejs.org/docs/#api/en/geometries/OctahedronGeometry

    const octahedronRadius = 2;
    const octahedronGeo = new THREE.OctahedronGeometry(octahedronRadius);
    const octahedronMat = new THREE.MeshPhongMaterial({
        color: colors[colorIndex],
    });
    const mesh = new THREE.Mesh(octahedronGeo, octahedronMat);
    mesh.position.set(x, y, z);
    graph.add(mesh);
}

function updateAxisLengths(x, y, z) {
    if (x > xMaxPos) xMaxPos = x;
    if (y > yMaxPos) yMaxPos = y;
    if (z > zMaxPos) zMaxPos = z;
}

function createVertices() {
    for (let i = 0; i < jsonData.vertices.length; i++) {
        const element = jsonData.vertices[i];

        const x = element.coordinates[0];
        const y = element.coordinates[1];
        const z = element.coordinates[2];

        updateAxisLengths(x, y, z);

        const vertex = new Vertex(
            element.id,
            x,
            y,
            z,
            // element.coordinates[0],
            // element.coordinates[1],
            // element.coordinates[2],
            element.type
        );

        // console.log(vertex);
        vertices.set(element.id, vertex);
    }
}

function createEdges() {
    for (let i = 0; i < jsonData.edges.length; i++) {
        const element = jsonData.edges[i];

        // console.log(element)

        const edge = new Edge(
            element.id,
            vertices.get(element.sourceVertexId),
            vertices.get(element.targetVertexId),
            element.type
        );

        // console.log(edge);
        edges.set(element.id, edge);
    }
}

function createArrowOld1(sourceVector3, targetVector3, colorIndex = 3) {
    var line = new THREE.Geometry();
    line.vertices.push(sourceVector3);
    line.vertices.push(targetVector3);
    makeLine(line, colorIndex);

    var x = targetVector3.x - sourceVector3.x;
    var y = targetVector3.y - sourceVector3.y;
    var z = targetVector3.z - sourceVector3.z;

    var alpha = y == 0 ? (Math.sign(z) * Math.PI) / 2 : Math.atan(z / y); // поворот вокруг оси OX
    var beta = z == 0 ? (Math.sign(x) * Math.PI) / 2 : Math.atan(x / z); //  поворот вокруг оси OY
    var gamma = x == 0 ? (Math.sign(y) * Math.PI) / 2 : Math.atan(y / x); // поворот вокруг оси OZ

    console.log(x, y, z);
    console.log(alpha, beta, gamma);

    // var len = Math.sqrt(Math.pow(x), Math.pow(y), Math.pow(z));
    // x = x / len;
    // y = y / len;
    // z = z / len;

    // var coneSourceVector3 = new THREE.Vector3(
    //     targetVector3.x - x,
    //     targetVector3.y - y,
    //     targetVector3.z - z
    // );

    // конус

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
        // color: "#CA8",
        color: colors[colorIndex],
    });

    const mesh = new THREE.Mesh(coneGeo, coneMat);
    mesh.position.set(targetVector3.x, targetVector3.y, targetVector3.z);
    // mesh.position.set(0, coneHeight/2, 0);

    // mesh.rotation.x = alpha;
    // mesh.rotation.z = -beta;
    // mesh.rotation.y = gamma;

    // gamma -= Math.PI / 2;
    // mesh.rotation.x = alpha;
    // mesh.rotation.y = Math.PI / 2;
    // mesh.rotation.z = gamma;

    mesh.lookAt(0, 0, 0);

    graph.add(mesh);
}

function createArrowOld2(sourceVector3, targetVector3, colorIndex = 3) {
    // var line = new THREE.Geometry();
    // line.vertices.push(sourceVector3);
    // line.vertices.push(targetVector3);
    // makeLine(line, colorIndex);

    const x = targetVector3.x - sourceVector3.x;
    const y = targetVector3.y - sourceVector3.y;
    const z = targetVector3.z - sourceVector3.z;

    const shiftLength = 2.9;
    const vectorLength = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
    const shift = [
        (x * shiftLength) / vectorLength,
        (y * shiftLength) / vectorLength,
        (z * shiftLength) / vectorLength,
    ];

    const croppedTargetVector3 = new THREE.Vector3(
        targetVector3.x - shift[0],
        targetVector3.y - shift[1],
        targetVector3.z - shift[2]
    );

    const later = 0;

    // поворот вокруг оси OX
    var alpha = (() => {
        // if (y == 0) return Math.PI / 2;
        return Math.atan(z / y); // + (y > 0 ? 0 : Math.PI);
    })();

    // поворот вокруг оси OY
    var beta = (() => {
        // if (y == 0) return Math.PI / 2;
        return 0.5; //Math.atan(x / z); // + (y > 0 ? 0 : Math.PI);
    })();

    // поворот вокруг оси OZ
    var gamma = (() => {
        // if (y == 0) return Math.PI / 2;
        return -Math.atan(x / y) + (y > 0 ? 0 : Math.PI);
    })();

    // const sum = alpha + gamma;
    // alpha /= sum;
    // gamma /= sum;

    // var beta =
    //     x == 0
    //         ? y == 0
    //             ? z == 0
    //                 ? 0
    //                 : later
    //             : z == 0
    //             ? Math.atan(x / y)
    //             : later
    //         : y == 0
    //         ? z == 0
    //             ? (Math.sign(x) * Math.PI) / 2
    //             : later
    //         : z == 0
    //         ? Math.atan(x / y) + (y < 0 ? Math.PI : 0) // ТОЛЬКО ЭТО ТОЧНО ПРОВЕРИЛ (x, y != 0, z = 0)
    //         : later;

    // поворот вокруг чего-то ой
    // var gamma = x == 0 ? (Math.sign(y) * Math.PI) / 2 : Math.atan(y / x);

    // линия

    var line = new THREE.Geometry();
    line.vertices.push(sourceVector3);
    line.vertices.push(croppedTargetVector3);
    makeLine(line, colorIndex);

    // конус
    // https://customizer.github.io/three.js-doc.ru/geometries/coneBufferGeometry.htm
    // https://threejs.org/docs/#api/en/geometries/ConeGeometry

    const coneRadius = 0.8; // 1.5;
    const coneHeight = 2; // 4;
    const coneRadiusSegments = 16;

    var coneGeo = new THREE.ConeGeometry(
        coneRadius,
        coneHeight,
        coneRadiusSegments
    );

    const coneMat = new THREE.MeshPhongMaterial({
        // flatShading: true,
        // color: "#CA8",
        color: colors[colorIndex],
    });

    const mesh = new THREE.Mesh(coneGeo, coneMat);
    mesh.position.set(
        targetVector3.x - shift[0],
        targetVector3.y - shift[1],
        targetVector3.z - shift[2]
    );
    // mesh.position.set(0, coneHeight/2, 0);

    mesh.rotation.x = alpha;
    mesh.rotation.y = beta;
    mesh.rotation.z = gamma;

    graph.add(mesh);
}

function createArrowOld3_LookAt(sourceVector3, targetVector3, colorIndex = 3) {
    var line = new THREE.Geometry();
    line.vertices.push(sourceVector3);
    line.vertices.push(targetVector3);
    makeLine(line, colorIndex);

    var x = targetVector3.x - sourceVector3.x;
    var y = targetVector3.y - sourceVector3.y;
    var z = targetVector3.z - sourceVector3.z;

    const v = [x, y, z];
    var vNormal = [0, 0, 0];

    const maxComponent = Math.max(...v);
    const maxComponentIndex = v.indexOf(maxComponent);
    if (maxComponentIndex == 0) {
        vNormal[1] = -v[2];
        vNormal[2] = -v[1];
    } else if (maxComponentIndex == 1) {
        vNormal[0] = -v[2];
        vNormal[2] = -v[0];
    } else if (maxComponentIndex == 2) {
        vNormal[0] = -v[1];
        vNormal[1] = -v[0];
    } else {
        console.log("createArrow(): Ошибка вычисления координат нормали");
    }

    var vNormalPoint = [
        v[0] + vNormal[0],
        v[1] + vNormal[1],
        v[2] + vNormal[2],
        // vNormal[0],vNormal[1],vNormal[2],
    ];

    console.log(v, vNormal, vNormalPoint);

    // конус

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
        // color: "#CA8",
        color: colors[colorIndex],
    });

    const mesh = new THREE.Mesh(coneGeo, coneMat);
    mesh.position.set(targetVector3.x, targetVector3.y, targetVector3.z);
    // mesh.position.set(0, coneHeight/2, 0);

    // mesh.lookAt(0, 0, 0);
    mesh.lookAt(vNormalPoint[0], vNormalPoint[1], vNormalPoint[2]);

    graph.add(mesh);
}

function createArrowOld4(sourceVector3, targetVector3, colorIndex = 3) {
    // var line = new THREE.Geometry();
    // line.vertices.push(sourceVector3);
    // line.vertices.push(targetVector3);
    // makeLine(line, colorIndex);

    const x = targetVector3.x - sourceVector3.x;
    const y = targetVector3.y - sourceVector3.y;
    const z = targetVector3.z - sourceVector3.z;

    const shiftLength = 2.9;
    const vectorLength = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
    const shift = [
        (x * shiftLength) / vectorLength,
        (y * shiftLength) / vectorLength,
        (z * shiftLength) / vectorLength,
    ];

    const croppedTargetVector3 = new THREE.Vector3(
        targetVector3.x - shift[0],
        targetVector3.y - shift[1],
        targetVector3.z - shift[2]
    );

    const later = 0;

    // поворот вокруг оси OX
    var alpha = (() => {
        // if (y == 0) return Math.PI / 2;
        // return Math.atan(z / y); // + (y > 0 ? 0 : Math.PI);
        return Math.asin(z / vectorLength);
    })();

    // поворот вокруг оси OY
    var beta = (() => {
        // if (y == 0) return Math.PI / 2;
        // return Math.atan(x / z); // + (y > 0 ? 0 : Math.PI);
        return 0;
    })();

    // поворот вокруг оси OZ
    var gamma = (() => {
        // if (y == 0) return Math.PI / 2;
        // return -Math.atan(x / y) + (y > 0 ? 0 : Math.PI);
        return -Math.atan(x / y);
    })();

    // const sum = alpha + gamma;
    // alpha /= sum;
    // gamma /= sum;

    // var beta =
    //     x == 0
    //         ? y == 0
    //             ? z == 0
    //                 ? 0
    //                 : later
    //             : z == 0
    //             ? Math.atan(x / y)
    //             : later
    //         : y == 0
    //         ? z == 0
    //             ? (Math.sign(x) * Math.PI) / 2
    //             : later
    //         : z == 0
    //         ? Math.atan(x / y) + (y < 0 ? Math.PI : 0) // ТОЛЬКО ЭТО ТОЧНО ПРОВЕРИЛ (x, y != 0, z = 0)
    //         : later;

    // поворот вокруг чего-то ой
    // var gamma = x == 0 ? (Math.sign(y) * Math.PI) / 2 : Math.atan(y / x);

    // линия

    var line = new THREE.Geometry();
    line.vertices.push(sourceVector3);
    line.vertices.push(croppedTargetVector3);
    makeLine(line, colorIndex);

    // конус
    // https://customizer.github.io/three.js-doc.ru/geometries/coneBufferGeometry.htm
    // https://threejs.org/docs/#api/en/geometries/ConeGeometry

    const coneRadius = 0.8; // 1.5;
    const coneHeight = 2; // 4;
    const coneRadiusSegments = 16;

    var coneGeo = new THREE.ConeGeometry(
        coneRadius,
        coneHeight,
        coneRadiusSegments
    );

    const coneMat = new THREE.MeshPhongMaterial({
        // flatShading: true,
        // color: "#CA8",
        color: colors[colorIndex],
    });

    const mesh = new THREE.Mesh(coneGeo, coneMat);
    mesh.position.set(
        targetVector3.x - shift[0],
        targetVector3.y - shift[1],
        targetVector3.z - shift[2]
    );
    // mesh.position.set(0, coneHeight/2, 0);

    mesh.rotation.x = alpha;
    // mesh.rotation.y = beta;
    // mesh.rotation.z = gamma;

    graph.add(mesh);
}

function createArrow(sourceVector3, targetVector3, colorIndex = 3) {
    const x = targetVector3.x - sourceVector3.x;
    const y = targetVector3.y - sourceVector3.y;
    const z = targetVector3.z - sourceVector3.z;

    const shiftLength = 2.9;
    const vectorLength = Math.sqrt(x ** 2 + y ** 2 + z ** 2);

    const shift = new THREE.Vector3(
        (x * shiftLength) / vectorLength,
        (y * shiftLength) / vectorLength,
        (z * shiftLength) / vectorLength
    );

    const croppedTargetVector3 = new THREE.Vector3(
        targetVector3.x - shift.x,
        targetVector3.y - shift.y,
        targetVector3.z - shift.z
    );

    // линия
    const line = new THREE.Geometry();
    line.vertices.push(sourceVector3);
    line.vertices.push(croppedTargetVector3);
    makeLine(line, colorIndex);

    const coneMesh = getConeMesh(colorIndex);
    coneMesh.rotation.x = Math.PI / 2;

    const cone = new THREE.Object3D();
    cone.add(coneMesh);
    cone.position.set(
        croppedTargetVector3.x,
        croppedTargetVector3.y,
        croppedTargetVector3.z
    );

    cone.lookAt(targetVector3.x, targetVector3.y, targetVector3.z);
    graph.add(cone);
}

function getConeMesh(colorIndex = 3) {
    // конус
    // https://customizer.github.io/three.js-doc.ru/geometries/coneBufferGeometry.htm
    // https://threejs.org/docs/#api/en/geometries/ConeGeometry

    const coneRadius = 0.8; // 1.5;
    const coneHeight = 2; // 4;
    const coneRadiusSegments = 16;

    var coneGeo = new THREE.ConeGeometry(
        coneRadius,
        coneHeight,
        coneRadiusSegments
    );

    const coneMat = new THREE.MeshPhongMaterial({
        // flatShading: true,
        // color: "#CA8",
        color: colors[colorIndex],
    });

    return new THREE.Mesh(coneGeo, coneMat);
}

function createLines() {
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

    // var line = new Float32Array(600);
    // for (var j = 0; j < 200 * 3; j += 3) {
    //     line[j] = -30 + 0.1 * j;
    //     line[j + 1] = 5 * Math.sin(0.01 * j) * Math.cos(0.005 * j);
    //     line[j + 2] = 0;
    // }
    // makeLine(line, 1);
}

function createAxis() {
    createArrow(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(oxAxisLength(), 0, 0)
    );

    createArrow(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, oyAxisLength(), 0)
    );

    createArrow(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, ozAxisLength())
    );

    // куб 0 0 0
    // {
    //     const cubeSize = 0.2;
    //     const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    //     const cubeMat = new THREE.MeshPhongMaterial({ color: colors[3] });
    //     const mesh = new THREE.Mesh(cubeGeo, cubeMat);
    //     graph.add(mesh);
    // }
}

function createArrowsTest_old() {
    const n = 5;
    const l = 50;

    var xMaxPos = l;
    var yMaxPos = l;
    var zMaxPos = l;

    const v0 = new THREE.Vector3(0, 0, 0);

    // arrows

    for (let i = 0; i < n; i++) {
        const a = (l / n) * i;
        createArrow(v0, new THREE.Vector3(l, a, 0));
    }

    for (let i = 0; i < n; i++) {
        const a = (l / n) * i;
        createArrow(v0, new THREE.Vector3(l, 0, a));
    }

    for (let i = 0; i < n; i++) {
        const a = (l / n) * i;
        createArrow(v0, new THREE.Vector3(a, l, 0));
    }

    for (let i = 0; i < n; i++) {
        const a = (l / n) * i;
        createArrow(v0, new THREE.Vector3(0, l, a));
    }

    for (let i = 0; i < n; i++) {
        const a = (l / n) * i;
        createArrow(v0, new THREE.Vector3(a, 0, l));
    }

    for (let i = 0; i < n; i++) {
        const a = (l / n) * i;
        createArrow(v0, new THREE.Vector3(0, a, l));
    }

    // lines

    {
        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(0, 0, 0));
        line.vertices.push(new THREE.Vector3(l, 0, 0));
        makeLine(line, 6);

        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(0, 0, 0));
        line.vertices.push(new THREE.Vector3(0, l, 0));
        makeLine(line, 6);

        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(0, 0, 0));
        line.vertices.push(new THREE.Vector3(0, 0, l));
        makeLine(line, 6);

        //

        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(l, 0, 0));
        line.vertices.push(new THREE.Vector3(l, l, 0));
        makeLine(line, 6);

        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(l, 0, 0));
        line.vertices.push(new THREE.Vector3(l, 0, l));
        makeLine(line, 6);

        //

        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(0, l, 0));
        line.vertices.push(new THREE.Vector3(l, l, 0));
        makeLine(line, 6);

        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(0, l, 0));
        line.vertices.push(new THREE.Vector3(0, l, l));
        makeLine(line, 6);

        //

        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(0, 0, l));
        line.vertices.push(new THREE.Vector3(0, l, l));
        makeLine(line, 6);

        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(0, 0, l));
        line.vertices.push(new THREE.Vector3(l, 0, l));
        makeLine(line, 6);
    }
}

function createArrowsTest() {
    const n = 20;
    const l = 30;

    var xMaxPos = l;
    var yMaxPos = l;
    var zMaxPos = l;

    const v0 = new THREE.Vector3(0, 0, 0);

    // arrows

    for (let i = 0; i < n; i++) {
        const a = ((Math.PI * 2) / n) * i;
        const x = l * Math.sin(a);
        const y = l * Math.cos(a);

        createArrow(v0, new THREE.Vector3(x, y, 40));
    }

    // for (let i = 0; i < n; i++) {
    //     const a = (l / n) * i;
    //     createArrow(v0, new THREE.Vector3(l, 0, a));
    // }

    // for (let i = 0; i < n; i++) {
    //     const a = (l / n) * i;
    //     createArrow(v0, new THREE.Vector3(a, l, 0));
    // }

    // for (let i = 0; i < n; i++) {
    //     const a = (l / n) * i;
    //     createArrow(v0, new THREE.Vector3(0, l, a));
    // }

    // for (let i = 0; i < n; i++) {
    //     const a = (l / n) * i;
    //     createArrow(v0, new THREE.Vector3(a, 0, l));
    // }

    // for (let i = 0; i < n; i++) {
    //     const a = (l / n) * i;
    //     createArrow(v0, new THREE.Vector3(0, a, l));
    // }

    // lines
    {
        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(0, 0, 0));
        line.vertices.push(new THREE.Vector3(l, 0, 0));
        makeLine(line, 6);

        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(0, 0, 0));
        line.vertices.push(new THREE.Vector3(0, l, 0));
        makeLine(line, 6);

        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(0, 0, 0));
        line.vertices.push(new THREE.Vector3(0, 0, l));
        makeLine(line, 6);

        //

        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(l, 0, 0));
        line.vertices.push(new THREE.Vector3(l, l, 0));
        makeLine(line, 6);

        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(l, 0, 0));
        line.vertices.push(new THREE.Vector3(l, 0, l));
        makeLine(line, 6);

        //

        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(0, l, 0));
        line.vertices.push(new THREE.Vector3(l, l, 0));
        makeLine(line, 6);

        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(0, l, 0));
        line.vertices.push(new THREE.Vector3(0, l, l));
        makeLine(line, 6);

        //

        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(0, 0, l));
        line.vertices.push(new THREE.Vector3(0, l, l));
        makeLine(line, 6);

        var line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(0, 0, l));
        line.vertices.push(new THREE.Vector3(l, 0, l));
        makeLine(line, 6);
    }
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
    const fontSize = 5;

    const parameters_x = textParameters("x", fontSize);
    const parameters_y = textParameters("y", fontSize);
    const parameters_z = textParameters("z", fontSize);

    const label_x = new THREE.TextSprite(parameters_x);
    const label_y = new THREE.TextSprite(parameters_y);
    const label_z = new THREE.TextSprite(parameters_z);

    label_x.position.set(oxAxisLength() + fontSize, 0, 0);
    label_y.position.set(0, oyAxisLength() + fontSize, 0);
    label_z.position.set(0, 0, ozAxisLength() + fontSize);

    graph.add(label_x);
    graph.add(label_y);
    graph.add(label_z);
}

function createLight() {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 2);
    light.target.position.set(-5, 0, 0);
    graph.add(light);
    graph.add(light.target);

    // https://www.youtube.com/watch?v=T6PhV4Hz0u4
    const ambientIntensity = 0.2;
    const ambientLight = new THREE.AmbientLight(color, ambientIntensity);
    graph.add(ambientLight);
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

    if (params.autoRotate) {
        graph.rotation.y += 0.25 * clock.getDelta();
    }

    renderer.render(scene, camera);
}
