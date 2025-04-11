import fs from 'fs/promises';
import exec from 'child_process'
import download from 'download';

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
    // console.log("versionJson: ");
    // console.log(versionJson);
    await versionJson.libraries.forEach((element) => {
        if (element.downloads.artifact == undefined) {
            Object.entries(element.downloads.classifiers).forEach((tmp) => {
                console.log(tmp);
            });
            // console.log(element.downloads.classifiers);
        } else {
            // download(element.downloads.artifact.url, `./src/backend/versions/${id}/libraries`);
        }
    });
}
async function downloadAssets(id) {
    const versionJson = JSON.parse(await fs.readFile(`./src/backend/versions/${id}/${id}.json`, 'utf8'));
    const assetsJson =  await (await fetch(versionJson.assetIndex.url)).json();
    await fs.writeFile(`./src/backend/versions/${id}/assets.json`, JSON.stringify(assetsJson), 'utf8');
    // console.log(assetsJson)
    await fs.mkdir(`./src/backend/versions/${id}/assets/`, { recursive: true });
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
    exec.exec(`"C:\\Program Files\\Java\\jre1.8.0_441\\bin\\javaw.exe" -Xmx4G -Xms1G -cp "./src/backend/versions/${id}/libraries/*;./src/backend/versions/${id}/client.jar" net.minecraft.client.main.Main --username "nicknadme" --version ${id} --gameDir /.minecraft  --assetDir "./src/backend/versions/${id}/assets/*" --assetIndex 24 --accessToken 0`, (err, stdout, stderr) => {;
        console.log(`err: ${err}`);
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
    });
}
// id - version (ex: '1.12.2' - is id)
async function main() {    
    // await initVersionManifest();
    // const version = await getLastRelease();
    const version = "1.12.2";
    // await downloadJsonByUrl((await getInfoAboutVersion(version)).url);
    await downloadLibraries(version);
    // await downloadAssets(version);
    // await downloadClient(version);
    // await startClient(version);
}

main()