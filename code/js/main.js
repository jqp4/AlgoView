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
let frustumSize = 1000;

let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

let controls = new THREE.OrbitControls(camera, renderer.domElement);
let clock = new THREE.Clock();

let resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
let graph = new THREE.Object3D();
scene.add(graph);

class Params {
    constructor() {
        this.curves = true;
        this.circles = false;
        this.lineWidth = 5;
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

let params = new Params();
let gui = new dat.GUI();

const colors = [
    0xed6a5a, 0xf4f1bb, 0x9bc1bc, 0x5ca4a9, 0xe6ebe0, 0xf0b67f, 0xfe5f55,
    0xd6d1b1, 0xc7efcf, 0xeef5db, 0x50514f, 0xf25f5c, 0xffe066, 0x247ba0,
    0x70c1b3,
];

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
        switch (this.type) {
            case "0": {
                GraphicObjects.createSphere(
                    this.pos.x,
                    this.pos.y,
                    this.pos.z,
                    1
                );
                break;
            }
            case "1": {
                GraphicObjects.createOctahedron(
                    this.pos.x,
                    this.pos.y,
                    this.pos.z,
                    2
                );
                break;
            }
            default: {
                GraphicObjects.createSphere(
                    this.pos.x,
                    this.pos.y,
                    this.pos.z,
                    1
                );
                break;
            }
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
        GraphicObjects.createArrow(
            this.sourceVertex.pos,
            this.targetVertex.pos,
            6
        );
    }
}

class Graph {
    vertices = new Map();
    edges = new Map();

    constructor(graphData) {
        this.graphData = graphData;

        this.createVertices();
        this.createEdges();

        this.size = this.getSize();
    }

    createVertices() {
        for (let i = 0; i < this.graphData.vertices.length; i++) {
            const element = this.graphData.vertices[i];

            // const x = element.coordinates[0];
            // const y = element.coordinates[1];
            // const z = element.coordinates[2];

            const vertex = new Vertex(
                element.id,
                element.coordinates[0],
                element.coordinates[1],
                element.coordinates[2],
                element.type
            );

            // console.log(vertex);
            this.vertices.set(element.id, vertex);
        }
    }

    createEdges() {
        for (let i = 0; i < this.graphData.edges.length; i++) {
            const element = this.graphData.edges[i];

            // console.log(element)

            const edge = new Edge(
                element.id,
                this.vertices.get(element.sourceVertexId),
                this.vertices.get(element.targetVertexId),
                element.type
            );

            // console.log(edge);
            this.edges.set(element.id, edge);
        }
    }

    getSize() {
        let sizeVector3 = new THREE.Vector3(0, 0, 0);

        this.vertices.forEach((vertex, _, __) => {
            if (vertex.pos.x > sizeVector3.x) sizeVector3.x = vertex.pos.x;
            if (vertex.pos.y > sizeVector3.y) sizeVector3.y = vertex.pos.y;
            if (vertex.pos.z > sizeVector3.z) sizeVector3.z = vertex.pos.z;
        });

        return sizeVector3;
    }
}

class AlgoView {
    constructor(graphData) {
        this.graph = new Graph(graphData);
        this.setAxisLengths();
    }

    setAxisLengths() {
        const axisShift = 15;
        this.oxAxisLength = this.graph.size.x + axisShift;
        this.oyAxisLength = this.graph.size.y + axisShift;
        this.ozAxisLength = this.graph.size.z + axisShift;
    }
}

class GraphicObjects {
    static createMeshLineByGeo(geo, colorIndex) {
        const meshLine = new MeshLine();
        meshLine.setGeometry(geo);

        const material = new MeshLineMaterial({
            useMap: false,
            color: new THREE.Color(colors[colorIndex]),
            opacity: 1,
            resolution: resolution,
            sizeAttenuation: false,
            lineWidth: params.lineWidth,
        });

        const mesh = new THREE.Mesh(meshLine.geometry, material);
        graph.add(mesh);
    }

