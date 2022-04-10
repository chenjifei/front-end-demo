const express = require('express');
const bodyParser = require('body-parser');
const multer = require("multer");
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(cors({ origin: 'http://localhost:1234' }));
const upload = multer({ dest: 'resources/' });
app.post("/upload", upload.any(), (req, res) => {
    let chunkTempFilePath = ""
    req.files.forEach(file => {
        const [, hash, index] = file.fieldname.split("-")
        chunkTempFilePath = `resources/${hash}`;
        if (!fs.existsSync(chunkTempFilePath)) {
            fs.mkdirSync(chunkTempFilePath)
        }
        //文件重命名
        fs.renameSync(file.path, chunkTempFilePath + "/" + hash + '-' + index);
    });
    res.json({
        status: "upload success"
    })
});

app.post("/merge", async (req, res) => {
    const { hash, filename } = req.body
    //文件合并
    const chunks = fs.readdirSync('resources/' + hash).sort((a, b) => a.split("-")[1] - b.split("-")[1]);
    const saveDir = "resources/" + filename;

    const writeStream = fs.createWriteStream(saveDir);
    chunks.forEach(item => {
        console.log(item)
        const data = fs.readFileSync(path.resolve('resources/', hash, item));
        writeStream.write(data);
    });
    writeStream.end();
    fs.rmdirSync('resources/' + hash, { recursive: true, force: true })
    res.json({
        status: "upload success"
    })
});


app.listen(3000, () => {
    console.log(`Server is listening`)
})