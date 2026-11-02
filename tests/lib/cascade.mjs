// Runs in a browser. sRGB alpha/group-opacity compositing for actual computed
// surfaces. For gradients, checks the first painted layer's resolved stops
// (including transparent highlight edges), not an invented average background.
// Filters and unrecognized images are explicitly refused.
export function measureSolidContrast(selector = '[data-contrast]') {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const color = value => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = value;
    ctx.fillRect(0, 0, 1, 1);
    const c = [...ctx.getImageData(0, 0, 1, 1).data];
    c[3] /= 255;
    return c;
  };
  const over = (a, b, opacity = 1) => {
    const alpha = a[3] * opacity;
    const resultAlpha = alpha + b[3] * (1 - alpha);
    if (!resultAlpha) return [0, 0, 0, 0];
    return [0, 1, 2].map(i => (a[i] * alpha + b[i] * b[3] * (1 - alpha)) / resultAlpha).concat(resultAlpha);
  };
  const luminance = rgb => {
    const c = rgb.slice(0, 3).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
  };
  return [...document.querySelectorAll(selector)].map(element => {
    const chain = [];
    for (let node = element; node; node = node.parentElement) chain.unshift(node);
    const layers = chain.map(node => {
      const s = getComputedStyle(node);
      if (s.filter !== 'none') throw Error(`Unmeasured filter at ${node.className}: ${s.filter}`);
      let backgrounds = [color(s.backgroundColor)];
      if (s.backgroundImage !== 'none') {
        if (!/^(?:linear|radial)-gradient\(/.test(s.backgroundImage)) throw Error(`Unmeasured image: ${s.backgroundImage}`);
        let depth = 0, end = 0;
        for (const [i, ch] of [...s.backgroundImage].entries()) {
          if (ch === '(') depth++;
          if (ch === ')' && --depth === 0) { end = i + 1; break; }
        }
        const stops = s.backgroundImage.slice(0, end).match(/rgba?\([^)]*\)|color\([^)]*\)|transparent/g);
        if (!stops?.length) throw Error(`Unmeasured gradient: ${s.backgroundImage}`);
        backgrounds = [...new Set(stops)].map(c => over(color(c), backgrounds[0]));
      }
      return { backgrounds, opacity: Number(s.opacity) };
    });
    const style = getComputedStyle(element);
    const ink = color(style.color);
    const paint = (i, backdrop, withInk, choices) => {
      const layer = layers[i];
      const background = over(choices[i], backdrop);
      const content = i === layers.length - 1 ? (withInk ? over(ink, background) : background) : paint(i + 1, background, withInk, choices);
      return over(content, backdrop, layer.opacity);
    };
    const variants = layers.reduce((sets, layer) => sets.flatMap(xs => layer.backgrounds.map(c => [...xs, c])), [[]]);
    const weakest = variants.map(choices => {
      const background = paint(0, [255, 255, 255, 1], false, choices);
      const foreground = paint(0, [255, 255, 255, 1], true, choices);
      const a = luminance(foreground), b = luminance(background);
      return { ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05), foreground, background };
    }).sort((a, b) => a.ratio - b.ratio)[0];
    return {
      name: element.dataset.name || element.textContent.trim().slice(0, 60),
      minimum: Number(element.dataset.contrast || 4.5),
      ...weakest,
      opacity: layers.reduce((n, l) => n * l.opacity, 1),
    };
  });
}
