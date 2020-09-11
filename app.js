const fs = require('fs'),
    path = require('path'),
    puppeteer = require('puppeteer'),
    logger = require('node-color-log'),
    config = require('./config.json');

const DEFAULT_DIRECTORY_PATH = config.directoryToDecrypt;
const DEFAULT_SEARCH_EXTENSION = "php";
const DEFAULT_SEARCH_CONTENT = "if(!extension_loaded('ionCube Loader')){$__oc=strtolower(substr(php_uname(),0,3));$__ln='ioncube_loader_'.$__oc.'_'.substr(phpversion(),0,3).(($__oc=='win')?'.dll':'.so');";
const DEFAULT_LAUNCH_OPTIONS = { headless: true };
const DEFAULT_VIEW_PORT = { width: 1366, height: 768 };
const DEFAULT_USER_AGENT = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36`;

const EASYTOYOU_URL = `https://easytoyou.eu/decoder/${config.EasyToYou_Method}`;

function findByExt(base, ext, files, result) {
    files = files || fs.readdirSync(base);
    result = result || [];

    files.forEach(file => {
        let newBase = path.join(base, file);

        if (fs.statSync(newBase).isDirectory()) {
            result = findByExt(newBase, ext, fs.readdirSync(newBase), result);
        } else {
            if (file.substr(-1 * (ext.length + 1)) === `.${ext}`) result.push(newBase);
        }
    });

    return result;
}

function getFilesEncrypted(searchDirectory, searchExtension, searchContent, printInConsole = false) {
    let filesFound = [],
        allFilesFound = findByExt(searchDirectory, searchExtension);

    allFilesFound.forEach(file => {
        let fileContent = fs.readFileSync(file, 'utf-8');

        if(fileContent.includes(searchContent)){
            filesFound.push(file);
        }
    });

    if(printInConsole){
        console.log("Total files : " + allFilesFound.length);
        console.log("Total files encrypted : " + filesFound.length);
        console.log("----------------------------------------\r\n");

        filesFound.forEach(file => {
            console.log(file.replace(searchDirectory + '\\', ''));
        });
    }

    return filesFound;
}

async function decryptFile(filePath){
    let returnArray = {
        fileDecrypted : false,
        downloadLink : null
    };

    const browser = await puppeteer.launch(DEFAULT_LAUNCH_OPTIONS);
    const page = await browser.newPage();

    await page.setCookie(...config.EasyToYou_Cookies);
    await page.setViewport(DEFAULT_VIEW_PORT);
    await page.setUserAgent(DEFAULT_USER_AGENT);

    await page.goto(EASYTOYOU_URL);

    await page.waitForSelector('input[type=file]');
    await page.waitForTimeout(1000);

    const inputUploadHandle = await page.$('input[type=file]');
    await inputUploadHandle.uploadFile(filePath);

    await page.waitForSelector('input[type=submit]');
    await page.evaluate(() => document.getElementsByName('submit')[0].click());

    await page.waitForSelector('div.alert.fade.in');
    const resultNotification = await page.$('div.alert.fade.in');

    if((resultNotification && resultNotification._remoteObject) && resultNotification._remoteObject["description"] === "div.alert.alert-success.fade.in"){
        returnArray.fileDecrypted = true;
        returnArray.downloadLink = await resultNotification.$eval('a', a => a.getAttribute('href'));
    }

    await browser.close();

    return returnArray;
}

async function downloadFile(directoryPath, urlPath){
    const browser = await puppeteer.launch(DEFAULT_LAUNCH_OPTIONS);
    const page = await browser.newPage();

    await page.setCookie(...config.EasyToYou_Cookies);
    await page.setViewport(DEFAULT_VIEW_PORT);
    await page.setUserAgent(DEFAULT_USER_AGENT);
    await page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: directoryPath});

    try{
        await page.goto(urlPath);
    }catch (e) {
        //making every time error because downloading file.
    }

    await page.waitForTimeout(1000);

    await browser.close();
}

const filesEncrypted = getFilesEncrypted(DEFAULT_DIRECTORY_PATH, DEFAULT_SEARCH_EXTENSION, DEFAULT_SEARCH_CONTENT, false);

async function decryptAndDownloadFile(fileId = 0){
    if(fileId > filesEncrypted.length){
        logger.color('green').bold().log(`Job complete : ${filesEncrypted.length} files decrypted with success!`)
        return;
    }

    let filePath = filesEncrypted[fileId],
        directoryPath = path.dirname(filePath);

    let decryptResult = await decryptFile(filePath);

    if(decryptResult.fileDecrypted){
        await fs.unlinkSync(filePath);
        await downloadFile(directoryPath, decryptResult.downloadLink);
        logger.info(`(${fileId}/${filesEncrypted.length}) Decrypting & Downloading file with success : ${filePath.replace(config.directoryToDecrypt, '')}`);
    }else{
        logger.error(`(${fileId}/${filesEncrypted.length}) File already decrypted or cannot be decrypted : ${filePath.replace(config.directoryToDecrypt, '')}`);
    }

    await decryptAndDownloadFile(fileId + 1);
}

(async () => {
    setTimeout(async () => {
        if(filesEncrypted.length >= 1){
            logger.color('blue').bold().log(`Starting decryption of directory "${DEFAULT_DIRECTORY_PATH}" with ${filesEncrypted.length} encrypted files..`);

            await decryptAndDownloadFile();
        }else{
            logger.error(`No file encrypted found!`);
        }
    }, 2000);
})();