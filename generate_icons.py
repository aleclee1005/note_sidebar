import struct, zlib, os

def make_png(size):
    bg = (26, 115, 232)   # Google blue
    fg = (255, 255, 255)  # white
    sw = 0.13; lx, rx2 = 0.25, 0.75; ty, by = 0.20, 0.80
    data = []
    for y in range(size):
        row = [0]; ny = y / size
        for x in range(size):
            nx = x / size; pad, rr = 0.08, 0.18
            def in_rr(nx, ny, pad=pad, rr=rr):
                if nx < pad or nx > 1-pad or ny < pad or ny > 1-pad: return False
                for cx, cy in [(pad+rr,pad+rr),(1-pad-rr,pad+rr),(pad+rr,1-pad-rr),(1-pad-rr,1-pad-rr)]:
                    if nx<pad+rr and nx<=cx and ny<pad+rr and ny<=cy: return (nx-cx)**2+(ny-cy)**2<=rr**2
                    if nx>1-pad-rr and nx>=cx and ny<pad+rr and ny<=cy: return (nx-cx)**2+(ny-cy)**2<=rr**2
                    if nx<pad+rr and nx<=cx and ny>1-pad-rr and ny>=cy: return (nx-cx)**2+(ny-cy)**2<=rr**2
                    if nx>1-pad-rr and nx>=cx and ny>1-pad-rr and ny>=cy: return (nx-cx)**2+(ny-cy)**2<=rr**2
                return True
            in_bg = in_rr(nx, ny)
            diag_x = lx + (ny-ty)/(by-ty)*(rx2-lx) if ty <= ny <= by else -1
            in_L = lx-sw/2 <= nx <= lx+sw/2 and ty <= ny <= by
            in_R = rx2-sw/2 <= nx <= rx2+sw/2 and ty <= ny <= by
            in_D = ty <= ny <= by and abs(nx-diag_x) <= sw/2*1.5
            if in_bg:
                row += list(fg if (in_L or in_R or in_D) else bg) + [255]
            else:
                row += [0, 0, 0, 0]
        data.append(bytes(row))
    def chunk(n, d):
        c = n+d; return struct.pack('>I', len(d))+c+struct.pack('>I', zlib.crc32(c)&0xffffffff)
    p = b'\x89PNG\r\n\x1a\n'
    p += chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0))
    p += chunk(b'IDAT', zlib.compress(b''.join(data), 9))
    p += chunk(b'IEND', b'')
    return p

os.chdir(os.path.dirname(os.path.abspath(__file__)))
for s in [16, 48, 128]:
    with open(f'icons/icon{s}.png', 'wb') as f:
        f.write(make_png(s))
    print(f'icons/icon{s}.png ✓')
print('完成！')
