'use strict';

/**
 * Read a small json file and return it's data.
 * @see https://nodejs.org/fr/learn/manipulating-files/reading-files-with-nodejs
 * @param {*} file file to read.
 */
export async function readJsonAsync(file, format = 'utf8') {
    let data = await promises.readFile(file, { encoding: format });
    return JSON.parse(data);
}

export async function readJsonSync(file, format = 'utf8') {
    let data = await promises.readFile(file, { encoding: format });
    return JSON.parse(data);
}

export function stringInBit(string) {
    // Encodage de la chaîne en UTF-8
    const encoder = new TextEncoder();
    const encodedString = encoder.encode(string);

    // Taille en bits (chaque octet = 8 bits)
    const sizeInBits = encodedString.length * 8;

    return sizeInBits;
}