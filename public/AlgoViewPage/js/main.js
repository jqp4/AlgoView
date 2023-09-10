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

        this.showGraphCharacteristics = true;
        this.showErrors = true;
        this.showWarnings = true;
        this.showSystemLoadInfo = true;

        /** уровень ярусно параллельной формы */
        this.level = 0;
        this.showLevel = true;

        this.defaultLineWidth = 2.5;
        this.lineWidth;
        this.axisLineWidth;
        this.setDefaultLineWidth();

        this.fpsRate = 30;
        this.cameraType = CameraTypes.perspective;
    }

    /** Обновляет ширину осевых линий */
    updateAxisLineWidth() {
        this.axisLineWidth = this.lineWidth * 1.6;
    }

    /**
     * Устанавливает новую ширину линий
     * @param {Number} newLineWidth
     */
    setLineWidth(newLineWidth) {
        this.lineWidth = newLineWidth;
        this.updateAxisLineWidth();
    }

    /** Устанавливает стандартную ширину линий */
    setDefaultLineWidth() {
        this.setLineWidth(this.defaultLineWidth);
    }
}

class AlgoViewConfiguration {
    constructor() {
        this.params = new Params();
        this.configuringThreeJS();
        this.setupEventListeners();
    }

    /**
     * Функция установки контекста контроллера для использования коллбеков обновления графа и вида.
     * Требуется так как иначе не получится связать GUI с тонкой перестройкой графа и вида.
     * @param {Controller} controllerContext - новая функция коллбека.
     */
    setControllerContext(controllerContext) {
        this.controllerContext = controllerContext;
        // console.log("new controllerContext - ", this.controllerContext);
    }

    configuringThreeJS() {
        this.container = document.getElementById("container");
        this.scene = new THREE.Scene();

        this.camera = this.createCamera();
        this.camera.position.set(90, 30, 90);
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
        const w = window.innerWidth;
        const h = window.innerHeight;
        const near = 1; // усечение минимальной видимости камеры (дальность)
        const far = 500; // усечение максимальной видимости камеры (дальность)

        if (this.params.cameraType == CameraTypes.perspective) {
            const fov = 60; // угол обзора

            return new THREE.PerspectiveCamera(fov, w / h, near, far);
        } else {
            const orthographicScale = 15; // масштаб

            return new THREE.OrthographicCamera(
                w / -orthographicScale,
                w / orthographicScale,
                h / orthographicScale,
                h / -orthographicScale,
                near,
                far
            );
        }
    }

    setYZView_old() {
        // https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
        // const w = 1920;
        // const h = 1080;
        // const fullWidth = w * 3;
        // const fullHeight = h * 2;
        // // A
        // camera.setViewOffset(fullWidth, fullHeight, w * 0, h * 0, w, h);
        // // B
        // camera.setViewOffset(fullWidth, fullHeight, w * 1, h * 0, w, h);
        // // C
        // camera.setViewOffset(fullWidth, fullHeight, w * 2, h * 0, w, h);
        // // D
        // camera.setViewOffset(fullWidth, fullHeight, w * 0, h * 1, w, h);
        // // E
        // camera.setViewOffset(fullWidth, fullHeight, w * 1, h * 1, w, h);
        // // F
        // camera.setViewOffset(fullWidth, fullHeight, w * 2, h * 1, w, h);
    }

