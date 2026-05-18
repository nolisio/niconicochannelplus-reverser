from pathlib import Path
import struct
import zlib

SIZES = [16, 32, 48, 128]

BG = (16, 20, 30, 255)
BORDER = (54, 66, 88, 255)
CYAN = (98, 218, 251, 255)
ORANGE = (255, 155, 92, 255)
WHITE = (245, 248, 255, 255)


def make_canvas(size, color):
    return [[color for _ in range(size)] for _ in range(size)]


def set_pixel(canvas, x, y, color):
    if 0 <= x < len(canvas[0]) and 0 <= y < len(canvas):
        canvas[y][x] = color


def fill_circle(canvas, cx, cy, radius, color):
    x0 = max(0, int(cx - radius - 1))
    x1 = min(len(canvas[0]) - 1, int(cx + radius + 1))
    y0 = max(0, int(cy - radius - 1))
    y1 = min(len(canvas) - 1, int(cy + radius + 1))
    radius_sq = radius * radius

    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            dx = x + 0.5 - cx
            dy = y + 0.5 - cy
            if dx * dx + dy * dy <= radius_sq:
                set_pixel(canvas, x, y, color)


def draw_thick_line(canvas, x1, y1, x2, y2, thickness, color):
    min_x = max(0, int(min(x1, x2) - thickness - 1))
    max_x = min(len(canvas[0]) - 1, int(max(x1, x2) + thickness + 1))
    min_y = max(0, int(min(y1, y2) - thickness - 1))
    max_y = min(len(canvas) - 1, int(max(y1, y2) + thickness + 1))

    dx = x2 - x1
    dy = y2 - y1
    length_sq = dx * dx + dy * dy
    if length_sq == 0:
        fill_circle(canvas, x1, y1, thickness / 2, color)
        return

    radius_sq = (thickness / 2) ** 2
    for y in range(min_y, max_y + 1):
        for x in range(min_x, max_x + 1):
            px = x + 0.5
            py = y + 0.5
            t = ((px - x1) * dx + (py - y1) * dy) / length_sq
            t = max(0.0, min(1.0, t))
            proj_x = x1 + t * dx
            proj_y = y1 + t * dy
            dist_x = px - proj_x
            dist_y = py - proj_y
            if dist_x * dist_x + dist_y * dist_y <= radius_sq:
                set_pixel(canvas, x, y, color)


def fill_rounded_rect(canvas, x, y, w, h, radius, color):
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            inside_core = (x + radius <= xx < x + w - radius) or (y + radius <= yy < y + h - radius)
            if inside_core:
                set_pixel(canvas, xx, yy, color)
                continue

            corners = [
                (x + radius, y + radius),
                (x + w - radius - 1, y + radius),
                (x + radius, y + h - radius - 1),
                (x + w - radius - 1, y + h - radius - 1),
            ]
            for cx, cy in corners:
                dx = xx - cx
                dy = yy - cy
                if dx * dx + dy * dy <= radius * radius:
                    set_pixel(canvas, xx, yy, color)
                    break


def draw_icon(size):
    canvas = make_canvas(size, (0, 0, 0, 0))

    outer_margin = max(1, round(size * 0.06))
    border_radius = max(3, round(size * 0.24))
    fill_rounded_rect(
        canvas,
        outer_margin,
        outer_margin,
        size - outer_margin * 2,
        size - outer_margin * 2,
        border_radius,
        BORDER,
    )

    inner_margin = outer_margin + max(1, round(size * 0.04))
    inner_radius = max(2, border_radius - 1)
    fill_rounded_rect(
        canvas,
        inner_margin,
        inner_margin,
        size - inner_margin * 2,
        size - inner_margin * 2,
        inner_radius,
        BG,
    )

    p1 = (size * 0.28, size * 0.30)
    p2 = (size * 0.72, size * 0.30)
    p3 = (size * 0.28, size * 0.70)
    p4 = (size * 0.72, size * 0.70)

    thickness = max(2, round(size * 0.11))
    ring = max(2, round(size * 0.11))
    dot = max(1.5, size * 0.07)

    draw_thick_line(canvas, *p1, *p4, thickness, CYAN)
    draw_thick_line(canvas, *p2, *p3, thickness, ORANGE)

    fill_circle(canvas, *p1, ring, WHITE)
    fill_circle(canvas, *p2, ring, WHITE)
    fill_circle(canvas, *p3, ring, WHITE)
    fill_circle(canvas, *p4, ring, WHITE)

    fill_circle(canvas, *p1, dot, CYAN)
    fill_circle(canvas, *p2, dot, ORANGE)
    fill_circle(canvas, *p3, dot, ORANGE)
    fill_circle(canvas, *p4, dot, CYAN)

    center_r = max(1.5, size * 0.055)
    fill_circle(canvas, size / 2, size / 2, center_r + 1, WHITE)
    fill_circle(canvas, size / 2, size / 2, center_r, BG)

    return canvas


def write_png(path, canvas):
    height = len(canvas)
    width = len(canvas[0])

    raw = bytearray()
    for row in canvas:
        raw.append(0)
        for r, g, b, a in row:
            raw.extend((r, g, b, a))

    def chunk(chunk_type, data):
        return (
            struct.pack("!I", len(data))
            + chunk_type
            + data
            + struct.pack("!I", zlib.crc32(chunk_type + data) & 0xFFFFFFFF)
        )

    png = bytearray(b"\x89PNG\r\n\x1a\n")
    png += chunk(b"IHDR", struct.pack("!IIBBBBB", width, height, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")
    path.write_bytes(png)


def main():
    root = Path(__file__).resolve().parent.parent
    icon_dir = root / "icons"
    icon_dir.mkdir(parents=True, exist_ok=True)

    for size in SIZES:
        write_png(icon_dir / f"icon{size}.png", draw_icon(size))

    print(f"Generated icons in {icon_dir}")


if __name__ == "__main__":
    main()
