#!/usr/bin/env python3
"""Ajedrez RTS: servidor de red local (LAN).

Corre en una PC de la red (por ejemplo la de Linux Mint) y hace dos cosas:
  1. Sirve el juego (ajedrez-rts*.html y ajedrez-rts-tutorial*.js de esta carpeta)
     para abrirlo desde cualquier equipo de la red: http://IP-de-esta-PC:8765
  2. Reenvía los mensajes del modo Online (lobby, invitaciones y partida) entre
     los equipos conectados, por WebSocket en /ws.

Seguridad:
  - Solo atiende a equipos de la red local (10.x, 172.16-31.x, 192.168.x, 169.254.x
    y esta misma PC). Cualquier otra dirección se corta sin responder.
  - Solo acepta conexiones de juego desde páginas de la red local o abiertas como archivo.
  - Solo sirve esos dos archivos (nada más de la carpeta) y solo reenvía mensajes del juego.
  - No se conecta a internet ni guarda nada.

Uso:  python3 ajedrez-rts-lan.py            (puerto 8765)
      python3 ajedrez-rts-lan.py --port 9000
Necesita Python 3.8 o más nuevo (Linux Mint ya lo trae). No hay que instalar nada.
"""
import argparse
import asyncio
import base64
import glob
import hashlib
import ipaddress
import json
import os
import socket
import struct
from urllib.parse import urlparse

GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
DIR = os.path.dirname(os.path.abspath(__file__))
TOPIC_PREFIX = 'ajedrezrts/'
MAX_MSG = 512 * 1024          # tamaño máximo de un mensaje del juego
MAX_BUFFER = 4 * 1024 * 1024  # si un equipo no da abasto y se acumula esto, se lo desconecta
clients = set()


def private_ip(host):
    """¿Es una dirección de la red local (o de esta misma PC)?"""
    try:
        ip = ipaddress.ip_address(str(host).split('%')[0])
    except ValueError:
        return False
    if getattr(ip, 'ipv4_mapped', None):
        ip = ip.ipv4_mapped
    return ip.is_private or ip.is_loopback or ip.is_link_local


def origin_ok(origin):
    """Página que abre la conexión: archivo local (Origin "null") o servida desde la red local."""
    if not origin or origin == 'null':
        return True
    host = (urlparse(origin).hostname or '').lower()
    return host == 'localhost' or host.endswith('.local') or private_ip(host)


def newest(pattern):
    """El archivo más nuevo que coincide (sirve aunque se llame ajedrez-rts(33).html)."""
    files = [f for f in glob.glob(os.path.join(DIR, pattern)) if os.path.isfile(f)]
    return max(files, key=os.path.getmtime) if files else None


def lan_ips():
    """Direcciones de esta PC en la red local. El truco UDP no manda ningún paquete."""
    ips = set()
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('10.254.254.254', 1))
        ips.add(s.getsockname()[0])
        s.close()
    except OSError:
        pass
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            ips.add(info[4][0])
    except OSError:
        pass
    good = sorted(ip for ip in ips if private_ip(ip) and not ip.startswith('127.'))
    return good or ['127.0.0.1']


# ---------- WebSocket ----------
def frame(op, payload):
    n = len(payload)
    if n < 126:
        head = struct.pack('!BB', 0x80 | op, n)
    elif n < 65536:
        head = struct.pack('!BBH', 0x80 | op, 126, n)
    else:
        head = struct.pack('!BBQ', 0x80 | op, 127, n)
    return head + payload


class Client:
    def __init__(self, writer, addr):
        self.w = writer
        self.addr = addr
        self.topics = set()
        self.will = None

    def send_raw(self, data):
        tr = self.w.transport
        if tr.is_closing():
            return
        if tr.get_write_buffer_size() > MAX_BUFFER:
            tr.close()
            return
        self.w.write(data)


def publish(topic, txt, sender=None):
    data = frame(1, json.dumps({'topic': topic, 'txt': txt}).encode('utf-8'))
    for c in list(clients):
        if c is not sender and topic in c.topics:
            c.send_raw(data)


def handle_msg(c, text):
    try:
        m = json.loads(text)
    except ValueError:
        return
    if not isinstance(m, dict):
        return
    op = m.get('op')
    if op == 'sub':
        for t in (m.get('topics') or [])[:8]:
            if isinstance(t, str) and t.startswith(TOPIC_PREFIX) and len(t) < 120:
                c.topics.add(t)
    elif op in ('pub', 'will'):
        t, txt = m.get('topic'), m.get('txt')
        if not (isinstance(t, str) and t.startswith(TOPIC_PREFIX) and isinstance(txt, str)):
            return
        if op == 'pub':
            publish(t, txt, c)
        else:
            c.will = (t, txt)   # se publica si el equipo se desconecta (aviso de "se fue")


