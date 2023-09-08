"use strict";

/** Модель загрузки данных. */
class DataLoader {
    static emptyGraphDataTemplate = { vertices: [], edges: [] };

    constructor() {
        this.graphData = DataLoader.emptyGraphDataTemplate;
    }

    loadGraphData() {
        // jsonGraphData загружена в html страничке
        this.graphData = JSON.parse(jsonGraphData);

        return this.graphData;
    }
}
