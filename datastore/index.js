const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');
const fsasync = Promise.promisifyAll(fs);

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create1 = (text, callback) => {
  counter.getNextUniqueId((err, id)=>{
    // items[cs] = text;
    if (err) {
      throw 'error';
    } else {
      var filePath = path.join(exports.dataDir, id + '.txt');
      fs.writeFile(filePath, text, (err)=> {
        if (err) {
          callback(err, null);
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};

exports.create = (text, callback) => {
  var idd;
  var promise1 = new Promise((resolve, reject) => {
    counter.getNextUniqueId((err, id)=> {
      if (err) {
        reject(err);
      } else {
        resolve(id);
      }
    });
  });
  promise1.then((id)=>{
    idd = id;
    var filePath = path.join(exports.dataDir, id + '.txt');
    console.log(id, ' is id and filepath is', filePath);
    return fsasync.writeFileAsync(filePath, text);
  }).then(()=>{
    callback(null, {id, text});
  }).catch((err)=>{
    callback(err, null);
  });
};

// exports.readAll1 = (callback) => {
//   fs.readdir(exports.dataDir, (err, files) => {
//     if (err) {
//       throw 'Unable to Read All';
//     } else {
//       //map
//       //iterate thorugh each file in files
//       //split the file into an id string and txt string
//       // set the id string to id
//       var promises = files.map((file) => {
//         var id = file.split('.')[0];
//         return exports.readOneAsync(id);
//       });
//       Promise.all(promises).then((values)=> { callback(err, values); } ).catch((err)=>callback(err));
//     }
//   });
// };

exports.readAll = (callback) => {
  fsasync.readdirAsync(exports.dataDir)
    .then((files) => {
      var promises = files.map((file) => {
        var id = file.split('.')[0];
        return exports.readOneAsync(id);
      });
      return Promise.all(promises);
    }).then((values)=> {
      callback(null, values);
    }).catch((err)=>callback(err));
};

exports.readOne = (id, callback) => {
  // fs read dir which gets us an array of all the files in the folder
  // we see if id is in the array of files
  // if it is access file and read txt
  // if not throw error and say file not inside
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      callback(err, null);
    } else {
      if (files.includes(id + '.txt')) {
        fs.readFile(exports.dataDir + '/' + id + '.txt', 'utf-8', (err, data) => {
          if (err) {
            callback(err, null);
          } else {
            var idObj = {id, text: data};
            callback(null, idObj);
          }
        });
      } else {
        console.log('files does not exist');
        callback(new Error(), null);
      }
      //map
      //iterate thorugh each file in files
      //split the file into an id string and txt string
      // set the id string to id

    }
  });
  // var text = items[id];
  // if (!text) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   callback(null, { id, text});
  // }
};

exports.readOneAsync = Promise.promisify(exports.readOne);

exports.update = (id, text, callback) => {
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      callback(err, null);
    } else {
      if (files.includes(id + '.txt')) {
        fs.writeFile(exports.dataDir + '/' + id + '.txt', text, (err, data) => {
          if (err) {
            callback(err, null);
          } else {
            var idObj = {id, text: data};
            callback(null, idObj);
          }
        });
      } else {
        console.log('files does not exist');
        callback(new Error(), null);
      }
      //map
      //iterate thorugh each file in files
      //split the file into an id string and txt string
      // set the id string to id

    }
  });
  // var item = items[id];
  // if (!item) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   items[id] = text;
  //   callback(null, { id, text });
  // }
};

exports.delete = (id, callback) => {
  fs.unlink(exports.dataDir + '/' + id + '.txt', (error) => {
    callback(error);
  });
  // var item = items[id];
  // delete items[id];
  // if (!item) {
  //   // report an error if item not found
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   callback();
  // }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
