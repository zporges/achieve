#!/usr/bin/python

import getopt
import socket
import sys
#from nlp.verb_tense import tense

host = "127.0.0.1"
port = 8766

# handle a single client request
class ConnectionHandler:
    def __init__(self, socket):
        self.socket = socket

    def handle(self):
        #while True:
        msg = self.socket.recv(500).strip()
        print(msg)
        
        result = "[ERROR]"
        arr = msg.split()

        
        if len(arr) > 1 and arr[0] == "toPastTense":
            #val = tense.toPastTense("I " + msg[12:])
            val = "01234hello world"
            val = val[5:]
            result = "[PYTHON-SUCCESS] " + val

        send(self.socket, result)
        #self.socket.close()

def send(socket, message):
    # In Python 3, must convert message to bytes explicitly.
    # In Python 2, this does not affect the message.
    socket.settimeout(None)
    socket.send(message.encode('utf-8'))

# the main server loop
def serverloop():
    serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # mark the socket so we can rebind quickly to this port number
    # after the socket is closed
    serversocket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    # bind the socket to the local loopback IP address and special port
    serversocket.bind((host, port))
    # start listening with a backlog of 5 connections
    serversocket.listen(5)

    while True:
        # accept a connection
        (clientsocket, address) = serversocket.accept()
        ct = ConnectionHandler(clientsocket)
        ct.handle()

# You don't have to change below this line.  You can pass command-line arguments
# -h/--host [IP] -p/--port [PORT] to put your server on a different IP/port.
opts, args = getopt.getopt(sys.argv[1:], 'h:p:', ['host=', 'port='])

for k, v in opts:
    if k in ('-h', '--host'):
        host = v
    if k in ('-p', '--port'):
        port = int(v)

print("Python-Server coming up on %s:%i" % (host, port))
serverloop()

