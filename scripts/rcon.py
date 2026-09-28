import socket, struct, sys
def pkt(i,t,b): d=struct.pack('<ii',i,t)+b.encode()+b'\0\0'; return struct.pack('<i',len(d))+d
s=socket.create_connection(('127.0.0.1',25575)); s.sendall(pkt(1,3,'x'))
def rd():
    n=struct.unpack('<i',s.recv(4))[0]; b=b''
    while len(b)<n: b+=s.recv(n-len(b))
    return b[8:-2].decode()
rd()
for c in sys.argv[1:]:
    s.sendall(pkt(2,2,c)); print('>',c,'\n ',rd()[:1500])
