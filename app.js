export default function initApp(express, bodyParser, createReadStream, crypto, http) {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,OPTIONS,DELETE');
    next();
  });

  const LOGIN = "amaenai1_";

  app.all('/login/', (req, res) => res.send(LOGIN));

  app.all('/code/', (req, res) => {
    try {
      const path = new URL(import.meta.url).pathname;
      const filePath = path.startsWith('/') ? path.substring(1) : path;
      createReadStream(filePath).pipe(res);
    } catch (e) {
      res.send(LOGIN);
    }
  });

  app.all('/sha1/:input/', (req, res) => {
    const hash = crypto.createHash('sha1');
    hash.update(req.params.input);
    res.send(hash.digest('hex'));
  });

  app.all('/req/', (req, res) => {
    let addr = req.query.addr;
    if (req.method === 'POST') {
      addr = req.body?.addr || addr;
    }
    if (!addr) return res.send(LOGIN);

    http.get(addr, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => res.send(data));
    }).on('error', () => res.send(LOGIN));
  });

  app.use((req, res) => res.send(LOGIN));

  return app;
}