    static createMeshLine(sourceVector3, targetVector3, colorIndex) {
        const line = new THREE.Geometry();
        line.vertices.push(sourceVector3);
        line.vertices.push(targetVector3);

        const meshLine = new MeshLine();
        meshLine.setGeometry(line);

        const material = new MeshLineMaterial({
            useMap: false,
            color: new THREE.Color(colors[colorIndex]),
            opacity: 1,
            resolution: resolution,
            sizeAttenuation: false,
            lineWidth: params.lineWidth,
        });

        const mesh = new THREE.Mesh(meshLine.geometry, material);
        graph.add(mesh);
    }

    /** супер простая линия если понадобится */
    static createSimpleLine(sourceVector3, targetVector3, colorIndex) {
        const geometry = new THREE.Geometry();
        geometry.vertices.push(sourceVector3);
        geometry.vertices.push(targetVector3);

        const material = new THREE.LineBasicMaterial({ color: 0x000000 });
        const line = new THREE.Line(geometry, material);

        graph.add(line);
    }

    /**
     * Создает линию
     * @param {THREE.Vector3} sourceVector3 вектор исходящей точки
     * @param {THREE.Vector3} targetVector3 вектор целевой точки
     * @param {number} colorIndex индекс в цветовом массиве
     */
    static createLine(sourceVector3, targetVector3, colorIndex) {
        this.createMeshLine(sourceVector3, targetVector3, colorIndex);
        // this.createSimpleLine(sourceVector3, targetVector3, colorIndex);
    }

