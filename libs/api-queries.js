
const example = {
    "users": [
        {
            "pseudo": "Nicolas",
            "mail": "nico.dev@gmail.com",
        },
        {
            "pseudo": "Eric",
            "mail": "eric.dev@gmail.com" 
        }
    ],
    "cars": [
        {
            "name": 'big blue',
            "owner": "eric.dev@gmail.com"
        }
    ],
    "texts": {
        "welcome": "Welcome on the best website on the planet.",
        "message": "This is a sample."
    },
    "visits": "9",
    "account": "2"
}

// ================= variables =================
const mock_api_key = "32c3707f-4ee4-491a-93a6-9ca6b828014b";
const apiUrl = 'http://localhost:3000/sample';
const maxSize = 2048; // kb
const localStorageKey = 'apiKey';

// ================= html elements =================
const element_input_apiKey = document.getElementById("api-key");

// examples
const element_pre_example_editor = document.getElementById("editor-example");
const element_pre_example_editor_code = document.getElementById("example-editable-code");
const element_div_example_size = document.getElementById("size-example");

const element_pre_editor = document.getElementById("editor");
const element_pre_editor_code = document.getElementById("editable-code");
const element_div_size = document.getElementById("size");

// ================= listeners =================
document.addEventListener('DOMContentLoaded', () => {
    // --
});

// ================= Functions =================

/**
 * Connect to api and retrieve data.
 */
async function connectApi(uid, name) {
    // hide as load.
    hideAllElements('.disconnected');
    hideAllElements('.connected-google-only');

    // show load.. 

    const result = await retrieveApiKey(uid, name);
    if (result) {
        console.log(result.key);

        // update ihm.
        displayAllElements('.connected');
        showData(result);

        // persist connection
        this.persistConnection(result.key);
    } 
    else {
        showNotification('Unable to connect the web service.', 'error');
        hideAllElements('.disconnected');
        displayAllElements('.connected-google-only');
    }
}

/**
 * Get api key and data.
 * @param {*} uid the google id.
 * @param {*} name the user google name.
 * @returns the apikey and data.
 */
async function retrieveApiKey(uid, name) {
    const url = `${apiUrl}/retrieve`;
    try {
        var response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "google_uid": uid, "google_name": name })
        });
        if (!response.ok) {
            throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
        }
        return await response.json();
    } 
    catch (err) {
        console.error(err);
        return null;
    }
}

/**
 * Get data with the given api key.
 * @param {*} key the api key.
 * @returns 
 */
function connect(key = null) {
    const apiKey = key || element_input_apiKey.value;
    const url = `${apiUrl}/${apiKey}`;

    if (!apiKey) {
        displayMessage('Please enter your api key.', 'm-error');
        return;
    }

    fetch(url)
        .then(async response => {
            if (!response.ok) {
                err = await response.json()
                throw new Error(err.message);
            }
            return response.json();
        })
        .then(data => {
            console.log("Résultat de la requête :", data, );
            code.innerHTML = Prism.highlight(JSON.stringify(data, null, 4), Prism.languages.json, 'json');
            editor.style.display = 'block';
            Prism.highlightAll();
            this.persistConnection(apiKey);
        })
        .catch(error => {
            console.error("Erreur lors de la requête :", error);
            if (error?.error) {
                displayMessage(`Error: ${error.error.message}`, 'm-error');
            }
            else 
                displayMessage(`Error: ${error.message}`, 'm-error');
        });
}

async function saveCode() {
    const key = this.getKey();
    const url = `http://localhost:3000/sample/${key}`;

    if (!isValidJSON(code.textContent)) {
        console.error("Invalid json.");
        displayMessage("Unable to save cause of invalid json file.", 'm-error');
        return;
    }

    const data = { content: JSON.stringify(JSON.parse(code.textContent)) };
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        displayMessage("Your code has been saved successfully.", 'm-success');
        console.log(result);
    } 
    catch (error) {
        displayMessage(error.message, 'm-error');
        console.error(error);
    }
}

function showExample() {
    element_pre_example_editor_code.innerHTML = Prism.highlight(JSON.stringify(example, null, 4), Prism.languages.json, 'json');
    element_pre_example_editor.style.display = 'block';
    element_div_example_size.innerText = `key: f58b6c3c-6650-48de-9204-84274a0c0ba7 | ${getStringSizeInKB(JSON.stringify(example))} / ${maxSize} kb`
    Prism.highlightAll();
}

function removeExample() {
    element_pre_example_editor.style.display = 'none'
}

function showData(result) {
    element_pre_editor_code.innerHTML = Prism.highlight(JSON.stringify(result.data, null, 4), Prism.languages.json, 'json');
    element_pre_editor.style.display = 'block';
    element_div_size.innerText = `key: ${result.key} | ${getStringSizeInKB(JSON.stringify(result.data))} / ${maxSize} kb`
    Prism.highlightAll();
}

function getStringSizeInKB(str) {
    const sizeInBytes = new TextEncoder().encode(str).length;
    return sizeInBytes; // (sizeInBytes / 1024).toFixed(2);
}

function displayAllElements(classElement) {
    const elements = document.querySelectorAll(classElement);
    elements.forEach(element => element.style.display = 'flex');
}

function hideAllElements(classElement) {
    const elements = document.querySelectorAll(classElement);
    elements.forEach(element => element.style.display = 'none');
}

function persistConnection(key) {
    localStorage.setItem('key', key);
}

function getKey() {
    return localStorage.getItem('key');
}

function removeKeyFromStorage() {
    localStorage.clear();
}

function isLocalStorageSet() {
    return localStorage.getItem('key') != null ? true : false;
}