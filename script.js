"use strict";

let requestType = 'GET';

// Get references to the input fields and the submit button
const inputMerchId = document.getElementById('merchantId');
const inputMerchKey = document.getElementById('merchantKey');
const submitBtn = document.getElementById('submitBtn');

// Add event listeners to the input fields
inputMerchId.addEventListener('input', toggleSubmitButton);
inputMerchKey.addEventListener('input', toggleSubmitButton);

// Function to toggle the submit button based on input values
function toggleSubmitButton() {
    // Check if both input fields are not empty
    if (inputMerchId.value.trim() !== '' && inputMerchKey.value.trim() !== '') {
        // Enable the submit button
        submitBtn.removeAttribute('disabled');
    } else {
        // Disable the submit button
        submitBtn.setAttribute('disabled', true);
    }
}

function changeRequestType(element) {
    requestType = requestType === 'GET' ? 'POST' : 'GET';
    element.innerHTML = requestType;
}

// function validateParametersInput(payload) {
//     if(payload === null || payload === undefined) {
//         return payload;
//     }

//     const stringToObject = payload.split('\n').reduce((obj, line) => {
//         const [key, value] = line.split('=').map(item => item.trim());
//         const parsedFloat = parseFloat(value);
//         const typeValue = isNaN(parsedFloat) ? value : parsedFloat;
//         return key && value ? { ...obj, [key]: typeValue } : obj;
//       }, {});

//     const sortedValues = {};
//     Object.keys(stringToObject).sort().forEach(key => {
//         sortedValues[key] = stringToObject[key];
//     });

//     return sortedValues;
// }

// Function to recursively sort object keys
function sortObjectKeys(obj) {
    if (typeof obj !== "object" || obj === null) {
        return obj; // Base case: return non-object values directly
    }

    // Create a new object to store sorted key-value pairs
    var sortedObj = Array.isArray(obj) ? [] : {};

    // Sort keys and iterate over them
    Object.keys(obj).sort().forEach(function(key) {
        // Recursively sort nested objects
        sortedObj[key] = sortObjectKeys(obj[key]);
    });

    return sortedObj;
}

function addNestedParams(params, key, value) {
    if(typeof value === 'boolean') {
        value = +value;
    }

    if (Array.isArray(value)) {
        value.forEach((val, i) => {
            addNestedParams(params, `${key}[${i}]`, val);
        });
    } else if (typeof value === 'object' && value !== null) {
        Object.keys(value).forEach(k => {
            addNestedParams(params, `${key}[${k}]`, value[k]);
        });
    } else {
        params.append(key, value);
    }
}

function createURLSearchParamsString(data) {
    const params = new URLSearchParams();
    Object.keys(data).forEach(key => {
        addNestedParams(params, key, data[key]);
    });
    return params.toString();
}

async function sendData() {
    const signHeaders = {
        'X-Merchant-Id': document.getElementById("merchantId").value,
        'X-Nonce': generateId(30),
        'X-Timestamp': Math.floor(Date.now() / 1000),
    };
    const payloadTextArea = document.getElementById('payload');
    let payloadContents;
    try {
        payloadContents = JSON.parse(payloadTextArea.value);
    } catch(error) {
        if(payloadTextArea.value) {
            payloadTextArea.classList.add("border-2", "border-red-500");
            return;
        }
    }
    payloadTextArea.classList.remove("border-2", "border-red-500");

    payloadContents = sortObjectKeys(payloadContents);
    const stringForSign = createURLSearchParamsString({...signHeaders, ...payloadContents});

    const xSign = CryptoJS.HmacSHA1(stringForSign, inputMerchKey.value).toString(CryptoJS.enc.Hex);
    const requestHeaders = {
        'Content-Type': document.getElementById("contentType").value,
        'X-Sign': xSign,
        ...signHeaders
    }

    const response = await fetch("https://gateway-to-freedom.deno.dev", {
    // await fetch("http://localhost:8000", {
        method: 'POST',
        body: JSON.stringify({url: document.getElementById("apiUrl").value, method: requestType, headers: requestHeaders, body: payloadContents}),
    });
    const data = await response.json();
    const jsonResponse = JSON.stringify(data, null, 2);
    const jsonSignCheck = JSON.stringify({"stringForSign": stringForSign, "X-Sign": xSign}, null, 2);

    // Insert JSON content into the code block
    const codeBlock = document.querySelector('#code-block');
    codeBlock.textContent = jsonSignCheck + "\n\n" + jsonResponse;

    // Set defaults for the Normalize Whitespace plugin
    Prism.plugins.NormalizeWhitespace.setDefaults({
        'remove-trailing': true,
        'remove-indent': true,
        'left-trim': true,
        'right-trim': true,
    });

    // Apply syntax highlighting
    Prism.highlightAll();
}

function dec2hex (dec) {
    return dec.toString(16).padStart(2, "0")
}
  
function generateId (len) {
    let arr = new Uint8Array((len || 40) / 2)
    window.crypto.getRandomValues(arr)
    return Array.from(arr, dec2hex).join('')
}

