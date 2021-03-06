/**
 * take care of the file if a file is submitted
 *
 * @param file            the file submitted (Blob)
 * @param asArrayBuffer   true if we want to read the file as an ArrayBuffer, otherwise read as a String
 * @returns {*}           a Promise containing the read file
 */
function takeCareOf(file, asArrayBuffer) {
    let reader = new FileReader();

    function loadFile() {
        // usage of a Promise:
        return new Promise(function (resolve) {
            reader.onload = function(event) {
                resolve(event.target.result);
            };
        });
    }

    if (asArrayBuffer === true) {
        // trigger the onload (asynchrone)
        reader.readAsArrayBuffer(file);
    } else {
        // trigger the onload (asynchrone)
        reader.readAsText(file);
    }

    return loadFile();
}

/**
 * Process the information to allow the user to download the signature JSON file
 *
 * @param fileSigned   signed file as an ArrayBuffer
 * @param filename     name of the signed file
 * @param message      array containing the file's signature and the aggregate-key
 */
function saveToFile(fileSigned, filename, message) {
    // instantiate the nacl module:
    nacl_factory.instantiate(function (nacl) {
        let signature = new Uint8Array(message[0].signature.toArrayBuffer());
        let hash = nacl.crypto_hash_sha256(bytesToHex(fileSigned)); // typeof: Uint8Array

        let signatureBase64 = btoa(String.fromCharCode.apply(null, signature));
        let aggregateKeyBase64 = btoa(String.fromCharCode.apply(null, message[1]));
        let hashBase64 = btoa(String.fromCharCode.apply(null, hash));

        // if the download button doesn't exist: create it
        if ($("#download_button").length === 0) {
            $("#add_download_button").append("<button class='btn btn-primary' type='button' id='download_button'>"
                + "Download the Signature" + "</button>");
        }

        // download the JSON file in clicking on the download_button
        $("#download_button").unbind('click').click(function () {
            downloadJSONFile(filename, signatureBase64, aggregateKeyBase64, hashBase64);
        });
    });
}

/**
 * Let the user download the JSON signature file to his computer
 *
 * @param filename
 * @param signature      file's signature
 * @param aggregateKey   aggregate-key
 * @param hash           file's hash
 */
function downloadJSONFile(filename, signature, aggregateKey, hash) {
    // today date in format: mm/dd/yyyy
    let currentTime = new Date();
    let day = currentTime.getDay();
    let month = currentTime.getMonth()+1; // January is number 0
    let year = currentTime.getFullYear();

    let jsonFile = {
        filename: filename,
        date: day +"/"+ month +"/"+ year,
        signature: signature,
        'aggregate-key': aggregateKey,
        hash: hash
    };

    let blob = new Blob([JSON.stringify(jsonFile, null, 5)], {type: 'application/json'});

    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else {
        let elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = "signature_of_" + filename +".json";
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}

/**
 * Isolate the filename from the full path of the file
 *
 * @param fullPathName   full path of the file
 * @returns              the filename as a String
 */
function getFilename(fullPathName) {
    let charBackslachNumber = 0;
    let charPointNumber = fullPathName.length;

    for (let i = 0; i < fullPathName.length; i++) {
        // take off all characters before the last '\' (included itself)
        if (fullPathName[i] === "\\") {
            charBackslachNumber = i;
        }

        // take off all characters after the last '.'
        if (fullPathName[i] === '.') {
            charPointNumber = i;
        }
    }

    return fullPathName.slice(charBackslachNumber+1, charPointNumber);
}

/**
 * Return the extension name of the file
 *
 * @param file
 * @returns       the extension of the file as a String
 */
function getFileExtension(file) {
    let charPointNumber = 0;

    for (let i = 0; i < file.length; i++) {
        // take off all characters before the last '.'
        if (file[i] === '.') {
            charPointNumber = i;
        }
    }

    return file.slice(charPointNumber+1, file.length);
}

/**
 * Read the signature JSON file as a text and return it as an object
 *
 * @param text    signature JSON file
 * @returns {*}   JSON file as an object
 */
function getJSONFileInObject(text) {
    return JSON.parse(text);
}
