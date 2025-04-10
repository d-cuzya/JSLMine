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
async function downloadFileByUrl(url) {
    let fileName = url.substring(url.lastIndexOf('/')+ 1);
    await fs.mkdir(`./src/backend/versions/${fileName}`, { recursive: true });
}

async function main() {    
    await initVersionManifest();
    await downloadFileByUrl((await getInfoAboutVersion(await getLastRelease())).url);    
}

main()

// java -Xmx2G -cp "client.jar:libraries/*" -Djava.library.path=./natives net.minecraft.client.main.Main --username Player --version 1.21.5 --gameDir ~/.minecraft --assetsDir ~/.minecraft/assets --assetIndex 24