    /** Создает сферу по заданным координатам */
    static createSphere(x, y, z, colorIndex) {
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

    static createOctahedron(x, y, z, colorIndex) {
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

    static createArrow(sourceVector3, targetVector3, colorIndex = 3) {
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
        this.createLine(sourceVector3, croppedTargetVector3, colorIndex);

        // конус
        const coneMesh = this.getConeMesh(colorIndex);
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

    static getConeMesh(colorIndex = 3) {
        // конус
        // https://customizer.github.io/three.js-doc.ru/geometries/coneBufferGeometry.htm
        // https://threejs.org/docs/#api/en/geometries/ConeGeometry

        const coneRadius = 0.8; // 1.5;
        const coneHeight = 2; // 4;
        const coneRadiusSegments = 16;

        const coneGeometry = new THREE.ConeGeometry(
            coneRadius,
            coneHeight,
            coneRadiusSegments
        );

        const coneMaterial = new THREE.MeshPhongMaterial({
            // flatShading: true,
            // color: "#CA8",
            color: colors[colorIndex],
        });

        return new THREE.Mesh(coneGeometry, coneMaterial);
    }

    /**
     * Построение осей координат x, y, z
     * @param {number} oxAxisLength
     * @param {number} oyAxisLength
     * @param {number} oxAxisLength
     */
    static createAxis(oxAxisLength, oyAxisLength, ozAxisLength) {
        this.createArrow(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(oxAxisLength, 0, 0)
        );

        this.createArrow(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, oyAxisLength, 0)
        );

        this.createArrow(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, ozAxisLength)
        );

        this.createAxisText(oxAxisLength, oyAxisLength, ozAxisLength);
    }

    static getTextParameters(text, fontSize) {
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

    /**
     * Построение подписей осей координат x, y, z
     * @param {number} oxAxisLength
     * @param {number} oyAxisLength
     * @param {number} oxAxisLength
     */
    static createAxisText(oxAxisLength, oyAxisLength, ozAxisLength) {
        const fontSize = 5;

        const parameters_x = this.getTextParameters("x", fontSize);
        const parameters_y = this.getTextParameters("y", fontSize);
        const parameters_z = this.getTextParameters("z", fontSize);

        const label_x = new THREE.TextSprite(parameters_x);
        const label_y = new THREE.TextSprite(parameters_y);
        const label_z = new THREE.TextSprite(parameters_z);

        label_x.position.set(oxAxisLength + fontSize, 0, 0);
        label_y.position.set(0, oyAxisLength + fontSize, 0);
        label_z.position.set(0, 0, ozAxisLength + fontSize);

        graph.add(label_x);
        graph.add(label_y);
        graph.add(label_z);
    }

    static createLight() {
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
}

function clearScene() {
    scene.remove(graph);
    graph = new THREE.Object3D();
    scene.add(graph);
}

function setUpEventListeners() {
    /** Настройка GUI */
    function setUpGUI() {
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

        // let loader = new THREE.TextureLoader();
        // loader.load("assets/stroke.png", function (texture) {
        //     strokeTexture = texture;
        //     init();
        // });
    }

    /** Обработка изменения размера экрана */
    function onWindowResize() {
        let w = container.clientWidth;
        let h = container.clientHeight;

        let aspect = w / h;

        camera.left = (-frustumSize * aspect) / 2;
        camera.right = (frustumSize * aspect) / 2;
        camera.top = frustumSize / 2;
        camera.bottom = -frustumSize / 2;

        camera.updateProjectionMatrix();

        renderer.setSize(w, h);

        resolution.set(w, h);
    }

    window.addEventListener("load", setUpGUI);
    window.addEventListener("resize", onWindowResize);
}

function init() {
    // console.log(jsonGraphData);

    const graphData = JSON.parse(jsonGraphData);
    const algoView = new AlgoView(graphData);

    GraphicObjects.createLight();
    GraphicObjects.createAxis(
        algoView.oxAxisLength,
        algoView.oyAxisLength,
        algoView.ozAxisLength
    );

    scene.position.set(
        (10 - algoView.graph.size.x) / 2,
        (10 - algoView.graph.size.y) / 2,
        (10 - algoView.graph.size.z) / 2
    );

    // createLight();
    // createArrowsTest();
    // createAxisText();
}

function createArrowsTest() {
    const n = 20;
    const l = 30;

    xMaxPos = l;
    yMaxPos = l;
    zMaxPos = l;

    const v0 = new THREE.Vector3(0, 0, 0);

    // arrows
    for (let i = 0; i < n; i++) {
        const a = ((Math.PI * 2) / n) * i;
        const x = l * Math.sin(a);
        const y = l * Math.cos(a);

        GraphicObjects.createArrow(v0, new THREE.Vector3(x, y, 40));
    }

    // lines
    {
        let line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(0, 0, 0));
        line.vertices.push(new THREE.Vector3(l, 0, 0));
        GraphicObjects.makeLineByGeo(line, 6);

        line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(0, 0, 0));
        line.vertices.push(new THREE.Vector3(0, l, 0));
        GraphicObjects.makeLineByGeo(line, 6);

        line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(0, 0, 0));
        line.vertices.push(new THREE.Vector3(0, 0, l));
        GraphicObjects.makeLineByGeo(line, 6);

        //

        line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(l, 0, 0));
        line.vertices.push(new THREE.Vector3(l, l, 0));
        GraphicObjects.makeLineByGeo(line, 6);

        line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(l, 0, 0));
        line.vertices.push(new THREE.Vector3(l, 0, l));
        GraphicObjects.makeLineByGeo(line, 6);

        //

        line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(0, l, 0));
        line.vertices.push(new THREE.Vector3(l, l, 0));
        GraphicObjects.makeLineByGeo(line, 6);

        line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(0, l, 0));
        line.vertices.push(new THREE.Vector3(0, l, l));
        GraphicObjects.makeLineByGeo(line, 6);

        //

        line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(0, 0, l));
        line.vertices.push(new THREE.Vector3(0, l, l));
        GraphicObjects.makeLineByGeo(line, 6);

        line = new THREE.Geometry();
        line.vertices.push(new THREE.Vector3(0, 0, l));
        line.vertices.push(new THREE.Vector3(l, 0, l));
        GraphicObjects.makeLineByGeo(line, 6);
    }
}

function render() {
    requestAnimationFrame(render);
    controls.update();

    if (params.autoRotate) {
        graph.rotation.y += 0.25 * clock.getDelta();
    }

    renderer.render(scene, camera);
}

setUpEventListeners();
init();
render();