async def read_frame(r):
    b1, b2 = await r.readexactly(2)
    fin, op = b1 & 0x80, b1 & 0x0F
    n = b2 & 0x7F
    if n == 126:
        n = struct.unpack('!H', await r.readexactly(2))[0]
    elif n == 127:
        n = struct.unpack('!Q', await r.readexactly(8))[0]
    if n > MAX_MSG:
        raise ValueError('mensaje demasiado grande')
    mask = await r.readexactly(4) if b2 & 0x80 else None
    data = await r.readexactly(n) if n else b''
    if mask and n:
        key = (mask * (n // 4 + 1))[:n]
        data = (int.from_bytes(data, 'big') ^ int.from_bytes(key, 'big')).to_bytes(n, 'big')
    return fin, op, data


async def ws_session(r, w, addr):
    c = Client(w, addr)
    clients.add(c)
    print(f'+ equipo conectado: {addr}  ({len(clients)} en total)', flush=True)
    buf, total = b'', 0
    try:
        while True:
            fin, op, data = await read_frame(r)
            if op == 8:                      # cierre
                c.send_raw(frame(8, b''))
                break
            if op == 9:                      # ping → pong
                c.send_raw(frame(10, data))
                continue
            if op == 10:
                continue
            if op in (1, 2):
                buf = data
            elif op == 0:
                buf += data
            total = len(buf)
            if total > MAX_MSG:
                break
            if fin:
                handle_msg(c, buf.decode('utf-8', 'replace'))
                buf = b''
            await w.drain()
    except (asyncio.IncompleteReadError, ConnectionError, ValueError, OSError):
        pass
    finally:
        clients.discard(c)
        if c.will:
            publish(c.will[0], c.will[1], c)
        try:
            w.close()
        except OSError:
            pass
        print(f'- equipo desconectado: {addr}  ({len(clients)} en total)', flush=True)


# ---------- HTTP ----------
def http_reply(w, code, text, ctype='text/plain; charset=utf-8', body=b'', head_only=False):
    hdr = (f'HTTP/1.1 {code} {text}\r\nContent-Type: {ctype}\r\nContent-Length: {len(body)}\r\n'
           'Cache-Control: no-cache\r\nX-Content-Type-Options: nosniff\r\nConnection: close\r\n\r\n')
    w.write(hdr.encode('latin-1') + (b'' if head_only else body))


async def handle(r, w):
    peer = w.get_extra_info('peername')
    addr = peer[0] if peer else ''
    if not private_ip(addr):                 # fuera de la red local: se corta sin responder
        w.close()
        return
    try:
        head = await asyncio.wait_for(r.readuntil(b'\r\n\r\n'), 10)
        lines = head.decode('latin-1').split('\r\n')
        method, path, _ = lines[0].split(' ', 2)
        hdr = {}
        for line in lines[1:]:
            if ':' in line:
                k, v = line.split(':', 1)
                hdr[k.strip().lower()] = v.strip()
        path = path.split('?', 1)[0]
        if path == '/ws' and 'websocket' in hdr.get('upgrade', '').lower():
            key = hdr.get('sec-websocket-key', '')
            if not key or not origin_ok(hdr.get('origin')):
                http_reply(w, 403, 'Forbidden', body=b'Solo paginas de la red local.\n')
                await w.drain()
                w.close()
                return
            acc = base64.b64encode(hashlib.sha1((key + GUID).encode()).digest()).decode()
            w.write(('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n'
                     f'Sec-WebSocket-Accept: {acc}\r\n\r\n').encode('latin-1'))
            await w.drain()
            await ws_session(r, w, addr)
            return
        if method not in ('GET', 'HEAD'):
            http_reply(w, 405, 'Method Not Allowed')
        else:
            name = os.path.basename(path)
            if path in ('/', '/index.html') or (name.startswith('ajedrez-rts') and name.endswith('.html')):
                f, ctype = newest('ajedrez-rts*.html'), 'text/html; charset=utf-8'
            elif name.startswith('ajedrez-rts-tutorial') and name.endswith('.js'):
                f, ctype = newest('ajedrez-rts-tutorial*.js'), 'text/javascript; charset=utf-8'
            else:
                f, ctype = None, ''
            if f:
                with open(f, 'rb') as fh:
                    body = fh.read()
                http_reply(w, 200, 'OK', ctype, body, method == 'HEAD')
            else:
                http_reply(w, 404, 'Not Found', body=b'No encontrado.\n')
        await w.drain()
    except (asyncio.TimeoutError, asyncio.IncompleteReadError, asyncio.LimitOverrunError,
            ConnectionError, ValueError, OSError):
        pass
    finally:
        try:
            w.close()
        except OSError:
            pass


async def keepalive():
    """Ping cada 20 s: así se nota cuando un equipo se fue sin avisar."""
    while True:
        await asyncio.sleep(20)
        for c in list(clients):
            c.send_raw(frame(9, b''))


async def main(port):
    server = await asyncio.start_server(handle, '0.0.0.0', port)
    html = newest('ajedrez-rts*.html')
    print('Ajedrez RTS: servidor de red local')
    print('Abrí el juego en cada equipo de tu red (PC, celular, tablet):')
    for ip in lan_ips():
        print(f'    http://{ip}:{port}')
    print(f'Juego: {os.path.basename(html) if html else "(no encontré ajedrez-rts*.html en esta carpeta)"}')
    print('Solo atiende equipos de la red local; no se conecta a internet. Ctrl+C para cerrar.', flush=True)
    asyncio.ensure_future(keepalive())
    async with server:
        await server.serve_forever()


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description='Servidor de red local para Ajedrez RTS')
    ap.add_argument('--port', type=int, default=8765, help='puerto (8765 por defecto)')
    args = ap.parse_args()
    try:
        asyncio.run(main(args.port))
    except KeyboardInterrupt:
        print('\nServidor cerrado.')
    except OSError as e:
        print(f'No pude abrir el puerto {args.port}: {e}. Probá con --port 9000.')