    setXYView() {
        this.camera.position.set(0, 0, 100);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    setXZView() {
        this.camera.position.set(0, 100, 0);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    setYZView() {
        this.camera.position.set(100, 0, 0);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    updateCamera() {
        const cameraPosition = this.camera.position;
        this.camera = this.createCamera();
        this.camera.position.set(
            cameraPosition.x,
            cameraPosition.y,
            cameraPosition.z
        );

        this.controls = new THREE.OrbitControls(
            this.camera,
            this.renderer.domElement
        );
    }

    updateGraphRotationY() {
        this.graph.rotation.y = this.graphRotationY;
    }

    rotateGraphByClock() {
        this.graphRotationY += 0.25 * this.clock.getDelta();
        this.updateGraphRotationY();
    }

    /** Настройка GUI */
    setupGUI(graphInfo) {
        // https://stackoverflow.com/questions/38762124/how-to-add-folders-in-dat-gui

        this.gui = new dat.GUI();
        const folderViewSettins = this.gui.addFolder("View Settins");
        const folderCameraControls = this.gui.addFolder("Camera Controls");
        const folderSceneControls = this.gui.addFolder("Scene Controls");
        const folderLevelControls = this.gui.addFolder("Parallel Form");

        folderCameraControls.open();
        folderLevelControls.open();

        const thisContextTrans = this;
        const controllerContextTrans = this.controllerContext;

        /**     ================
         *           Funcs
         *      ================
         */

        let prevLineWidth = this.params.lineWidth;

        const changeLineWidth = function () {
            let newLineWidth = thisContextTrans.params.lineWidth;

            if (newLineWidth == null || typeof newLineWidth != "number") {
                thisContextTrans.params.setDefaultLineWidth();
                rebuildSceneCallback();
                return;
            }

            thisContextTrans.params.setLineWidth(
                // Math.round(newLineWidth * 2) / 2
                Math.round(newLineWidth)
            );

            if (thisContextTrans.params.lineWidth != prevLineWidth) {
                prevLineWidth = thisContextTrans.params.lineWidth;
                rebuildSceneCallback();
            }
        };

        const rebuildSceneCallback = function () {
            controllerContextTrans.rebuildScene();
        };

        const resetCameraCallback = function () {
            controllerContextTrans.setNewCamera();
        };

        const changeCharacteristicsBlock = function () {
            InfoBlockController.changeCharacteristicsBlock(graphInfo);
        };

        const changeFPSInfoBlock = function () {
            if (thisContextTrans.params.showSystemLoadInfo == false) {
                InfoBlockController.changeFPSInfoBlock("", "");
            }
        };

        const maxLevel = graphInfo.characteristics.critical_path_length;

        const levelInc = function () {
            if (thisContextTrans.params.level < maxLevel) {
                thisContextTrans.params.level += 1;
            }

            levelCounter.setValue(thisContextTrans.params.level);
        };

        const levelDec = function () {
            if (thisContextTrans.params.level > 0) {
                thisContextTrans.params.level -= 1;
            }

            levelCounter.setValue(thisContextTrans.params.level);
        };

        const levelControllerObj = { levelInc: levelInc, levelDec: levelDec };
        let prevLevelValue;

        const updateLevelValue = function () {
            const floatLevelValue = thisContextTrans.params.level;

            if (floatLevelValue < 0 || typeof floatLevelValue != "number") {
                thisContextTrans.params.level = 0;
            } else if (floatLevelValue > maxLevel) {
                thisContextTrans.params.level = maxLevel;
            } else if (floatLevelValue % 1 != 0) {
                thisContextTrans.params.level = Math.round(floatLevelValue);
            }

            if (thisContextTrans.params.level != prevLevelValue) {
                prevLevelValue = thisContextTrans.params.level;
                rebuildSceneCallback();
            }
        };

        /**     ================
         *        View Settins
         *      ================
         */

        folderViewSettins.add(this.params, "fpsRate", 24, 100).name("FPS rate");

        folderViewSettins
            .add(this.params, "lineWidth", 1, 6)
            .name("Line width")
            .onChange(changeLineWidth);

        folderViewSettins
            .add(this.params, "showGraphCharacteristics")
            .name("Show graph info")
            .onChange(changeCharacteristicsBlock);

        folderViewSettins
            .add(this.params, "showErrors")
            .name("Show errors")
            .onChange(changeCharacteristicsBlock);

        folderViewSettins
            .add(this.params, "showWarnings")
            .name("Show warnings")
            .onChange(changeCharacteristicsBlock);

        folderViewSettins
            .add(this.params, "showSystemLoadInfo")
            .name("Show FPS")
            .onChange(changeFPSInfoBlock);

        /**     ===================
         *        Camera Controls
         *      ===================
         */

        folderCameraControls
            .add(this.params, "cameraType", [
                CameraTypes.perspective,
                CameraTypes.orthographic,
            ])
            .name("Camera type")
            .onChange(resetCameraCallback);

        folderCameraControls.add(this, "setXYView").name("Set XY view");
        folderCameraControls.add(this, "setXZView").name("Set XZ view");
        folderCameraControls.add(this, "setYZView").name("Set YZ view");

        /**     ==================
         *        Scene Controls
         *      ==================
         */

        folderSceneControls
            .add(this.params, "autoRotate")
            .name("Auto rotate")
            .onChange(function () {
                config.clock.getDelta();
            });

        folderSceneControls.add(this.params, "pause").name("Stop rendering");

        folderSceneControls
            .add(this.controllerContext, "rebuildScene")
            .name("Rebuild"); // .onChange(rebuildSceneCallback);

        /**     ==================
         *     Tiered-Parallel Form
         *      ==================
         */

        folderLevelControls
            .add(this.params, "showLevel")
            .name("Show Level")
            .onChange(rebuildSceneCallback);

        const levelCounter = folderLevelControls
            .add(this.params, "level", 0, maxLevel)
            .name("Level")
            .onChange(updateLevelValue);

        folderLevelControls.add(levelControllerObj, "levelInc").name("Level +");
        folderLevelControls.add(levelControllerObj, "levelDec").name("Level -");
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
        // window.addEventListener("resize", this.onWindowResize());
    }

    clearScene() {
        this.scene.remove(this.graph);
        this.graph = new THREE.Object3D();
        this.scene.add(this.graph);

        this.updateGraphRotationY();
    }

    renderFrame() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

const config = new AlgoViewConfiguration();

/** Модель одной вершины. */
class Vertex {
    /**
     *
     * @param {Number} id
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     * @param {string} type
     * @param {string} info
     * @param {Number} level
     */
    constructor(id, x, y, z, type, info, level) {
        this.id = id;
        this.pos = new THREE.Vector3(x, y, z);
        this.type = type;
        this.info = info;
        this.level = level;
    }
}

/** Модель одной дуги. */
class Edge {
    /**
     *
     * @param {Number} id
     * @param {Vertex} sourceVertex
     * @param {Vertex} targetVertex
     * @param {string} type
     * @param {Number} level
     * @param {boolean} requiresBending
     */
    constructor(id, sourceVertex, targetVertex, type, level, requiresBending) {
        this.id = id;
        this.sourceVertex = sourceVertex;
        this.targetVertex = targetVertex;
        this.type = type;
        this.level = level;
        this.requiresBending = requiresBending;
    }
}

/** Модель графа, состоящего из вершин и дуг. */
class Graph {
    vertices = new Map();
    edges = new Map();

    /** Сдвиг от осей */
    #axisShift = 8;

    /** Масштаб */
    #scale = 10;

    constructor(graphData) {
        this.graphData = graphData;

        this.createVertices();
        this.createEdges();

        this.size = this.getSize();
    }

    /**
     * Преобразование координат
     * @param {Number} value
     * @returns преобразованное значение
     */
    coordinateTransform(value, isVertexShifted = false) {
        return (
            this.#axisShift +
            (isVertexShifted ? value + 0.5 : value) * this.#scale
        );
    }

    createVertices() {
        for (let i = 0; i < this.graphData.vertices.length; i++) {
            const element = this.graphData.vertices[i];

            // const isVertexShifted = this.checkVertexForRequiredShift(
            //     element.coordinates[0],
            //     element.coordinates[1],
            //     element.coordinates[2]
            // );

            const isVertexShifted = element.info == "extra";

            const vertex = new Vertex(
                element.id,
                this.coordinateTransform(
                    element.coordinates[0],
                    isVertexShifted
                ),
                this.coordinateTransform(
                    element.coordinates[1],
                    isVertexShifted
                ),
                this.coordinateTransform(
                    element.coordinates[2],
                    isVertexShifted
                ),
                element.type, // type: "0" / "1" / ...
                element.info, // info: "normal" / "extra"
                element.level // level: 1, 2, 3, ...
            );

            this.vertices.set(element.id, vertex);
        }
    }

    /**
     * Проверка на необходимость сдвига вершины
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     */
    // checkVertexForRequiredShift(x, y, z) {
    //     let answer = false;

    //     this.vertices.forEach(function (vertex, id, map) {
    //         if (answer == true) return;
    //         console.log(vertex.pos.x, x);

    //         if (vertex.pos.x == x && vertex.pos.y == y && vertex.pos.z == z) {
    //             answer = true;
    //         }
    //     });

    //     return answer;
    // }

    createEdges() {
        for (let i = 0; i < this.graphData.edges.length; i++) {
            const element = this.graphData.edges[i];

            const sourceVertex = this.vertices.get(element.sourceVertexId);
            const targetVertex = this.vertices.get(element.targetVertexId);

            const requiresBending = this.checkEdgeForRequiredBending(
                sourceVertex,
                targetVertex
            );

            const edge = new Edge(
                element.id,
                sourceVertex,
                targetVertex,
                element.type,
                element.level,
                requiresBending
            );

            this.edges.set(element.id, edge);
        }
    }

    /**
     * Проверка на необходимость изгиба дуги
     * @param {Vertex} sourceVertex начало дуги
     * @param {Vertex} targetVertex конец дуги
     */
    checkEdgeForRequiredBending(sourceVertex, targetVertex) {
        let answer = false;
        const context = this;

        this.vertices.forEach(function (verifiableVertex, id, map) {
            if (answer == true) return;

            const isVertexCrossed = context.checkVertexIntersection(
                sourceVertex,
                targetVertex,
                verifiableVertex
            );

            if (isVertexCrossed) answer = true;
        });

        return answer;
    }

    /**
     * Проверка пересечения дуги и проверяемой точки
     * @param {Vertex} sourceVertex начало дуги
     * @param {Vertex} targetVertex конец дуги
     * @param {Vertex} verifiableVertex проверяемая точка
     */
    checkVertexIntersection(sourceVertex, targetVertex, verifiableVertex) {
        // Проверка через линейную зависимость координат

        let kx =
            (verifiableVertex.pos.x - sourceVertex.pos.x) /
            (targetVertex.pos.x - sourceVertex.pos.x);

        let ky =
            (verifiableVertex.pos.y - sourceVertex.pos.y) /
            (targetVertex.pos.y - sourceVertex.pos.y);

        let kz =
            (verifiableVertex.pos.z - sourceVertex.pos.z) /
            (targetVertex.pos.z - sourceVertex.pos.z);

        if (kx <= 0 || kx >= 1) return false;
        if (ky <= 0 || ky >= 1) return false;
        if (kz <= 0 || kz >= 1) return false;

        // console.log("edge: ", sourceVertex.id, targetVertex.id);
        // console.log("verifiableVertex: ", verifiableVertex.id);
        // console.log("kx = ", kx);
        // console.log("ky = ", ky);
        // console.log("kz = ", kz);
        // console.log("");

        const isEqual = function (a, b) {
            return isNaN(a) || isNaN(b) || a - b < 1e-4;
        };

        return isEqual(kx, ky) && isEqual(ky, kz);
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

/** Модель с данными о графе, предупреждениями и ошибками*/
class GraphInfo {
    characteristics = new Object();
    warnings = new Array();
    errors = new Array();

    /** Маркеры наличия проблем */
    characteristicsIsEmpty = true;
    thereAreWarnings = false;
    thereAreErrors = false;

    constructor(graphData) {
        this.graphData = graphData;

        this.fillInCharacteristics();
        this.fillInWarnings();
        this.fillInErrors();
    }

    fillInCharacteristics() {
        // characteristics:
        //      vertex_num
        //      edge_num
        //      critical_path_length
        //      parallel_form_width

        for (const property in this.graphData.characteristics) {
            const value = this.graphData.characteristics[property];
            this.characteristics[property] = value;

            if (this.characteristicsIsEmpty && value != 0) {
                this.characteristicsIsEmpty = false;
            }
        }
    }

    fillInWarnings() {
        if (this.graphData.warnings == null) {
            console.log("graphData.warnings is null");
            return;
        }

        for (let i = 0; i < this.graphData.warnings.length; i++) {
            const warningStr = this.graphData.warnings[i];
            this.warnings.push(warningStr);
        }

        if (this.warnings.length != 0) {
            this.thereAreWarnings = true;
        }
    }

    fillInErrors() {
        if (this.graphData.errors == null) {
            console.log("graphData.errors is null");
            return;
        }

        for (let i = 0; i < this.graphData.errors.length; i++) {
            const errorStr = this.graphData.errors[i];
            this.errors.push(errorStr);
        }

        if (this.errors.length != 0) {
            this.thereAreErrors = true;
        }
    }
}

/** Набор инструментов создания графических объектов. */
class GraphicObjects {
    static #createMeshLineByGeo(lineGeometry, lineWidth, colorIndex) {
        const meshLine = new MeshLine();
        meshLine.setGeometry(lineGeometry);

        const material = new MeshLineMaterial({
            useMap: false,
            color: new THREE.Color(colors[colorIndex]),
            opacity: 1,
            resolution: config.resolution,
            sizeAttenuation: false,
            lineWidth: lineWidth,
        });

        const mesh = new THREE.Mesh(meshLine.geometry, material);
        config.graph.add(mesh);
    }

    /** супер простая линия если понадобится */
    static #createSimpleStraightLine(sourceVector3, targetVector3, colorIndex) {
        const geometry = new THREE.Geometry();
        geometry.vertices.push(sourceVector3);
        geometry.vertices.push(targetVector3);

        const material = new THREE.LineBasicMaterial({ color: 0x000000 });
        const line = new THREE.Line(geometry, material);

        config.graph.add(line);
    }

    static #createStraightMeshLine(
        sourceVector3,
        targetVector3,
        lineWidth,
        colorIndex
    ) {
        const lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(sourceVector3);
        lineGeometry.vertices.push(targetVector3);

        this.#createMeshLineByGeo(lineGeometry, lineWidth, colorIndex);
    }

    /** Создает прямую стрелку по двум векторам */
    static createStraightArrow(
        sourceVector3,
        targetVector3,
        lineWidth,
        colorIndex
    ) {
        /** Половина высоты конуса у стрелки + радиус большого шара */
        const arrowShiftLength = 1.8 / 2 + 1.8;

        const arrowVector3 = new THREE.Vector3().subVectors(
            targetVector3,
            sourceVector3
        );

        /** Получаем отступ от целевой вершины для создания острия стрелки */
        const shiftVector3 = new THREE.Vector3()
            .copy(arrowVector3)
            .normalize() // нормализация (приведение к вектору длины 1)
            .multiplyScalar(arrowShiftLength); // + умножение на скаляр

        const croppedTargetVector3 = new THREE.Vector3().subVectors(
            targetVector3,
            shiftVector3
        );

        // линия
        this.#createStraightMeshLine(
            sourceVector3,
            croppedTargetVector3,
            lineWidth,
            colorIndex
        );

        // конус
        this.#createCone(croppedTargetVector3, targetVector3, colorIndex);
    }

    /** https://www.notion.so/2ad0489562bc43b8a76345d4feda84ba */
    static #getTransitionMatrixToInitialBasis(arrowVector3) {
        /** Вектора нового базиса (соотв изначальному графу) */
        const n1 = new THREE.Vector3().copy(arrowVector3).normalize();
        const n2 = new THREE.Vector3();
        const n3 = new THREE.Vector3();

        /** функция векторного произведения векторов */
        function cross(a, b) {
            const rx = a.y * b.z - a.z * b.y;
            const ry = a.z * b.x - a.x * b.z;
            const rz = a.x * b.y - a.y * b.x;
            return new THREE.Vector3(rx, ry, rz);
        }

        // геометрически рассчитываем второй базисный вектор n2

        if (n1.x != 0 && n1.y == 0 && n1.z == 0) {
            // ось OX
            // console.log("ось OX");
            n2.set(0, -1, -1).normalize();
        } else if (n1.x == 0 && n1.y != 0 && n1.z == 0) {
            // ось OY
            // console.log("ось OY");
            n2.set(-1, 0, -1).normalize();
        } else if (n1.x == 0 && n1.y == 0 && n1.z != 0) {
            // ось OZ
            // console.log("ось OZ");
            n2.set(-1, -1, 0).normalize();
        } else if (n1.x != 0 && n1.y != 0 && n1.z == 0) {
            // плоскость OXY
            // console.log("плоскость OXY");
            n2.set(0, 0, -1);
        } else if (n1.x == 0 && n1.y != 0 && n1.z != 0) {
            // плоскость OYZ
            // console.log("плоскость OYZ");
            n2.set(-1, 0, 0);
        } else if (n1.x != 0 && n1.y == 0 && n1.z != 0) {
            // плоскость OXZ
            // console.log("плоскость OXZ");
            n2.set(0, -1, 0);
        } else {
            // Общий случай
            // console.log("Общий случай");

            const n1x = Math.abs(n1.x);
            const n1y = Math.abs(n1.y);
            const n1z = Math.abs(n1.z);

            const beta = Math.PI / 2 - Math.asin(n1y / 1);
            const b = n1y / Math.tan(beta);

            const gamma = Math.atan(n1z / n1x);
            const n2x = b * Math.cos(gamma) * Math.sign(n1.x);
            const n2z = b * Math.sin(gamma) * Math.sign(n1.z);

            // console.log("beta =", (beta * 180) / Math.PI);
            // console.log("b =", b);
            // console.log("gamma =", (gamma * 180) / Math.PI);

            n2.set(-n2x, n1.y, -n2z).normalize();
        }

        // рассчитываем третий базисный вектор n3
        n3.copy(cross(n1, n2));

        // console.log("n1:", n1.x, n1.y, n1.z);
        // console.log("n2:", n2.x, n2.y, n2.z);
        // console.log("n3:", n3.x, n3.y, n3.z);
        // console.log("\n");

        const M = [
            [n1.x, n2.x, n3.x],
            [n1.y, n2.y, n3.y],
            [n1.z, n2.z, n3.z],
        ];

        return M;
    }

    /** Создает кривую стрелку по двум векторам */
    static createCurvedArrow(
        sourceVector3,
        targetVector3,
        lineWidth,
        colorIndex
    ) {
        /** Половина высоты конуса у стрелки + радиус большого шара */
        const arrowShiftLength = 1.8 / 2 + 1.8;

        const arrowVector3 = new THREE.Vector3().subVectors(
            targetVector3,
            sourceVector3
        );

        /** длина вектора. Рассмотрим вектор AB{len, 0, 0},
         *  исходящий из начала координат */
        const len = sourceVector3.distanceTo(targetVector3);

        /** радиус окружности
         *  k = 0.5 -- полуокружность
         *  k = 1.0 -- 1/6 окружности */
        const r = len * 1.1;

        /** координаты центра окружности */
        const x0 = len / 2;
        const y0 = -Math.sqrt(Math.pow(r, 2) - Math.pow(x0, 2));

        const x = (t) => x0 + r * Math.cos(t);
        const y = (t) => y0 + r * Math.sin(t);

        /** границы параметра */
        const tArrowShift = arrowShiftLength / r; // tArrowShift = 2pi * shiftLength / 2piR
        const t0 = Math.acos(x0 / r) + tArrowShift; // находится некотором удалении от точки B
        const t1 = Math.PI - Math.acos(x0 / r); // находится в точке A

        /** количество кусочков на которое будет разбита кривая */
        const n = Math.ceil((t1 - t0) * r * 3);
        const tStep = (t1 - t0) / n;

        const mTrans = this.#getTransitionMatrixToInitialBasis(arrowVector3);
        const lineGeometry = new Float32Array((n + 1) * 3);

        for (let j = 0; j <= n; j += 1) {
            const t = t0 + tStep * j;
            const _x = x(t);
            const _y = y(t);

            lineGeometry[j * 3] =
                sourceVector3.x + mTrans[0][0] * _x + mTrans[0][1] * _y;
            lineGeometry[j * 3 + 1] =
                sourceVector3.y + mTrans[1][0] * _x + mTrans[1][1] * _y;
            lineGeometry[j * 3 + 2] =
                sourceVector3.z + mTrans[2][0] * _x + mTrans[2][1] * _y;
        }

        // линия
        this.#createMeshLineByGeo(lineGeometry, lineWidth, colorIndex);

        const coneLocation = new THREE.Vector3(
            lineGeometry[0],
            lineGeometry[1],
            lineGeometry[2]
        );

        // конус
        this.#createCone(coneLocation, targetVector3, colorIndex);
    }

    /** Создает конус по заданным координатам и направдлению вершины конуса */
    static #createCone(locationVector3, targetVector3, colorIndex) {
        const coneMesh = this.#getConeMesh(colorIndex);
        coneMesh.rotation.x = Math.PI / 2;

        const cone = new THREE.Object3D();
        cone.add(coneMesh);
        cone.position.set(
            locationVector3.x,
            locationVector3.y,
            locationVector3.z
        );

        cone.lookAt(targetVector3.x, targetVector3.y, targetVector3.z);
        config.graph.add(cone);
    }

