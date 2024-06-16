"use strict";
let requestType = 'GET';

function validateInput(currentCharValue) {
    if(!currentCharValue.match("[-_a-zA-Z0-9\n=_.]")) event.preventDefault()
}

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

function validateParametersInput(payload) {
    if(payload === null || payload === undefined) {
        return payload;
    }

    const stringToObject = payload.split('\n').reduce((obj, line) => {
        const [key, value] = line.split('=').map(item => item.trim());
        const parsedFloat = parseFloat(value);
        const typeValue = isNaN(parsedFloat) ? value : parsedFloat;
        return key && value ? { ...obj, [key]: typeValue } : obj;
      }, {});

    const sortedValues = {};
    Object.keys(stringToObject).sort().forEach(key => {
        sortedValues[key] = stringToObject[key];
    });

    return sortedValues;
}

async function sendData() {
    const signHeaders = {
        'X-Merchant-Id': document.getElementById("merchantId").value,
        'X-Nonce': generateId(30),
        'X-Timestamp': Math.floor(Date.now() / 1000),
    };
    const payload = validateParametersInput(document.getElementById('payload').value);
    const stringForSign = new URLSearchParams({...signHeaders, ...payload}).toString();
    console.log(CryptoJS.HmacSHA1(stringForSign, inputMerchKey.value))
    const requestHeaders = {
        'Content-Type': document.getElementById("contentType").value,
        'X-Sign': CryptoJS.HmacSHA1(stringForSign, inputMerchKey.value).toString(CryptoJS.enc.Hex),
        ...signHeaders
    }
    await fetch("http://skylibman-backend-den-67.deno.dev", {
        method: 'POST',
        body: JSON.stringify({url: document.getElementById("apiUrl").value, method: requestType, headers: requestHeaders, body: payload}),
    })

    // if(requestType === 'GET') {
    //     const params = new URLSearchParams(payload).toString(); 
    //     await fetch(document.getElementById("apiUrl").value + '?' + params, {
    //         method: document.getElementById("checkboxLabel").innerHTML,
    //         headers: requestHeaders
    //     })
    // } else if(requestType === 'POST') {
        
    // }
    
}


const applicantForm = document.getElementById('input-form')
// applicantForm.addEventListener('submit', handleFormSubmit)

function handleFormSubmit(event) {
    event.preventDefault()
    const data = serializeForm(applicantForm)
    const headers = {
        
    };
    const requestParams = {
        'game_uuid': 'asdsadsad',
        'player_id': 'asdsadasdasasd',
        'player_name': 'asdadasdad',
        'currency': 'asdadasd',
        'session_id': 'asdadadasdasd'
    }

    let mergedParams = {...requestParams, ...headers}
    Object.keys(mergedParams).sort().forEach(function(key) {
        let value = mergedParams[key];
        delete mergedParams[key];
        mergedParams[key] = value;
    });
    let hashString = new URLSearchParams(mergedParams).toString();

    let XSign = "hello";

    //console.log("XSign: ", XSign.toString())
    
    /*
    const response = await sendData(data)
    */
}

function serializeForm(formNode) {
    const { elements } = formNode
    const data = Array.from(elements)
        .filter((item) => !!item.name)
        .map((element) => {
            const { name, value } = element
  
            return { name, value }
        })   
    return data
}

function dec2hex (dec) {
    return dec.toString(16).padStart(2, "0")
}
  
function generateId (len) {
    let arr = new Uint8Array((len || 40) / 2)
    window.crypto.getRandomValues(arr)
    return Array.from(arr, dec2hex).join('')
}

