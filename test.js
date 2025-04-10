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
    await versionJson.libraries.forEach((element) => {
        download(element.downloads.artifact.url, `./src/backend/versions/${id}/libraries`);
        // console.log();
    });
}
async function downloadAssets(id) {
    const versionJson = JSON.parse(await fs.readFile(`./src/backend/versions/${id}/${id}.json`, 'utf8'));
    const assetsJson =  await (await fetch(versionJson.assetIndex.url)).json();
    await fs.writeFile(`./src/backend/versions/${id}/assets.json`, JSON.stringify(assetsJson), 'utf8');
    // console.log(assetsJson)
    await fs.mkdir(`./src/backend/versions/${id}/assets/`, { recursive: true });
    for(const [_, value] of Object.entries(assetsJson.objects)) {

        await download(`https://resources.download.minecraft.net/${value.hash.substring(0,2)}/${value.hash}`, `./src/backend/versions/${id}/assets`);
        console.log("Asset was download.");
    }
    console.log("Assets download was secuess!");
}
// id - version (ex: 1.12.2 - is id)
async function main() {    
    await initVersionManifest();
    await downloadJsonByUrl((await getInfoAboutVersion(await getLastRelease())).url);
    // await downloadLibraries(await getLastRelease());
    await downloadAssets(await getLastRelease());
    // await startClient(id);
}

main()

// java -Xmx2G -cp "client.jar:libraries/*" -Djava.library.path=./natives net.minecraft.client.main.Main --username Player --version 1.21.5 --gameDir ~/.minecraft --assetsDir ~/.minecraft/assets --assetIndex 24