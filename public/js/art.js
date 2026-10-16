// Building drawings for round 1 of the picture test (level 2). Each function returns one 120x120 tile.
const Art = (() => {
  const pickOne = a => a[Math.floor(Math.random() * a.length)];
  const wrap = (inner, bg = '#cfe3f1') =>
    `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="${bg}"/>${inner}</svg>`;

  const BRICK = ['#9c4a35', '#b5653f', '#8a3d2e', '#a8573a', '#b8704a'];
  const STONE = ['#bdb8a8', '#c9c3b1', '#aea998'];
  const ground = '<rect y="100" width="120" height="20" fill="#a3aaa3"/><rect y="100" width="120" height="3" fill="#7f887f"/>';
  const tree = x => `<rect x="${x - 2}" y="78" width="4" height="22" fill="#6b4b2e"/><circle cx="${x}" cy="72" r="11" fill="#5e8c4a"/>`;
  const win = (x, y, w, h) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#34495e" stroke="#f1ead2" stroke-width="2"/>` +
    `<line x1="${x}" y1="${y + h / 2}" x2="${x + w}" y2="${y + h / 2}" stroke="#f1ead2" stroke-width="1.5"/>`;

  // ---------- buildings ----------

  // Flat-roofed apartment building with `floors` apartments stacked up. stone=true draws a greystone.
  function walkup(floors, stone) {
    const fh = floors === 2 ? 32 : 25;
    const top = 100 - floors * fh;
    const color = stone ? pickOne(STONE) : pickOne(BRICK);
    const trim = stone ? '#8f8a7b' : '#e3dccb';
    let s = ground;
    if (Math.random() < 0.5) s += tree(Math.random() < 0.5 ? 12 : 108);
    s += `<rect x="28" y="${top}" width="64" height="${100 - top}" fill="${color}"/>`;
    if (stone) {
      for (let y = top + 6; y < 100; y += 6) s += `<line x1="28" y1="${y}" x2="92" y2="${y}" stroke="#a39e8e" stroke-width="0.6"/>`;
      s += `<rect x="30" y="${top + 3}" width="22" height="${97 - top}" fill="${color}" stroke="#a39e8e" stroke-width="1"/>`;
    }
    s += `<rect x="24" y="${top - 6}" width="72" height="7" fill="${trim}"/>`;
    for (let f = 0; f < floors; f++) {
      const fy = 100 - (f + 1) * fh;
      if (f > 0) s += `<rect x="28" y="${fy + fh - 1.5}" width="64" height="2" fill="${trim}"/>`;
      const wy = fy + fh * 0.22, wh = fh * 0.5;
      if (f === 0) {
        s += win(34, wy, 12, wh) + win(74, wy, 12, wh);
        s += `<rect x="54" y="${fy + fh * 0.28}" width="12" height="${fh * 0.72}" fill="#4a2f22"/>`;
      } else {
        s += win(34, wy, 12, wh) + win(54, wy, 12, wh) + win(74, wy, 12, wh);
      }
    }
    return wrap(s);
  }

  function bungalow() {
    const c = pickOne(BRICK);
    let s = ground;
    s += `<rect x="10" y="62" width="100" height="38" fill="${c}"/>`;
    s += '<polygon points="2,63 118,63 98,40 22,40" fill="#4b4b4b"/>';
    s += `<rect x="50" y="31" width="20" height="11" fill="${c}"/><polygon points="46,32 74,32 60,23" fill="#4b4b4b"/>`;
    s += win(55, 33, 10, 7);
    s += win(18, 70, 14, 14) + win(36, 70, 14, 14) + win(54, 70, 14, 14);
    s += '<rect x="84" y="70" width="12" height="30" fill="#4a2f22"/>';
    s += '<rect x="18" y="93" width="10" height="4" fill="#34495e"/><rect x="50" y="93" width="10" height="4" fill="#34495e"/>';
    return wrap(s);
  }

  function cottage() {
    const c = pickOne(['#e3d6b0', '#a9c3c9', '#c9b48f', '#d9d9d9', '#b7c9a3']);
    let s = ground;
    if (Math.random() < 0.6) s += tree(14);
    s += `<rect x="34" y="54" width="52" height="42" fill="${c}"/>`;
    for (let y = 58; y < 96; y += 5) s += `<line x1="34" y1="${y}" x2="86" y2="${y}" stroke="#000" stroke-opacity=".15" stroke-width="0.8"/>`;
    s += `<polygon points="28,56 60,22 92,56" fill="#555"/><polygon points="36,54 60,30 84,54" fill="${c}"/>`;
    s += win(54, 38, 12, 12) + win(40, 64, 13, 20);
    s += '<rect x="64" y="64" width="12" height="32" fill="#4a2f22"/>';
    s += '<rect x="34" y="96" width="52" height="4" fill="#8d8d8d"/>';
    return wrap(s);
  }

  return { walkup, bungalow, cottage };
})();
