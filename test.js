import fs from 'fs/promises';
import exec from 'child_process'
import download from 'download';
import { log } from 'console';

let version_manifest;

async function initVersionManifest() {
    const tmp = await fs.readFile('./src/backend/version_manifest.json', 'utf8');
    version_manifest = JSON.parse(tmp);
}
async function getLastRelease() {
    return version_manifest.latest.release;
}
async function getInfoAboutVersion(id) {
    let res = null;
    version_manifest.versions.forEach(element => {
        if (element.id == id) {
            res = element;
            return;
        }
    });
    return res;
}
async function downloadJsonByUrl(url) {
    let fileName = url.substring(url.lastIndexOf('/')+ 1);
    let fileContent = await fetch(url);
    await fs.mkdir(`./src/backend/versions/${fileName.replace('.json','')}`, { recursive: true });
    await fs.writeFile(`./src/backend/versions/${fileName.replace('.json','')}/${fileName}`, Buffer.from(await fileContent.arrayBuffer()), 'utf8');
}
async function downloadLibraries(id) {
    const versionJson = JSON.parse(await fs.readFile(`./src/backend/versions/${id}/${id}.json`, 'utf8'));
    await fs.mkdir(`./src/backend/versions/${id}/libraries/`, { recursive: true });
    await versionJson.libraries.forEach(async (element) => {
        if (element.downloads.artifact === undefined) {
            console.log("1");
            Object.entries(element.downloads.classifiers).forEach(async (tmp) => {
                if (tmp[0] == "natives-windows") {
                    await fs.mkdir(`./src/backend/versions/${id}/libraries/natives/`, { recursive: true });
                    await download(tmp[1].url, `./src/backend/versions/${id}/libraries/natives/`);
                }                
            });
        } else {
            await download(element.downloads.artifact.url, `./src/backend/versions/${id}/libraries`);
        }
    });
    await fs.readdir(`./src/backend/versions/${id}/libraries`, (err, files) => { // распаковать natives
        if (err) {
            console.error(err);
            return;
        }
        files.array.forEach(async (element) => {
            console.log(`./src/backend/versions/${id}/libraries/natives/${element}`);
        });

    });
}
async function downloadAssets(id) {
    const versionJson = JSON.parse(await fs.readFile(`./src/backend/versions/${id}/${id}.json`, 'utf8'));
    const assetsJson =  await (await fetch(versionJson.assetIndex.url)).json();

    await fs.mkdir(`./src/backend/versions/${id}/assets/`, { recursive: true });
    await fs.mkdir(`./src/backend/versions/${id}/assets/indexes/`, { recursive: true });
    await fs.writeFile(`./src/backend/versions/${id}/assets/indexes/${versionJson.assetIndex.id}.json`, JSON.stringify(assetsJson), 'utf8');
    const tmp = Object.entries(assetsJson.objects);
    let count = 0;
    for(const [_, value] of tmp) {
        await download(`https://resources.download.minecraft.net/${value.hash.substring(0,2)}/${value.hash}`, `./src/backend/versions/${id}/assets`);
        console.log(`Asset: ${count}/${tmp.length}`);
        count++;
    }
    console.log("Assets download was secuess!");
}
async function downloadClient(id) {
    const versionJson = JSON.parse(await fs.readFile(`./src/backend/versions/${id}/${id}.json`, 'utf8'));
    await download(versionJson.downloads.client.url, `./src/backend/versions/${id}/`);
}
async function startClient(id) {
    // 1.13 <:
    // "C:\\Program Files\\Java\\jdk-23\\bin\\java.exe" -Djava.library.path="./src/backend/versions/1.21.5/libraries/natives" -Xmx2G -Xms1G -cp "./src/backend/versions/1.21.5/libraries/*;./src/backend/versions/1.21.5/client.jar" net.minecraft.client.main.Main --username "nicknadme" --version 1.21.5 --gameDir /.minecraft  --assetDir "./src/backend/versions/1.21.5/assets/" --assetIndex 24 --accessToken 0
    // 1.13>:
    //
    exec.exec(`"C:\\Program Files\\Java\\jre1.8.0_441\\bin\\javaw.exe" -Djava.library.path="./src/backend/versions/${id}/libraries/natives" -Xmx2G -Xms1G -cp "./src/backend/versions/${id}/libraries/;./src/backend/versions/${id}/client.jar" net.minecraft.client.main.Main --username "nicknadme" --version ${id} --gameDir /.minecraft  --assetDir "./src/backend/versions/${id}/assets/" --assetIndex 24 --accessToken 0`, (err, stdout, stderr) => {;
        console.log(`err: ${err}`);
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
    });
}
// id - version (ex: '1.12.2' - is id)
async function main() {    
    await initVersionManifest();
    const version = await getLastRelease();
    // const version = "1.12.2";
    await downloadJsonByUrl((await getInfoAboutVersion(version)).url);
    await downloadLibraries(version);
    await downloadAssets(version);
    // await downloadClient(version);
    // await startClient(version);
}

main()