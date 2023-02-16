"use strict";

const CameraTypes = {
    perspective: "Perspective",
    orthographic: "Orthographic",
};

const colors = [
    0xed6a5a, 0xf4f1bb, 0x9bc1bc, 0x5ca4a9, 0xe6ebe0, 0xf0b67f, 0xfe5f55,
    0xd6d1b1, 0xc7efcf, 0xeef5db, 0x50514f, 0xf25f5c, 0xffe066, 0x247ba0,
    0x70c1b3,
];

class Params {
    constructor() {
        this.pause = false;
        this.autoRotate = false;
        this.lineWidth = 5;
        this.cameraType = CameraTypes.perspective;
    }
}

class AlgoViewСonfiguration {
    constructor() {
        this.params = new Params();
        this.configuringThreeJS();
        // this.setGraphRebuildCallback(function () {}); // устанавливаем пустую функцию
        this.setControllerContext(123);

        this.setupEventListeners();
    }

    /**
     * Функция установски коллбека для обновления графа. Требуется
     * так как иначе не получится связать GUI с тонкой перестройкой графа.
     * @param {function} func - новая функция коллбека.
     */
    // setGraphRebuildCallback(func) {
    //     this.graphRebuildCallback = func;
    //     console.log("new graphRebuildCallback - ", this.graphRebuildCallback);
    // }

    setControllerContext(controllerContext) {
        this.controllerContext = controllerContext;
        console.log("new controllerContext - ", this.controllerContext);
    }

    configuringThreeJS() {
        this.container = document.getElementById("container");

        this.scene = new THREE.Scene();

        this.camera = this.createCamera();
        this.camera.position.set(100, 40, 20);
        this.frustumSize = 1000;

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.controls = new THREE.OrbitControls(
            this.camera,
            this.renderer.domElement
        );
        this.clock = new THREE.Clock();

        this.resolution = new THREE.Vector2(
            window.innerWidth,
            window.innerHeight
        );

        this.graph = new THREE.Object3D();
        this.scene.add(this.graph);

        this.graphRotationY = 0;
        this.updateGraphRotationY();
    }

    createCamera() {
        if (this.params.cameraType == CameraTypes.perspective) {
            return new THREE.PerspectiveCamera(
                60,
                window.innerWidth / window.innerHeight,
                0.1,
                400
            );
        } else {
            return new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000);
        }
    }

    // updateCamera() {
    //     // this.camera.remove();
    //     this.camera = this.createCamera();

    //     this.controls = new THREE.OrbitControls(
    //         this.camera,
    //         this.renderer.domElement
    //     );

    //     this.controls.update();
    // }

    updateGraphRotationY() {
        this.graph.rotation.y = this.graphRotationY;
    }

    rotateGraphByClock() {
        this.graphRotationY += 0.25 * this.clock.getDelta();
        this.updateGraphRotationY();
    }

    /** Настройка GUI */
    setupGUI() {
        this.gui = new dat.GUI();
        const controllerContextTrans = this.controllerContext;
        const rebuildSceneCallback = function () {
            controllerContextTrans.rebuildScene();
        };

        const resetCameraCallback = function () {
            controllerContextTrans.setNewCamera();
        };

        this.gui
            .add(this.params, "lineWidth", 1, 15)
            .name("Line width")
            .onChange(rebuildSceneCallback);

        // this.gui
        //     .add(this.params, "cameraType", [
        //         CameraTypes.perspective,
        //         CameraTypes.orthographic,
        //     ])
        //     .name("Camera type")
        //     .onChange(resetCameraCallback);

        this.gui
            .add(this.params, "autoRotate")
            .name("auto rotate")
            .onChange(function () {
                config.clock.getDelta();
            });

        this.gui
            .add(this.controllerContext, "rebuildScene")
            .name("rebuild scene"); // .onChange(rebuildSceneCallback);
    }

    /** Обработка изменения размера экрана */
    onWindowResize() {
        if ((this.params.cameraType = CameraTypes.perspective)) return;

        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        const aspect = w / h;

        this.camera.left = (-this.frustumSize * aspect) / 2;
        this.camera.right = (this.frustumSize * aspect) / 2;
        this.camera.bottom = -this.frustumSize / 2;
        this.camera.top = this.frustumSize / 2;

        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
        this.resolution.set(w, h);
    }

    setupEventListeners() {
        // window.addEventListener("load", this.setupGUI());
        window.addEventListener("resize", this.onWindowResize());
    }

    clearScene() {
        this.scene.remove(this.graph);
        this.graph = new THREE.Object3D();
        this.scene.add(this.graph);

        this.updateGraphRotationY();
    }

    renderFrame() {
        // console.log("render frame");
        // const startTime = performance.now();

        this.controls.update();
        this.renderer.render(this.scene, this.camera);

        // const startEnd = performance.now();
        // const renderTime = startEnd - startTime;
        // console.log(`render frame fps = ${1000 / renderTime} ms`);
        // return renderTime;
    }
}

