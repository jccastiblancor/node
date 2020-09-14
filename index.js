const fs = require("fs");
const http = require("http");
const axios = require("axios");
const url = require("url");

const URL_proveedores =
  "https://gist.githubusercontent.com/josejbocanegra/d3b26f97573a823a9d0df4ec68fef45f/raw/66440575649e007a9770bcd480badcbbc6a41ba7/proveedores.json";
const URL_clientes =
  "https://gist.githubusercontent.com/josejbocanegra/986182ce2dd3e6246adcf960f9cda061/raw/f013c156f37c34117c0d4ba9779b15d427fb8dcd/clientes.json";
const proveedores_rows = ["idproveedor", "nombrecompania", "nombrecontacto"];
const clientes_rows = ["idCliente", "NombreCompania", "NombreContacto"];
let pageContent = "";

const renderTable = (html, json, rows, renderIn) => {
  let pageContent = html.toString();
  tableContent = "";
  json.map((obj) => {
    tableContent += `<tr>
          ${rows
            .map((row) => {
              return `<td> ${obj[row]} </td>`;
            })
            .join(" ")}
        </tr>`;
  });
  pageContent = pageContent.replace(renderIn, tableContent);
  return pageContent;
};

let renderFile = async (callback, file) => {
  fs.readFile(file + ".html", (err, data) => {
    pageContent = data.toString();
  });

  const proveedores = await axios.get(URL_proveedores);

  pageContent = renderTable(
    pageContent,
    proveedores.data,
    proveedores_rows,
    "{{proveedores_table_content}}"
  );

  clientes = await axios.get(URL_clientes);

  pageContent = renderTable(
    pageContent,
    clientes.data,
    clientes_rows,
    "{{clientes_table_content}}"
  );

  callback(pageContent);
};

http
  .createServer((req, res) => {
    var q = url.parse(req.url, true);
    console.log(q.pathname);

    if (q.pathname == "/") {
      renderFile((data) => {
        res.writeHead(200, { "Content-type": "text/html" });
        res.end(data.toString());
      }, "index");
    } else if (q.pathname == "/api/clientes") {
      renderFile((data) => {
        res.writeHead(200, { "Content-type": "text/html" });
        res.end(data.toString());
      }, "clientes");
    } else if (q.pathname == "/api/proveedores") {
      renderFile((data) => {
        res.writeHead(200, { "Content-type": "text/html" });
        res.end(data.toString());
      }, "proveedores");
    } else {
      res.writeHead(404, { "Content-Type": "text/html" });
      return res.end("404 Not Found");
    }
  })
  .listen(8081);