    /** Возвращает THREE.Mesh для конуса */
    static #getConeMesh(colorIndex = 3) {
        // https://threejs.org/docs/#api/en/geometries/ConeGeometry

        const coneRadius = 0.6;
        const coneHeight = 1.8;
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
     * @param {Number} oxAxisLength
     * @param {Number} oyAxisLength
     * @param {Number} oxAxisLength
     */
    static createAxis(oxAxisLength, oyAxisLength, ozAxisLength) {
        this.createStraightArrow(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(oxAxisLength, 0, 0),
            config.params.axisLineWidth,
            3
        );

        this.createStraightArrow(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, oyAxisLength, 0),
            config.params.axisLineWidth,
            3
        );

        this.createStraightArrow(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, ozAxisLength),
            config.params.axisLineWidth,
            3
        );

        this.#createAxisText(oxAxisLength, oyAxisLength, ozAxisLength);
    }

    static #getTextParameters(text, fontSize, color = "#000000") {
        return {
            alignment: "center",
            backgroundColor: "rgba(0,0,0,0)",
            color: color,
            fontFamily: "sans-serif",
            fontSize: fontSize,
            fontStyle: "normal",
            fontVariant: "normal",
            fontWeight: "normal",
            lineGap: 0.25,
            padding: 0.5,
            strokeColor: "#000000",
            strokeWidth: 0.02,
            text: text,
        };
    }

    /**
     * Построение подписей осей координат x, y, z
     * @param {Number} oxAxisLength
     * @param {Number} oyAxisLength
     * @param {Number} oxAxisLength
     */
    static #createAxisText(oxAxisLength, oyAxisLength, ozAxisLength) {
        const fontSize = 5;

        const parameters_x = this.#getTextParameters("x", fontSize);
        const parameters_y = this.#getTextParameters("y", fontSize);
        const parameters_z = this.#getTextParameters("z", fontSize);

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

    /**
     * Построение текста на координатах
     * @param {String} text
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     * @param {Number} colorIndex
     */
    static createCustomText(text, x, y, z, colorIndex) {
        const fontSize = 4;
        const colorStr = "#" + colors[colorIndex].toString(16);
        const parameters = this.#getTextParameters(text, fontSize, colorStr);
        const label = new THREE.TextSprite(parameters);

        label.position.set(x, y, z);
        config.graph.add(label);
    }

    /** Создание освещения на сцене. */
    static createLight() {
        const color = 0xffffff;
        const intensity1 = 0.65;
        const intensity2 = 0.5;
        const target = new THREE.Vector3(-5, -10, -2);
        const light = new THREE.Object3D();

        const directionalLight1 = new THREE.DirectionalLight(color, intensity1);
        directionalLight1.target.position.copy(target);
        light.add(directionalLight1);
        light.add(directionalLight1.target);

        const directionalLight2 = new THREE.DirectionalLight(color, intensity2);
        directionalLight2.target.position.copy(target).multiplyScalar(-1);
        light.add(directionalLight2);
        light.add(directionalLight2.target);

        // https://www.youtube.com/watch?v=T6PhV4Hz0u4
        // Cумма всего света в каждой точке должна быть не более 1
        const ambientIntensity = 1 - Math.max(intensity1, intensity2);
        const ambientLight = new THREE.AmbientLight(color, ambientIntensity);
        light.add(ambientLight);

        config.graph.add(light);
        return light;
    }

    /** Создает куб по заданным координатам */
    static createCube(x, y, z, colorIndex) {
        const cubeSize = 2.5;
        const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

        const cubeMat = new THREE.MeshPhongMaterial({
            color: colors[colorIndex],
        });

        const mesh = new THREE.Mesh(cubeGeo, cubeMat);
        mesh.position.set(x, y, z);
        config.graph.add(mesh);
    }

    /** Создает сферу по заданным координатам */
    static createSphere(x, y, z, colorIndex) {
        const sphereRadius = 1.5;
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

    /** Создает тетраэдр по заданным координатам */
    static createTetrahed(x, y, z, colorIndex, texture = null) {
        const tetrahedronRadius = 2;
        const tetrahedronGeo = new THREE.TetrahedronGeometry(tetrahedronRadius);

        const tetrahedronMat = new THREE.MeshPhongMaterial({
            map: texture,
            color: colors[colorIndex],
        });

        const mesh = new THREE.Mesh(tetrahedronGeo, tetrahedronMat);

        mesh.position.set(x, y, z);
        config.graph.add(mesh);
    }

    /** Создает додекаэдр (двенадцатигранник) по заданным координатам */
    static createDodecahedron(x, y, z, colorIndex, texture = null) {
        const dodecahedronRadius = 1.55;
        const dodecahedronGeo = new THREE.DodecahedronGeometry(
            dodecahedronRadius
        );

        const dodecahedronMat = new THREE.MeshPhongMaterial({
            map: texture,
            color: colors[colorIndex],
        });

        const mesh = new THREE.Mesh(dodecahedronGeo, dodecahedronMat);

        mesh.position.set(x, y, z);
        config.graph.add(mesh);
    }

    /** Создает цилиндр по заданным координатам */
    static createCylinder(x, y, z, colorIndex, texture = null) {
        // https://threejs.org/docs/#api/en/geometries/CylinderGeometry

        const cylinderGeo = new THREE.CylinderGeometry(0.7, 1.3, 2.4, 20);
        const cylinderMat = new THREE.MeshPhongMaterial({
            map: texture,
            color: colors[colorIndex],
        });

        const mesh = new THREE.Mesh(cylinderGeo, cylinderMat);

        mesh.position.set(x, y, z);
        config.graph.add(mesh);
    }

    /** Создает тор по заданным координатам */
    static createTorus(x, y, z, colorIndex, texture = null) {
        /** https://threejs.org/docs/#api/en/geometries/TorusGeometry
         *  TorusGeometry( radius, tube, radialSegments, tubularSegments, arc )
         *  radius - Radius of the torus, from the center of the torus to the center of the tube. Default is 1.
         *  tube — Radius of the tube. Default is 0.4.
         *  radialSegments — Default is 12
         *  tubularSegments — Default is 48.
         *  arc — Central angle. Default is Math.PI * 2.
         */

        const torusGeo = new THREE.TorusGeometry(1.4, 0.5, 10, 30);

        const torusMat = new THREE.MeshPhongMaterial({
            map: texture,
            color: colors[colorIndex],
        });

        const mesh = new THREE.Mesh(torusGeo, torusMat);

        mesh.position.set(x, y, z);
        config.graph.add(mesh);
    }

    /** Создает тор всего с 4 сегментами по заданным координатам */
    static createTorus_4(x, y, z, colorIndex, texture = null) {
        /** https://threejs.org/docs/#api/en/geometries/TorusGeometry
         *  TorusGeometry( radius, tube, radialSegments, tubularSegments, arc )
         *  radius - Radius of the torus, from the center of the torus to the center of the tube. Default is 1.
         *  tube — Radius of the tube. Default is 0.4.
         *  radialSegments — Default is 12
         *  tubularSegments — Default is 48.
         *  arc — Central angle. Default is Math.PI * 2.
         */

        const torusGeo = new THREE.TorusGeometry(1.4, 0.6, 4, 4);

        const torusMat = new THREE.MeshPhongMaterial({
            map: texture,
            flatShading: true,
            color: colors[colorIndex],
        });

        const mesh = new THREE.Mesh(torusGeo, torusMat);

        mesh.position.set(x, y, z);
        config.graph.add(mesh);
    }

    /** Создает тор узелком по заданным координатам */
    static createTorusKnot(x, y, z, colorIndex, texture = null) {
        /** https://threejs.org/docs/#api/en/geometries/TorusKnotGeometry
         *  TorusKnotGeometry(radius, tube, tubularSegments, radialSegments, p, q)
         *  radius - Radius of the torus. Default is 1.
         *  tube — Radius of the tube. Default is 0.4.
         *  tubularSegments — Default is 64.
         *  radialSegments — Default is 8.
         *  p — This value determines, how many times the geometry winds around its axis of rotational symmetry. Default is 2.
         *  q — This value determines, how many times the geometry winds around a circle in the interior of the torus. Default is 3.
         */

        const torusKnotGeo = new THREE.TorusKnotGeometry(
            1.1,
            0.3,
            100,
            12,
            2,
            3
        );

        const torusKnotMat = new THREE.MeshPhongMaterial({
            map: texture,
            // flatShading: true,
            color: colors[colorIndex],
        });

        const mesh = new THREE.Mesh(torusKnotGeo, torusKnotMat);

        mesh.position.set(x, y, z);
        config.graph.add(mesh);
    }

    /** Создает октаэдр по заданным координатам */
    static createOctahedron(x, y, z, colorIndex, texture = null) {
        // https://threejs.org/docs/#api/en/geometries/OctahedronGeometry

        const octahedronRadius = 1.8;
        const octahedronGeo = new THREE.OctahedronGeometry(octahedronRadius);

        const octahedronMat = new THREE.MeshPhongMaterial({
            map: texture,
            color: colors[colorIndex],
        });

        const mesh = new THREE.Mesh(octahedronGeo, octahedronMat);
        mesh.position.set(x, y, z);
        config.graph.add(mesh);
    }

    /** Создает октаэдр по заданным координатам */
    static createOctahedronWithTexture(x, y, z, colorIndex) {
        // https://stackoverflow.com/questions/7919516/using-textures-in-three-js

        const loader = new THREE.TextureLoader();
        loader.load("./textures/glass_texture_5.jpeg", function (texture) {
            GraphicObjects.createOctahedron(x, y, z, colorIndex, texture);
        });
    }

    /**
     * Подсчитывает количество полигонов объекта THREE.Mesh
     * @param {THREE.Mesh} object
     */
    static countObjectPolygons(object) {
        if (!object.isMesh) return 0;

        const geometry = object.geometry;

        let triangles = -1;

        if (geometry.index != null) {
            triangles = geometry.index.count / 3;
        } else if (geometry.attributes != null) {
            triangles = geometry.attributes.position.count / 3;
        }

        return triangles;
    }
}

