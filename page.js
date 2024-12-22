// elements
const modal_yn = document.getElementById('modal-yn');
const modal_yn_title = document.getElementById('modal-yn-title');
const openModalBtn = document.getElementById('open-modal-btn');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const apiKey_field =  document.getElementById("api-key");
const code = document.getElementById('editable-code');
const editor = document.getElementById('editor');

// listeners
code.addEventListener('input', () => {
    highlightWithoutMovingCursor();
});

code.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
        event.preventDefault(); // Prevent the default tab behavior

        // Insert 4 spaces at the cursor position
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const spaceNode = document.createTextNode('    '); // 4 spaces

        range.insertNode(spaceNode); // Insert the spaces
        range.setStartAfter(spaceNode); // Move cursor after the spaces
        range.setEndAfter(spaceNode);

        selection.removeAllRanges(); // Clear existing selections
        selection.addRange(range); // Add the updated range
    }

    if (event.key === 'Enter') {
        console.log('press enter.');
        event.preventDefault(); // Empêche le comportement par défaut de "Enter"

        const selection = window.getSelection();
        const range = selection.getRangeAt(0);

        // Récupère le texte avant le curseur
        const currentNode = range.startContainer;
        const textBeforeCursor = currentNode.textContent.slice(0, range.startOffset);

        // Calcule l'indentation (espaces ou tabulations) de la ligne précédente
        const match = textBeforeCursor.match(/^[\t ]*/);
        const indentation = match ? match[0] : '';

        // Insère une nouvelle ligne avec la même indentation
        const newLine = document.createTextNode(`\n${indentation}`);
        range.insertNode(newLine);

        // Place le curseur après la nouvelle ligne
        range.setStartAfter(newLine);
        range.setEndAfter(newLine);

        // Met à jour la sélection
        selection.removeAllRanges();
        selection.addRange(range);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // --
});

/**
 * Set the sample id (api key).
 * @param {*} sampleId 
 */
function setSampleId(sampleId) {
    apiKey_field.value = sampleId;
}

/**
 * 
 */
function refreshApiKey() {
    const apiKey = document.getElementById('api-key').value;
    alert('API Key refreshed: ' + apiKey);
}

/**
 * disconnect.
 * @returns 
 */
async function quitter() {
    // display message
    const response = await showModal('Are you sure to disconnect ?');
    if (response == 'no') 
      return;
    this.disconnect();
}

/**
 * Display the modal on screen
 * @param {*} text 
 * @returns 
 */
function showModal(text = 'no text set.') {
    return new Promise((resolve) => {
        modal_yn_title.textContent = text;
        modal_yn.style.display = 'flex';

        const handleYes = () => {
            resolve('yes');
            closeModal();
        };

        const handleNo = () => {
            resolve('no');
            closeModal();
        };

        yesBtn.addEventListener('click', handleYes, { once: true });
        noBtn.addEventListener('click', handleNo, { once: true });
    });
}

function closeModal() {
    modal_yn.style.display = 'none';
}


function getStringFromCodeTag(tagId) {
    const element = document.getElementById(tagId);
    if (element) {
        return element.innerText.replace(/\n/g, '').trim();
    }
    return null;
}

/**
 * display error/success message in label text.
 * @param {*} message 
 * @param {*} element 
 */
function displayMessage(message, element) {
    document.getElementById(element).innerText = message;
    document.getElementById(element).style.display = 'block';
    setTimeout(() => {
        document.getElementById(element).style.display = "none";
    }, 2000);
}

function isValidJSON(jsonString) {
  try {
    JSON.parse(jsonString);
    return true;
  }
  catch (error) {
    return false;
  }
}

// Save the cursor position
function saveCursorPosition(element) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(element);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    return start;
}

// Restore the cursor position
function restoreCursorPosition(element, position) {
    const selection = window.getSelection();
    let currentNode = element.firstChild;
    let currentOffset = 0;

    while (currentNode && position > 0) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
        if (currentNode.length >= position) {
        currentOffset = position;
        break;
        } else {
        position -= currentNode.length;
        }
    } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const childLength = currentNode.textContent.length;
        if (childLength >= position) {
        currentNode = currentNode.firstChild;
        continue;
        } else {
        position -= childLength;
        }
    }
    currentNode = currentNode.nextSibling;
    }

    const range = document.createRange();
    range.setStart(currentNode || element, currentOffset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
}

// Highlight content without moving the cursor
function highlightWithoutMovingCursor() {
    const cursorPosition = saveCursorPosition(code); // Save cursor
    Prism.highlightElement(code); // Highlight with Prism.js
    restoreCursorPosition(code, cursorPosition); // Restore cursor
}