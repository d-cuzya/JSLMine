import fs from 'fs/promises';
import exec from 'child_process'
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
        console.log(element.downloads.artifact.url);
    });
}

// id - version (ex: 1.12.2 - is id)
async function main() {    
    await initVersionManifest();
    await downloadJsonByUrl((await getInfoAboutVersion(await getLastRelease())).url);
    await downloadLibraries(await getLastRelease());
}

main()

// java -Xmx2G -cp "client.jar:libraries/*" -Djava.library.path=./natives net.minecraft.client.main.Main --username Player --version 1.21.5 --gameDir ~/.minecraft --assetsDir ~/.minecraft/assets --assetIndex 24