/** Слой моделей и обработки данных в MVC.
 *
 * Содержит:
 * * обработанные данные графа. */
class Model {
    constructor() {}

    async build() {
        const dataLoader = new DataLoader();
        this.graphData = await dataLoader.loadGraphData();

        this.graph = new Graph(this.graphData);
        this.graphInfo = new GraphInfo(this.graphData);
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
        const lightContext1 = GraphicObjects.createLight();

        // config.controls.addEventListener("change", function () {
        //     const x = config.camera.position.x;
        //     const y = config.camera.position.y;
        //     const z = config.camera.position.z;
        //     // const len =  config.camera.position.length ;
        //     lightContext.target.position.set(-x * 1.0, -y * 1.0, -z * 1.0);
        // });

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
     * @param {Vertex} vertex - вершина, экземпляр класса `Vertex`.
     */
    buildVertexObject(vertex) {
        // цвета
        // 1 - мягко желтый
        // 2 - мягко голубой
        // 3 - темно голубой
        // 4 - серый
        // 6 - красный
        // 7 - темно желный
        // 8 - мятный. для входных

        let color = 1; // дефолт

        if (vertex.type == 0) {
            color = 8;
        } else if (config.params.showLevel) {
            if (vertex.level == config.params.level) {
                color = 2;
            } else if (vertex.level <= config.params.level) {
                color = 4;
            }
        }

        switch (vertex.type) {
            case "0": {
                // input/output vertex
                GraphicObjects.createOctahedron(
                    vertex.pos.x,
                    vertex.pos.y,
                    vertex.pos.z,
                    color
                );
                break;
            }
            case "1": {
                GraphicObjects.createSphere(
                    vertex.pos.x,
                    vertex.pos.y,
                    vertex.pos.z,
                    color
                );
                break;
            }
            case "2": {
                GraphicObjects.createDodecahedron(
                    vertex.pos.x,
                    vertex.pos.y,
                    vertex.pos.z,
                    color
                );
                break;
            }
            case "3": {
                GraphicObjects.createCylinder(
                    vertex.pos.x,
                    vertex.pos.y,
                    vertex.pos.z,
                    color
                );
                break;
            }
            case "4": {
                GraphicObjects.createCube(
                    vertex.pos.x,
                    vertex.pos.y,
                    vertex.pos.z,
                    color
                );
                break;
            }
            case "5": {
                // GraphicObjects.createTetrahed
                GraphicObjects.createTorus(
                    vertex.pos.x,
                    vertex.pos.y,
                    vertex.pos.z,
                    color
                );
                break;
            }
            case "6": {
                GraphicObjects.createTorus_4(
                    vertex.pos.x,
                    vertex.pos.y,
                    vertex.pos.z,
                    color
                );
                break;
            }
            case "7": {
                GraphicObjects.createTorusKnot(
                    vertex.pos.x,
                    vertex.pos.y,
                    vertex.pos.z,
                    color
                );
                break;
            }
            default: {
                GraphicObjects.createCustomText(
                    "?",
                    vertex.pos.x,
                    vertex.pos.y,
                    vertex.pos.z,
                    color
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
        // 1 - yellow
        // 2 - blue
        // 6 - red
        const color =
            config.params.showLevel && edge.level == config.params.level
                ? 2
                : 6;

        if (edge.requiresBending) {
            GraphicObjects.createCurvedArrow(
                edge.sourceVertex.pos,
                edge.targetVertex.pos,
                config.params.lineWidth,
                color
            );
        } else {
            GraphicObjects.createStraightArrow(
                edge.sourceVertex.pos,
                edge.targetVertex.pos,
                config.params.lineWidth,
                color
            );
        }
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

/** Контроллер полей с информацией о графе и ошибках в работе */
class InfoBlockController {
    static changeCharacteristicsBlock(graphInfo) {
        let content = "";

        if (graphInfo != null) {
            if (
                config.params.showGraphCharacteristics &&
                !graphInfo.characteristicsIsEmpty
            ) {
                const info = graphInfo.characteristics;
                content = "<b><i>Graph characteristics:</i></b><br>";
                content += "• vertex num: " + info.vertex_num + "<br>";
                content += "• edge num: " + info.edge_num + "<br>";
                content +=
                    "• critical path length: " +
                    info.critical_path_length +
                    "<br>";
                content +=
                    "• parallel form width: " +
                    info.parallel_form_width +
                    "<br><br>";
            }

            if (config.params.showErrors && graphInfo.thereAreErrors) {
                const errors = graphInfo.errors;
                content += "<b><i>Errors (" + errors.length + "):</i></b><br>";

                for (let i = 0; i < errors.length; i++) {
                    const num = i + 1;
                    content += "<b>" + num + ":</b> " + errors[i] + "<br>";
                }

                content += "<br>";
            }

            if (config.params.showWarnings && graphInfo.thereAreWarnings) {
                const warnings = graphInfo.warnings;

                content +=
                    "<b><i>Warnings (" + warnings.length + "):</i></b><br>";

                for (let i = 0; i < warnings.length; i++) {
                    const num = i + 1;
                    content += "<b>" + num + ":</b> " + warnings[i] + "<br>";
                }
            }
        }

        document.getElementById("textInfoBlock_0").innerHTML = content;
    }

    static changeFPSInfoBlock(text1, text2) {
        const content1 = "<h4>" + text1 + "</h4>";
        const content2 = "<h4>" + text2 + "</h4>";

        document.getElementById("textInfoBlock_1").innerHTML = content1;
        document.getElementById("textInfoBlock_2").innerHTML = content2;
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
                    // config.setupGUI();
                    console.log("AppManager.statusProxy updated");
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
    }

    async build() {
        this.model = new Model();
        await this.model.build();

        this.view = new View(this.model);
        this.controller = new Controller(this.appManager, this.view);

        config.setControllerContext(this.controller);
        config.setupGUI(this.model.graphInfo);

        // if (config.params.showGraphInfo)
        InfoBlockController.changeCharacteristicsBlock(this.model.graphInfo);

        this.appManager.setDoneBuildStatus();
    }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

class FPSManager {
    /** number of values in a line */
    #n;

    /** FPS values line (array) */
    #fpsLine;

    /** render time values line (array) */
    #rtLine;

    constructor() {
        this.#n = Math.round(config.params.fpsRate / 3) + 1;
        this.#fpsLine = [0];
        this.#rtLine = [0];
    }

    addFpsValue(newValue) {
        while (this.#fpsLine.length >= this.#n) {
            this.#fpsLine.shift(); // удаление первого элемента
        }

        this.#fpsLine.push(newValue);
    }

    addRenderTimeValue(newValue) {
        while (this.#rtLine.length >= this.#n) {
            this.#rtLine.shift(); // удаление первого элемента
        }

        this.#rtLine.push(newValue);
    }

    getAverageFps() {
        const sum = this.#fpsLine.reduce((partialSum, a) => partialSum + a, 0);
        return sum / this.#fpsLine.length;
    }

    getAverageRenderTime() {
        const sum = this.#rtLine.reduce((partialSum, a) => partialSum + a, 0);
        return sum / this.#rtLine.length;
    }

    getFpsInfoStr() {
        const AverageFpsStr = this.getAverageFps().toFixed(1);
        const infoStr = "FPS: " + AverageFpsStr;
        return infoStr;
    }

    getRenderTimeInfoStr() {
        const AverageRenderTimeStr = this.getAverageRenderTime().toFixed(2);
        const maxFrameTime = (1000 / config.params.fpsRate).toFixed(2);

        const infoStr =
            "Render time: " +
            AverageRenderTimeStr +
            " / " +
            maxFrameTime +
            " ms";

        return infoStr;
    }
}

const fpsManager = new FPSManager();

// function resizeRendererToDisplaySize(renderer) {
//     const canvas = renderer.domElement;
//     const pixelRatio = window.devicePixelRatio;
//     const width = (canvas.clientWidth * pixelRatio) | 0;
//     const height = (canvas.clientHeight * pixelRatio) | 0;
//     const needResize = canvas.width !== width || canvas.height !== height;
//     if (needResize) {
//         renderer.setSize(width, height, false);
//     }
//     return needResize;
// }

async function renderLoop() {
    // if (resizeRendererToDisplaySize(renderer)) {
    //     const canvas = renderer.domElement;
    //     camera.aspect = canvas.clientWidth / canvas.clientHeight;
    //     camera.updateProjectionMatrix();
    // }

    if (app.appManager.buildStatus != "done") {
        console.log("Waiting for the application to finish building.");
        await sleep(100);
        requestAnimationFrame(renderLoop);
        return;
    }

    const startTime = performance.now();

    if (!config.params.pause) {
        if (config.params.autoRotate) {
            app.controller.autoRotateGraph();
        }

        config.renderFrame();
    }

    const endTime = performance.now();
    const renderTime = endTime - startTime;
    const maxFrameTime = 1000 / config.params.fpsRate;

    if (renderTime < maxFrameTime - 1) {
        const error = 0.035; // погрешность при вычислении
        const sleepTime = maxFrameTime - renderTime;
        await sleep(sleepTime * (1 - error));
    }

    const endFrameTime = performance.now();
    const fps = 1000 / (endFrameTime - startTime);

    fpsManager.addFpsValue(fps);
    fpsManager.addRenderTimeValue(renderTime);
    if (config.params.showSystemLoadInfo) {
        InfoBlockController.changeFPSInfoBlock(
            fpsManager.getFpsInfoStr(),
            fpsManager.getRenderTimeInfoStr()
        );
    }
    requestAnimationFrame(renderLoop);
}

const app = new App();
app.build();

renderLoop();
