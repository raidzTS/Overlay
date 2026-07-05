// REWIND GAMING BROADCAST OVERLAY UPDATER
// FIXED VERSION (v1.2 patched)

// NOTE: Only functional fixes applied. Structure preserved.

class GraphicsUpdater {

    constructor(settings, spreadsheetID, worksheetName, apiKey, updateInterval = 3000, updateNow = true) {

        this.updating = false;

        const cellsNeeded = (() => {
            let cells = [];
            for (let i of Object.values(settings)) {
                for (let j of Object.keys(i)) {
                    cells.push(j.match(/[a-zA-Z]+|[0-9]+/g));
                }
            }
            return cells;
        })();

        const cellsNumeric = cellsNeeded.map(coords => [
            this.colToIndex(coords[0]),
            parseInt(coords[1])
        ]);

        const cellRange = (() => {
            const cols = cellsNumeric.map(v => v[0]);
            const rows = cellsNumeric.map(v => v[1]);
            return [
                Math.min(...cols),
                Math.min(...rows),
                Math.max(...cols),
                Math.max(...rows)
            ];
        })();

        const rangeText =
            `${this.indexToCol(cellRange[0])}${cellRange[1]}:` +
            `${this.indexToCol(cellRange[2])}${cellRange[3]}`;

        this.url =
            `https://sheets.googleapis.com/v4/spreadsheets/` +
            `${spreadsheetID}/values/${worksheetName}!${rangeText}` +
            `?key=${apiKey}&majorDimension=COLUMNS&valueRenderOption=FORMATTED_VALUE`;

        this.arrayMap = (() => {
            let map = {};

            for (let i of Object.keys(settings)) {
                map[i] = {};

                for (let j of Object.keys(settings[i])) {

                    let coords = j.match(/[a-zA-Z]+|[0-9]+/g);

                    coords[0] = this.colToIndex(coords[0]);

                    coords = coords.map((v, i) => v - cellRange[i]);

                    map[i][coords.toString()] = settings[i][j];
                }
            }

            return map;
        })();

        this.simpleOperations = ['string', 'image'];

        this.operations = {
            'string': (id, cellValue) =>
                document.getElementById(id).innerHTML = cellValue,

            'image': (id, cellValue) =>
                document.getElementById(id).src = cellValue,

            'counter': (ids, cellValue) => {
                let num = parseInt(cellValue);

                if (isNaN(num)) num = 0;

                for (let i = 0; i < num; i++) {
                    document.getElementById(ids[i]).style.display = '';
                }

                for (let i = num; i < ids.length; i++) {
                    document.getElementById(ids[i]).style.display = 'none';
                }
            },

            'switch': (valueSwitch, cellValue) => {
                for (let i of Object.keys(valueSwitch)) {
                    document.getElementById(valueSwitch[i]).style.display =
                        (i == cellValue) ? '' : 'none';
                }
            }
        };

        this.updateInterval = updateInterval;

        if (updateNow) this.startUpdating();
    }

    async update() {

        let cells;

        try {
            const response = await fetch(this.url);

            if (!response.ok) {
                throw new Error("Failed to fetch spreadsheet");
            }

            cells = await response.json();
        }
        catch (error) {
            throw new Error(
                "Failed to access spreadsheet or API key is invalid"
            );
        }

        cells = cells.values;

        for (let type of Object.keys(this.arrayMap)) {

            let run;

            if (this.simpleOperations.includes(type)) {
                run = (ids, value) => {
                    if (Array.isArray(ids)) {
                        for (let id of ids) {
                            this.operations[type](id, value);
                        }
                    } else {
                        this.operations[type](ids, value);
                    }
                };
            } else {
                run = (ids, value) =>
                    this.operations[type](ids, value);
            }

            for (let locationString of Object.keys(this.arrayMap[type])) {

                const coords = locationString
                    .split(',')
                    .map(v => parseInt(v));

                const cellValue = (() => {
                    const col = cells[coords[0]];
                    if (!col) return '';
                    return col[coords[1]] ?? '';
                })();

                try {
                    run(this.arrayMap[type][locationString], cellValue);
                }
                catch (error) {
                    console.warn(
                        `Failed update for ${locationString}:`,
                        error
                    );
                }
            }
        }
    }

    addOperation(name, operation, isSimple = false) {
        if (!(name in this.operations)) {
            this.operations[name] = operation;

            if (isSimple) {
                this.simpleOperations.push(name);
            }
        } else {
            console.warn(`Operation ${name} already exists`);
        }
    }

    importPreset(operationObject) {
        this.addOperation(...Object.values(operationObject));
    }

    startUpdating() {
        if (!this.updating) {
            this.update();
            setInterval(this.update.bind(this), this.updateInterval);
            this.updating = true;
        }
    }

    colToIndex(colString) {
        let base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = 0;

        for (let i = 0, j = colString.length - 1;
            i < colString.length;
            i++, j--) {

            result += Math.pow(base.length, j) *
                (base.indexOf(colString[i]) + 1);
        }

        return result;
    }

    indexToCol(num) {
        let result = '';

        for (let a = 1, b = 26;
            (num -= a) >= 0;
            a = b, b *= 26) {

            result =
                String.fromCharCode(parseInt((num % b) / a) + 65) +
                result;
        }

        return result;
    }
}