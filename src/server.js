const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '..', 'client');

const statusMessages = {
  success: { code: 200, message: 'This is a successful response' },
  badRequestMissing: { code: 400, message: 'Missing valid query parameter set to true', id: 'badRequest' },
  badRequestOk: { code: 200, message: 'This request has the required parameters' },
  unauthorizedMissing: { code: 401, message: 'Missing loggedIn query parameter set to yes', id: 'unauthorized' },
  unauthorizedOk: { code: 200, message: 'You have successfully viewed the content.' },
  forbidden: { code: 403, message: 'You do not have access to this content.', id: 'forbidden' },
  internal: { code: 500, message: 'Internal Server Error. Something went wrong.', id: 'internalError' },
  notImplemented: { code: 501, message: 'A get request for this page has not been implemented yet. Check again later for updated content.', id: 'notImplemented' },
  notFound: { code: 404, message: 'The page you are looking for was not found.', id: 'notFound' },
};

const wantsXML = (req) => {
  const accept = req.headers.accept || '';
  return accept.includes('xml') && !accept.includes('json');
};

const respond = (req, res, status, message, id) => {
  if (wantsXML(req)) {
    let xml = `<response><message>${message}</message>`;
    if (id) xml += `<id>${id}</id>`;
    xml += '</response>';
    console.log(xml);
    res.writeHead(status, { 'Content-Type': 'application/xml' });
    res.end(xml);
  } else {
    const obj = id ? { message, id } : { message };
    const json = JSON.stringify(obj);
    console.log(json);
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(json);
  }
};

const sendFile = (req, res, filePath, contentType) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      respond(req, res, statusMessages.notFound.code, statusMessages.notFound.message, statusMessages.notFound.id);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
};

const getIndex = (req, res) => sendFile(req, res, path.join(clientDir, 'client.html'), 'text/html');
const getCSS = (req, res) => sendFile(req, res, path.join(clientDir, 'style.css'), 'text/css');
const getClientJS = (req, res) => sendFile(req, res, path.join(clientDir, 'client.js'), 'application/javascript');

const handleSuccess = (req, res) => {
  const s = statusMessages.success;
  respond(req, res, s.code, s.message);
};

const handleBadRequest = (req, res, query) => {
  if (query.valid === 'true') {
    const s = statusMessages.badRequestOk;
    respond(req, res, s.code, s.message);
  } else {
    const s = statusMessages.badRequestMissing;
    respond(req, res, s.code, s.message, s.id);
  }
};

const handleUnauthorized = (req, res, query) => {
  if (query.loggedIn === 'yes') {
    const s = statusMessages.unauthorizedOk;
    respond(req, res, s.code, s.message);
  } else {
    const s = statusMessages.unauthorizedMissing;
    respond(req, res, s.code, s.message, s.id);
  }
};

const handleForbidden = (req, res) => {
  const s = statusMessages.forbidden;
  respond(req, res, s.code, s.message, s.id);
};

const handleInternal = (req, res) => {
  const s = statusMessages.internal;
  respond(req, res, s.code, s.message, s.id);
};

const handleNotImplemented = (req, res) => {
  const s = statusMessages.notImplemented;
  respond(req, res, s.code, s.message, s.id);
};

const handleNotFound = (req, res) => {
  const s = statusMessages.notFound;
  respond(req, res, s.code, s.message, s.id);
};

const onRequest = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname, query } = parsedUrl;

  switch (pathname) {
    case '/':
      getIndex(req, res);
      break;
    case '/style.css':
      getCSS(req, res);
      break;
    case '/client.js':
      getClientJS(req, res);
      break;
    case '/success':
      handleSuccess(req, res);
      break;
    case '/badRequest':
      handleBadRequest(req, res, query);
      break;
    case '/unauthorized':
      handleUnauthorized(req, res, query);
      break;
    case '/forbidden':
      handleForbidden(req, res);
      break;
    case '/internal':
      handleInternal(req, res);
      break;
    case '/notImplemented':
      handleNotImplemented(req, res);
      break;
    default:
      handleNotFound(req, res);
      break;
  }
};

const port = process.env.PORT || process.env.NODE_PORT || 3000;
http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
