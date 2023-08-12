// Подключегние внешний модулей, которые находятся в node_modules
const path = require("path");
const fs = require("fs");
const Koa = require("koa");
const serve = require("koa-static");
const Router = require("@koa/router");
const multer = require("@koa/multer");
const cors = require("@koa/cors");
const { exec } = require("child_process");
const koaStatic = require("koa-static");
const dayjs = require("dayjs");

const app = new Koa();
const router = new Router();

// порт на котором откроется сервер
const PORT = 3001;
const BASH_SCRIPT_DEBUG = true;

// задаем имя папке для скачивания файлов
// __dirname - папка, откуда запустили этот скрипт. у нас это корень
const UPLOAD_DIR = path.join(__dirname, "/uploadFiles");
const LOGS_DIR = path.join(__dirname, "/logs");

function saveLogsToFile(logsData, logsFilename) {
    const logsPath = path.join(LOGS_DIR, logsFilename);

    fs.writeFile(logsPath, logsData, (err) => {
        if (err) {
            console.log("error while saving logs: ", err);
            console.error("error while saving logs: ", err);
        }
    });
}

// статус обработки загруженного файла
// var uploadedFileProcessing = {
//     inProgress: null,
// };

// todo
// let uploadingStatus = uploadedFileProcessing.done;
// const uploadedFileProcessing = {
//     inProgress: 1,
//     error: 2,
//     done: 3,
// };

// Routing
// роутеру приходят запросы от клиента, что пользователь
// хочет перейти на какоую-то страницу по заданному адресу
router.get("/", (ctx, next) => {
    ctx.type = "html";

    ctx.body = fs.createReadStream(
        path.join(__dirname, "public", "/AlgoViewPage/AlgoViewPage.html")
    );

    next();
});

router.get("/fileUploadPage", (ctx, next) => {
    ctx.type = "html";

    // if (uploadedFileProcessing.inProgress) {
    //     ctx.body = "Uploaded file processing in progress ...";
    //     return next();
    // }

    ctx.body = fs.createReadStream(
        path.join(__dirname, "public", "/fileUploadPage/fileUploadPage.html")
    );

    next();
});

// File Uploading
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        cb(null, `${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

// router.post("/upload-single-file", upload.single("file"), (ctx) => {
//     // let dataToSend = "";

//     console.log(
//         "run scripts/run.sh " + UPLOAD_DIR + "/" + ctx.request.file.filename
//     );

//     const shScript = spawn(
//         "sh",
//         [
//             "scripts/run.sh",
//             UPLOAD_DIR + "/" + ctx.request.file.filename, // путь к файлу + имя
//         ],
//         (error, stdout, stderr) => {
//             console.log(stdout);
//             console.log(stderr);
//             if (error !== null) {
//                 console.log(`exec error: ${error}`);
//             }
//         }
//     );

//     // uploadedFileProcessing.inProgress = true;

//     // collect data from script
//     const collectData = function (data) {
//         // dataToSend += data.toString();
//         process.stdout.write(data.toString());
//     };

//     shScript.stdout.on("data", collectData);
//     shScript.stderr.on("data", collectData);

//     // const stopProcess = function (code) {
//     //     console.log(dataToSend);
//     //     console.log(`child process close all stdio with code ${code}`);
//     //     uploadedFileProcessing.inProgress = false;
//     // };
//     // in close event we are sure that stream from child process is closed
//     // shScript.on("close", stopProcess);
//     // shScript.on("error", stopProcess);
//     // shScript.on("exit", stopProcess);
//     // shScript.on("disconnect", stopProcess);
//     // shScript.on("message", stopProcess);

//     ctx.body = {
//         uploadStatus: `file ${ctx.request.file.filename} has been saved on the server`,
//         // url: `http://localhost:${PORT}/${ctx.request.file.originalname}`,
//         url: `/${ctx.request.file.originalname}`,
//     };
// });

// add a route for uploading single files
router.post("/upload-single-file", upload.single("file"), (ctx) => {
    const nowTimeStamp = new Date(Date.now());
    let logsData = "[" + nowTimeStamp.toUTCString() + "]\n";

    const filename = ctx.request.file.filename;
    const command = "/bin/bash scripts/run.sh " + UPLOAD_DIR + "/" + filename;
    console.log(`[node.js server: run ${command}]`);

    // https://stackabuse.com/executing-shell-commands-with-node-js/
    const shScript = exec(command, (error, stdout, stderr) => {
        if (error) {
            console.log(`[node.js server: exec error: ${error.message}]`);
            return;
        }

        if (stderr) {
            console.log("[node.js server: there is stderr output]");
            // console.log(`stderr: ${stderr}`);
        }
        if (stdout) {
            console.log("[node.js server: there is stdout output]");
            // console.log(`stdout: ${stdout}`);
        }

        const logsFilename = `logs-${dayjs(nowTimeStamp).format(
            "YYYY-MM-DDTHH:mm:ssZ[Z]"
        )}.txt`;

        saveLogsToFile(logsData, logsFilename);
        console.log(`[node.js server: saved logs as ${logsFilename}`);
        console.log("[node.js server: done!]");
    });

    const collectData = function (data) {
        logsData += data.toString();
        if (BASH_SCRIPT_DEBUG) {
            process.stdout.write(data.toString());
        }
    };

    shScript.stdout.on("data", collectData);
    shScript.stderr.on("data", collectData);

    ctx.body = {
        uploadStatus: `file ${ctx.request.file.filename} has been saved on the server`,
        url: `/${ctx.request.file.originalname}`,
    };
});

// подключаем стили и мои дополнительные модули к THREE
app.use(koaStatic(path.join(__dirname, "public/AlgoViewPage")));
app.use(koaStatic(path.join(__dirname, "public/fileUploadPage")));

app.use(cors());
app.use(router.routes()).use(router.allowedMethods());
app.use(serve(UPLOAD_DIR));

app.listen(PORT, () => {
    console.log(`app starting at port ${PORT}`);
});
