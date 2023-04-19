const fs = require("fs");

const cache = [];
const writeSocketObjectToFile = (socket) => {
  const json = JSON.stringify(
    socket,
    (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (cache.includes(value)) {
          return "[Circular]";
        }
        cache.push(value);
      }
      return value;
    },
    2
  );

  fs.writeFile("example.json", json, (err) => {
    if (err) throw err;
    console.log("Data written to file");
  });
};
module.exports = writeSocketObjectToFile;