const config = new AlgoViewСonfiguration();

/** Модель одной вершины. */
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
    }
}

/** Модель одной дуги. */
class Edge {
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
    }
}

/** Модель графа, состоящего из вершин и дуг. */
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

/** Набор инструментов создания графических объектов. */
class GraphicObjects {
    static createMeshLineByGeo(geo, colorIndex) {
        const meshLine = new MeshLine();
        meshLine.setGeometry(geo);

        const material = new MeshLineMaterial({
            useMap: false,
            color: new THREE.Color(colors[colorIndex]),
            opacity: 1,
            resolution: config.resolution,
            sizeAttenuation: false,
            lineWidth: config.params.lineWidth,
        });

        const mesh = new THREE.Mesh(meshLine.geometry, material);
        config.graph.add(mesh);
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
            resolution: config.resolution,
            sizeAttenuation: false,
            lineWidth: config.params.lineWidth,
        });

        const mesh = new THREE.Mesh(meshLine.geometry, material);
        config.graph.add(mesh);
    }

    /** супер простая линия если понадобится */
    static createSimpleLine(sourceVector3, targetVector3, colorIndex) {
        const geometry = new THREE.Geometry();
        geometry.vertices.push(sourceVector3);
        geometry.vertices.push(targetVector3);

        const material = new THREE.LineBasicMaterial({ color: 0x000000 });
        const line = new THREE.Line(geometry, material);

        config.graph.add(line);
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
        config.graph.add(mesh);
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
        config.graph.add(mesh);
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
        config.graph.add(cone);
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

        config.graph.add(label_x);
        config.graph.add(label_y);
        config.graph.add(label_z);
    }

    static createLight() {
        const color = 0xffffff;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(0, 10, 2);
        light.target.position.set(-5, 0, 0);
        config.graph.add(light);
        config.graph.add(light.target);

        // https://www.youtube.com/watch?v=T6PhV4Hz0u4
        const ambientIntensity = 0.2;
        const ambientLight = new THREE.AmbientLight(color, ambientIntensity);
        config.graph.add(ambientLight);
    }
}

/** Модель загрузки данных. */
class DataLoader {
    static emptyGraphDataTemplate = { vertices: [], edges: [] };

    constructor() {
        this.graphData = this.emptyGraphDataTemplate;
    }

    loadGraphData() {
        // jsonGraphData загружена в html страничке
        this.graphData = JSON.parse(jsonGraphData);

        return this.graphData;
    }
}

/** Слой моделей и обработки данных в MVC.
 *
 * Содержит:
 * * обработанные данные графа. */
class Model {
    constructor() {
        const dataLoader = new DataLoader();
        this.graphData = dataLoader.loadGraphData();
        this.graph = new Graph(this.graphData);
    }
}

/** Слой представления в MVC.
 *
 * Содержит:
 * * графическое представление графа;
 * * отображение осей координат, названия осей;
 * * настройку освещения.
 */
class View {
    /**
     * @param {Model} modelContext - ссылка на слой модели, экземпляр класса `Model`.
     */
    constructor(modelContext) {
        this.modelContext = modelContext;

        this.updateSceneSize();
        this.setupSceneView();
        this.setupGraphView();
    }

    rebuildSceneObjects() {
        this.setupSceneView();
        this.setupGraphView();
    }

    /** Обновление размера сцены по осям */
    updateSceneSize() {
        const axisShift = 15;
        const graphSize = this.modelContext.graph.size;

        this.oxAxisLength = graphSize.x + axisShift;
        this.oyAxisLength = graphSize.y + axisShift;
        this.ozAxisLength = graphSize.z + axisShift;

        this.oxCenterOfGraph = (10 - graphSize.x) / 2;
        this.oyCenterOfGraph = (10 - graphSize.y) / 2;
        this.ozCenterOfGraph = (10 - graphSize.z) / 2;
    }

    /** Наполнение сцены светом, осями координат */
    setupSceneView() {
        GraphicObjects.createLight();
        GraphicObjects.createAxis(
            this.oxAxisLength,
            this.oyAxisLength,
            this.ozAxisLength
        );

        config.scene.position.set(
            this.oxCenterOfGraph,
            this.oyCenterOfGraph,
            this.ozCenterOfGraph
        );
    }

