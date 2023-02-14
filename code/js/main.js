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
        this.autoRotate = false;

        this.lineWidth = 5;
        this.cameraType = CameraTypes.perspective;

        // this.autoUpdate = true;
        // this.update = function () {
        //     config.clearScene();
        //     initMVC();
        // };
        // this.rebuild = function () {
        //     // config.clearScene();
        //     config = new AlgoViewСonfiguration();
        //     initMVC();
        // };
    }
}

class AlgoViewСonfiguration {
    constructor() {
        this.params = new Params();
        this.configuringThreeJS();
        // this.gui = new dat.GUI();
        // this.setupEventListeners();
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

    /** Настройка GUI */
    setupGUI() {
        // this.gui
        //     .add(this.params, "lineWidth", 1, 20)
        //     .name("line width")
        //     .onChange(update);
        // this.gui
        //     .add(this.params, "cameraType", [
        //         CameraTypes.perspective,
        //         CameraTypes.orthographic,
        //     ])
        //     .onChange(update);
        // this.gui
        //     .add(this.params, "autoRotate")
        //     .name("auto rotate")
        //     .onChange(function () {
        //         config.clock.getDelta();
        //     });
        // this.gui.add(this.params, "update");
        // gui.add(params, "update");
        // gui.add(params, "axisLength", 40, 80).name("axis length").onChange(update);
        // gui.add(params, "autoUpdate").onChange(update);
        // let loader = new THREE.TextureLoader();
        // loader.load("assets/stroke.png", function (texture) {
        //     strokeTexture = texture;
        //     init();
        // });
    }

    setupEventListeners() {
        window.addEventListener("load", config.setupGUI);
        window.addEventListener("resize", config.onWindowResize);
    }

    clearScene() {
        this.scene.remove(this.graph);
        this.graph = new THREE.Object3D();
        this.scene.add(this.graph);
    }

    // updateAll() {
    //     if (params.autoUpdate) {
    //         this.clearScene();
    //         initMVC();
    //     }
    // }

    renderFrame() {
        console.log("in renderFrame");
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

let config = new AlgoViewСonfiguration();
console.log(config);

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
        const graphData = dataLoader.loadGraphData();
        this.graph = new Graph(graphData);
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

/** Слой контроллера в MVC. (пока пустой)*/
class Controller {
    constructor() {}
}

// function createArrowsTest() {
//     GraphicObjects.createLight();
//     GraphicObjects.createAxisText();
//     const n = 20;
//     const l = 30;

//     xMaxPos = l;
//     yMaxPos = l;
//     zMaxPos = l;

//     const v0 = new THREE.Vector3(0, 0, 0);

//     // arrows
//     for (let i = 0; i < n; i++) {
//         const a = ((Math.PI * 2) / n) * i;
//         const x = l * Math.sin(a);
//         const y = l * Math.cos(a);

//         GraphicObjects.createArrow(v0, new THREE.Vector3(x, y, 40));
//     }

//     // lines
//     {
//         let line = new THREE.Geometry();
//         line.vertices.push(new THREE.Vector3(0, 0, 0));
//         line.vertices.push(new THREE.Vector3(l, 0, 0));
//         GraphicObjects.makeLineByGeo(line, 6);

//         line = new THREE.Geometry();
//         line.vertices.push(new THREE.Vector3(0, 0, 0));
//         line.vertices.push(new THREE.Vector3(0, l, 0));
//         GraphicObjects.makeLineByGeo(line, 6);

//         line = new THREE.Geometry();
//         line.vertices.push(new THREE.Vector3(0, 0, 0));
//         line.vertices.push(new THREE.Vector3(0, 0, l));
//         GraphicObjects.makeLineByGeo(line, 6);

//         //

//         line = new THREE.Geometry();
//         line.vertices.push(new THREE.Vector3(l, 0, 0));
//         line.vertices.push(new THREE.Vector3(l, l, 0));
//         GraphicObjects.makeLineByGeo(line, 6);

//         line = new THREE.Geometry();
//         line.vertices.push(new THREE.Vector3(l, 0, 0));
//         line.vertices.push(new THREE.Vector3(l, 0, l));
//         GraphicObjects.makeLineByGeo(line, 6);

//         //

//         line = new THREE.Geometry();
//         line.vertices.push(new THREE.Vector3(0, l, 0));
//         line.vertices.push(new THREE.Vector3(l, l, 0));
//         GraphicObjects.makeLineByGeo(line, 6);

//         line = new THREE.Geometry();
//         line.vertices.push(new THREE.Vector3(0, l, 0));
//         line.vertices.push(new THREE.Vector3(0, l, l));
//         GraphicObjects.makeLineByGeo(line, 6);

//         //

//         line = new THREE.Geometry();
//         line.vertices.push(new THREE.Vector3(0, 0, l));
//         line.vertices.push(new THREE.Vector3(0, l, l));
//         GraphicObjects.makeLineByGeo(line, 6);

//         line = new THREE.Geometry();
//         line.vertices.push(new THREE.Vector3(0, 0, l));
//         line.vertices.push(new THREE.Vector3(l, 0, l));
//         GraphicObjects.makeLineByGeo(line, 6);
//     }
// }

function initMVC() {
    const model = new Model();
    const view = new View(model);
    const controller = new Controller();
}

function render() {
    requestAnimationFrame(render);
    config.renderFrame();

    // config.controls.update();
    // if (config.params.autoRotate) {
    //     config.graph.rotation.y += 0.25 * config.clock.getDelta();
    // }
    // config.renderer.render(config.scene, config.camera);
}

function main() {
    console.log("in main 1");
    initMVC();
    console.log("in main 2");
    render();
    console.log("in main 3");
}

main();
