import { createServer, get as httpGet } from "http";
import { get as httpsGet } from "https";
import { parse } from "url";

function initPromise() {
  const p = {};
  p.promise = new Promise((r, t) => {
    p.resolve = r;
    p.reject = t;
  });
  return p;
}

function load(target) {
  const { resolve, reject, promise } = initPromise();
  const get = target.startsWith("https") ? httpsGet : httpGet;
  get(target, (res) => {
    const obj = { status: res.statusCode, data: "", message: "" };
    const data = [];
    res.on("data", (chunk) => data.push(chunk));
    res.on("end", () => {
      (obj.data = Buffer.concat(data).toString()), resolve(obj);
    });
  }).on("error", (err) => {
    obj.message = err.message;
    resolve(obj);
  });

  return promise;
}

function start(port) {
  console.log("http://localhost:" + port);
  createServer((req, res) => {
    const parts = parse(req.url, true);
    const query = parts.query;

    if (
      query.url &&
      ["https://", "http://"].find((h) => query.url.startsWith(h))
    ) {
      load(query.url).then((obj) => {
        res.write(obj.data);
        res.end();
      });
    } else {
      res.write("ok");
      res.end();
    }
  }).listen(port);
}

start(8080);
