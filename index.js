const http = require('http');
const fs = require('fs');
const path = require('path');

const mime = {
  'html': 'text/html',
  'css': 'text/css',
  'jpg': 'image/jpg',
  'ico': 'image/x-icon',
  'mp3': 'audio/mpeg3',
  'mp4': 'video/mp4'
};

const PORT = process.env.PORT || 8888;

const servidor = http.createServer((pedido, respuesta) => {
  const url = new URL('http://localhost:' + PORT + pedido.url);
  let camino = 'public' + url.pathname;
  if (camino == 'public/')
    camino = 'public/index.html';
  encaminar(pedido, respuesta, camino);
});

servidor.listen(PORT, () => {
  console.log(`Servidor web iniciado en el puerto ${PORT}`);
});

function encaminar(pedido, respuesta, camino) {
  console.log(camino);
  switch (camino) {
    case 'public/recuperardatos': {
      recuperar(pedido, respuesta);
      break;
    }
    default: {
      fs.stat(camino, (error, stats) => {
        if (!error) {
          if (stats.isDirectory()) {
            camino = path.join(camino, 'index.html');
          }
          fs.readFile(camino, (error, contenido) => {
            if (error) {
              respuesta.writeHead(500, { 'Content-Type': 'text/plain' });
              respuesta.write('Error interno');
              respuesta.end();
            } else {
              const vec = camino.split('.');
              const extension = vec[vec.length - 1];
              const mimearchivo = mime[extension] || 'text/plain';
              respuesta.writeHead(200, { 'Content-Type': mimearchivo });
              respuesta.write(contenido);
              respuesta.end();
            }
          });
        } else {
          respuesta.writeHead(404, { 'Content-Type': 'text/html' });
          respuesta.write('<!doctype html><html><head></head><body>Recurso inexistente</body></html>');
          respuesta.end();
        }
      });
    }
  }
}

function idiomaP(mensajeX) {

  if (mensajeX === null) {
    return "Mensaje es null";
  }
  const vocal = ["a", "e", "i", "o", "u"];
  const mensaje = [];

  for (let i = 0; i < mensajeX.length; i++) {
    const caracter = mensajeX[i].toLowerCase();

    mensaje.push(caracter);

    if (vocal.includes(caracter)) {
      mensaje.push("p", caracter);
    }
  }
  return mensaje.join("");
}

function recuperar(pedido, respuesta) {
  let info = '';
  pedido.on('data', dato => {
    info += dato;
  });
  pedido.on('end', () => {
    const formulario = new URLSearchParams(info);
    const mensaje = formulario.get('mensaje');
    const resultado = idiomaP(mensaje);

    respuesta.writeHead(200, { 'Content-Type': 'text/html' });

    const pagina = `<!doctype html><html><head></head><body>Idioma P: ${resultado}<br></body></html>`;
    respuesta.end(pagina);
  });
}
