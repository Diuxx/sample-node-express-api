
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





// ================= listeners =================
document.addEventListener('DOMContentLoaded', () => {
    // --
});





// ================= Functions =================

/**
 * Connect to api and retrieve data.
 */
async function connectApi() {
    const key = await retrieveApiKey();
    console.log(key);

    // this.connect(mock_api_key);
    // if (!element_input_apiKey.value) {
    //     setSampleId(mock_api_key);
    // }
}

function autoConnect() {
    // if (!this.isConnected()) 
    //     return;
    // const idKey = localStorage.getItem(localStorageKey);
    this.connect(idKey);
}

async function retrieveApiKey(userUid) {
    const url = `${apiUrl}/retrieve`;
    try {
        var response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
        }

        const data = await response.json(); // data.key
        return data.key;
    } 
    catch (err) {
        console.error("Erreur lors de la récupération des données :", error);
    }
}

function connect(key = null) {
    const apiKey = key || element_input_apiKey.value;
    const url = `${apiUrl}/${apiKey}`;

    if (!apiKey) {
        displayMessage('veuillez saisir une clé d\'API.', 'm-error');
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


function showExample() {
    element_pre_example_editor_code.innerHTML = Prism.highlight(JSON.stringify(example, null, 4), Prism.languages.json, 'json');
    element_pre_example_editor.style.display = 'block';
    element_div_example_size.innerText = `${getStringSizeInKB(JSON.stringify(example))} / ${maxSize} kb`
    Prism.highlightAll();
}

function removeExample() {
    element_pre_example_editor.style.display = 'none'
    element_div_example_size.innerText = '';
}

function getStringSizeInKB(str) {
    const sizeInBytes = new TextEncoder().encode(str).length;
    // (sizeInBytes / 1024).toFixed(2);
    return sizeInBytes;
}



