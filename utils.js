'use strict';

/**
 * Read a small json file and return it's data.
 * @see https://nodejs.org/fr/learn/manipulating-files/reading-files-with-nodejs
 * @param {*} file file to read.
 */
exports.readJsonAsync = async (file, format = 'utf8') => {
    let data = await promises.readFile(file, { encoding: format });
    return JSON.parse(data);
}

exports.readJsonSync = async (file, format = 'utf8') => {
    let data = await promises.readFile(file, { encoding: format });
    return JSON.parse(data);
}

exports.stringInBit = (data) => {
    const encoder = new TextEncoder(); // to utf8
    const encodedString = encoder.encode(data);

    return (encodedString.length * 8);
}

exports.runQuery = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) reject(new Error(err.message));
      else resolve(params);
    });
  });
}

exports.getQuery = (db, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(new Error(err.message));
      else resolve(row);
    })
  });
}

exports.formatHttpSuccess = (data) => {
  return {
    status: "success", 
    data: data
  }
}

exports.formatHttpError = (data) => {
  return {
    status: "error", 
    data: data
  }
}