    /** Наполнение сцены 3D объктами, представляющими граф */
    setupGraphView() {
        this.modelContext.graph.vertices.forEach((vertex, _, __) =>
            this.buildVertexObject(vertex)
        );

        this.modelContext.graph.edges.forEach((edge, _, __) =>
            this.buildEdgeObject(edge)
        );
    }

    /**
     * Построение 3D объекта вершины на сцене.
     * @param {Vertex} vetrex - вершина, экземпляр класса `Vertex`.
     */
    buildVertexObject(vetrex) {
        switch (vetrex.type) {
            case "0": {
                GraphicObjects.createSphere(
                    vetrex.pos.x,
                    vetrex.pos.y,
                    vetrex.pos.z,
                    1
                );
                break;
            }
            case "1": {
                GraphicObjects.createOctahedron(
                    vetrex.pos.x,
                    vetrex.pos.y,
                    vetrex.pos.z,
                    2
                );
                break;
            }
            default: {
                GraphicObjects.createSphere(
                    vetrex.pos.x,
                    vetrex.pos.y,
                    vetrex.pos.z,
                    1
                );
                break;
            }
        }
    }

    /**
     * Построение 3D объекта ребра на сцене.
     * @param {Edge} edge - ребро, экземпляр класса `Edge`.
     */
    buildEdgeObject(edge) {
        GraphicObjects.createArrow(
            edge.sourceVertex.pos,
            edge.targetVertex.pos,
            6
        );
    }
}

/** Слой контроллера в MVC. */
class Controller {
    constructor(appManagerContext, viewContext) {
        this.appManagerContext = appManagerContext;
        this.viewContext = viewContext;

        // console.log("this.appManagerContext = ", this.appManagerContext);
    }

    rebuildScene() {
        if (!this.appManagerContext.isBuildDone()) return;

        config.clearScene();
        this.viewContext.rebuildSceneObjects();
        console.log("done rebuild");
    }

    setNewCamera() {
        if (!this.appManagerContext.isBuildDone()) return;

        config.updateCamera();
        console.log("done update camera");
    }

    autoRotateGraph() {
        config.rotateGraphByClock();
    }
}

class AppManager {
    constructor() {
        this.targetObj = {};
        this.buildStatus = "in build process";
        this.statusProxy = new Proxy(this.targetObj, {
            set: function (target, key, value) {
                console.log(`${key} set to ${value}`);
                target[key] = value;

                if (value == "done") {
                    config.setupGUI();
                }

                return true;
            },
        });
    }

    setDoneBuildStatus() {
        this.buildStatus = "done";
        this.statusProxy.newBuildStatus = "done";
    }

    isBuildDone() {
        return this.buildStatus == "done";
    }
}

class App {
    constructor() {
        this.appManager = new AppManager();
        this.model = new Model();
        this.view = new View(this.model);
        this.controller = new Controller(this.appManager, this.view);

        config.setControllerContext(this.controller);
        // this.appManager.setDoneBuildStatus();
        this.appManager.buildStatus = "done";
        config.setupGUI();
    }
}

// function renderLoopOld() {
//     requestAnimationFrame(renderLoopOld);
//     config.renderFrame();
// }

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const fps = 60;
const maxFrameTime = 1000 / fps;

async function renderLoop() {
    const startTime = performance.now();

    if (config.params.autoRotate) {
        app.controller.autoRotateGraph();
    }

    config.renderFrame();

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    if (renderTime < maxFrameTime - 1) {
        await sleep(maxFrameTime - renderTime);
    }

    // const endFrameTime = performance.now();
    // console.log("fps =", 1000 / (endFrameTime - startTime));
    requestAnimationFrame(renderLoop);
}

const app = new App();
renderLoop();

// class A{
//     constructor(){
//         this.x = 5
//     }

//     setX(newValue){
//         this.x = newValue
//     }
// }

// class B{
//     constructor(cl){
//         this.cl = cl
//     }

//     tryMethod(value){
//         this.cl.setX(value)
//     }
// }

// a = new A()
// b = new B(a)

// console.log("first:")
// console.log(a)
// console.log(b)

// a.setX(8)

// console.log("second:")
// console.log(a)
// console.log(b)

// b.tryMethod(10)

// console.log("3:")
// console.log(a)
// console.log(b)

// https://www.programiz.com/javascript/online-compiler/
