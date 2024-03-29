const fs = require('fs');
const path = require('path');
const http = require('http');
const fsExtra = require('fs-extra');
const url = require('url');
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');
////////////////////////FILES//////////////////////////////
// //reading and writing the file in synchronous way
// const readedFile = fs.readFileSync(
//   path.join(__dirname, "./txt/read-this.txt"),
//   "utf-8"
// );
// const writedFile = fs.writeFileSync(
//   path.join(__dirname, "./txt/writedFile.txt"),
//   `The Written file document is ${readedFile}\n Document creaded time ${Date.now()}`
// );
// reading and writing the file in asynchronous way
// fs.readFile(
//   path.join(__dirname, "./txt/read-this.txt"),
//   "utf-8",
//   (err, data1) => {
//     if (err) console.log(err);
//     fs.writeFile(
//       path.join(__dirname, "/txt/writtenFileAsync.txt"),
//       `The file that is written asynchronously is: ${data1} \n Created at ${Date.now()}`,
//       (err) => {
//         if (err) console.log(err);
//         console.log("File written successfully");
//       }
//     );
//   }
// );
//Moving the file to the desktop
const transfer = async (src, dest) => {
  await fsExtra.move(src, dest, { overwrite: true });
  console.log('Successfully transfered ');
};
// transfer("./../../../txt", "./txt");
////////////////////////////////////SERVER////////////////////////////////////
const readedFileSync = fs.readFileSync(
  `${__dirname}/dev-data/data.json`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);
const dataObj = JSON.parse(readedFileSync);
//slugify conversion codes
// console.log(slugify('Advanced Template Blog', { lower: true }));
const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);
  if (pathname === '/' || pathname === '/overview') {
    //overview page
    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join('');
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
    res.end(output);
  } else if (pathname === '/product') {
    //tour page
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);
  } else if (pathname === '/api') {
    //api
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(readedFileSync);
  } else {
    //handling the 404 page not found errors
    res.writeHead(400, { 'Content-type': 'text/html' });
    res.end('<h1>Page not found</h1>');
  }
});
server.listen(3000, '127.0.0.1', () => {
  console.log('App listening on port 3000');
});
