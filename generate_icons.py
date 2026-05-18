import struct, zlib, os

def make_png(size):
    bg = (26, 26, 26)     # black background
    fg = (255, 255, 255)  # white N
    sw = 0.117; lx, rx2 = 0.275, 0.725; ty, by = 0.23, 0.77
    rr = 0.20  # corner radius as fraction of icon size

    data = []
    for y in range(size):
        row = [0]
        ny = (y + 0.5) / size  # pixel center
        for x in range(size):
            nx = (x + 0.5) / size

            # Rounded-rect: clamp (nx,ny) to inner rect [rr,1-rr], check distance <= rr
            cx = max(rr, min(nx, 1 - rr))
            cy = max(rr, min(ny, 1 - rr))
            in_bg = (nx - cx) ** 2 + (ny - cy) ** 2 <= rr ** 2

            # N strokes
            diag_x = lx + (ny - ty) / (by - ty) * (rx2 - lx) if ty <= ny <= by else -1
            in_L = lx - sw/2 <= nx <= lx + sw/2 and ty <= ny <= by
            in_R = rx2 - sw/2 <= nx <= rx2 + sw/2 and ty <= ny <= by
            in_D = ty <= ny <= by and abs(nx - diag_x) <= sw / 2 * 1.5

            if in_bg:
                row += list(fg if (in_L or in_R or in_D) else bg) + [255]
            else:
                row += [0, 0, 0, 0]
        data.append(bytes(row))

    def chunk(n, d):
        c = n + d
        return struct.pack('>I', len(d)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

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
