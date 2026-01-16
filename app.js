const state = {
  image: null,
  imageReady: false,
  imgScale: 1,
  imgRotate: 0,
  imgOffsetX: 0,
  imgOffsetY: 0,
  reflectX: false,
  reflectY: false,
  shape: "circle",
  border: {
    type: "solid",
    width: 40,
    opacity: 1,
    offset: 0,
    rotation: 0,
    cap: "round",
    solidColor: "#32d296",
    gradient: ["#feda75", "#d62976", "#962fbf", "#4f5bd5"],
    gradientType: "conic",
  },
  background: {
    type: "solid",
    solidColor: "#1c1f2a",
    gradientColors: ["#ff6b6b", "#6b7bff", "#2dd4bf", "#ffd166"],
    gradientAngle: 135,
    gradientType: "linear",
    pattern: "grid",
    image: null,
    fit: "cover",
    blur: 0,
  },
  filters: {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    hue: 0,
    invert: 0,
    sepia: 0,
  },
  text: {
    value: "",
    size: 32,
    style: "straight",
    x: 50,
    y: 80,
    font: "Inter, Arial, sans-serif",
    weight: 400,
    spacing: 0,
    colorType: "solid",
    solidColor: "#ffffff",
    gradient: ["#22d3ee", "#a855f7", "#f97316"],
    opacity: 1,
    radius: 180,
    angle: -90,
  },
};

const canvas = document.getElementById("editorCanvas");
const ctx = canvas.getContext("2d");
const hero = document.getElementById("hero");
const editor = document.getElementById("editor");
const uploadCard = document.getElementById("uploadCard");
const uploadButton = document.getElementById("uploadButton");
const fileInput = document.getElementById("fileInput");
const loading = document.getElementById("loading");
const toast = document.getElementById("toast");
const exportSize = document.getElementById("exportSize");
let isDraggingImage = false;
let isDraggingText = false;
let lastPointer = { x: 0, y: 0 };
let activePanel = "position";

const presetFilters = [
  { name: "Soft", values: { brightness: 110, contrast: 95, saturation: 110 } },
  { name: "Moody", values: { brightness: 90, contrast: 120, saturation: 80, hue: 8 } },
  { name: "Bright", values: { brightness: 130, contrast: 110, saturation: 120 } },
  { name: "Mono", values: { grayscale: 100, contrast: 120 } },
];

const swatches = ["#32d296", "#38bdf8", "#f472b6", "#facc15", "#fb923c", "#22c55e", "#e879f9", "#ffffff"];
const bgSwatches = ["#0b0b0d", "#1c1f2a", "#111827", "#2c1238", "#0f172a", "#1f2937", "#2dd4bf", "#38bdf8"];
const gradientSwatches = [
  ["#feda75", "#d62976", "#962fbf", "#4f5bd5"],
  ["#22d3ee", "#0ea5e9", "#6366f1", "#a855f7"],
  ["#f97316", "#facc15", "#4ade80", "#22c55e"],
  ["#fb7185", "#f472b6", "#c084fc", "#60a5fa"],
];

const bgGradientSwatches = [
  ["#0f172a", "#1f2937", "#312e81", "#1d4ed8"],
  ["#1c1f2a", "#2c1238", "#4c1d95", "#2563eb"],
  ["#0ea5e9", "#22c55e", "#facc15"],
  ["#f97316", "#f472b6", "#8b5cf6"],
];

const stateFields = {
  scale: document.getElementById("scale"),
  rotate: document.getElementById("rotate"),
  scaleValue: document.getElementById("scaleValue"),
  rotateValue: document.getElementById("rotateValue"),
  brightness: document.getElementById("brightness"),
  contrast: document.getElementById("contrast"),
  saturation: document.getElementById("saturation"),
  blur: document.getElementById("blur"),
  grayscale: document.getElementById("grayscale"),
  hue: document.getElementById("hue"),
  invert: document.getElementById("invert"),
  sepia: document.getElementById("sepia"),
  borderWidth: document.getElementById("borderWidth"),
  borderOpacity: document.getElementById("borderOpacity"),
  borderOffset: document.getElementById("borderOffset"),
  borderRotation: document.getElementById("borderRotation"),
  borderCap: document.getElementById("borderCap"),
  borderWidthValue: document.getElementById("borderWidthValue"),
  borderOpacityValue: document.getElementById("borderOpacityValue"),
  borderOffsetValue: document.getElementById("borderOffsetValue"),
  borderRotationValue: document.getElementById("borderRotationValue"),
  brightnessValue: document.getElementById("brightnessValue"),
  contrastValue: document.getElementById("contrastValue"),
  saturationValue: document.getElementById("saturationValue"),
  blurValue: document.getElementById("blurValue"),
  grayscaleValue: document.getElementById("grayscaleValue"),
  hueValue: document.getElementById("hueValue"),
  invertValue: document.getElementById("invertValue"),
  sepiaValue: document.getElementById("sepiaValue"),
  bgGradientAngle: document.getElementById("bgGradientAngle"),
  bgGradientAngleValue: document.getElementById("bgGradientAngleValue"),
  bgImageBlur: document.getElementById("bgImageBlur"),
  bgImageBlurValue: document.getElementById("bgImageBlurValue"),
  textInput: document.getElementById("textInput"),
  textSize: document.getElementById("textSize"),
  textSizeValue: document.getElementById("textSizeValue"),
  textX: document.getElementById("textX"),
  textY: document.getElementById("textY"),
  textXValue: document.getElementById("textXValue"),
  textYValue: document.getElementById("textYValue"),
  textFont: document.getElementById("textFont"),
  textWeight: document.getElementById("textWeight"),
  textSpacing: document.getElementById("textSpacing"),
  textSpacingValue: document.getElementById("textSpacingValue"),
  textOpacity: document.getElementById("textOpacity"),
  textOpacityValue: document.getElementById("textOpacityValue"),
  textRadius: document.getElementById("textRadius"),
  textRadiusValue: document.getElementById("textRadiusValue"),
  textAngle: document.getElementById("textAngle"),
  textAngleValue: document.getElementById("textAngleValue"),
};

const filterPresets = document.getElementById("filterPresets");

function buildSwatches(container, colors, onSelect) {
  container.innerHTML = "";
  colors.forEach((color, index) => {
    const swatch = document.createElement("button");
    swatch.className = "swatch";
    swatch.style.background = color;
    if (index === 0) swatch.classList.add("active");
    swatch.addEventListener("click", () => {
      container.querySelectorAll(".swatch").forEach((btn) => btn.classList.remove("active"));
      swatch.classList.add("active");
      onSelect(color, index);
    });
    container.appendChild(swatch);
  });
}

function buildGradientSwatches(container, gradients, onSelect) {
  container.innerHTML = "";
  gradients.forEach((gradient, index) => {
    const swatch = document.createElement("button");
    swatch.className = "swatch";
    swatch.style.background = `linear-gradient(135deg, ${gradient.join(", ")})`;
    if (index === 0) swatch.classList.add("active");
    swatch.addEventListener("click", () => {
      container.querySelectorAll(".swatch").forEach((btn) => btn.classList.remove("active"));
      swatch.classList.add("active");
      onSelect(gradient, index);
    });
    container.appendChild(swatch);
  });
}

function updateFilterValues() {
  stateFields.brightnessValue.textContent = `${state.filters.brightness}%`;
  stateFields.contrastValue.textContent = `${state.filters.contrast}%`;
  stateFields.saturationValue.textContent = `${state.filters.saturation}%`;
  stateFields.blurValue.textContent = `${state.filters.blur}px`;
  stateFields.grayscaleValue.textContent = `${state.filters.grayscale}%`;
  stateFields.hueValue.textContent = `${state.filters.hue}°`;
  stateFields.invertValue.textContent = `${state.filters.invert}%`;
  stateFields.sepiaValue.textContent = `${state.filters.sepia}%`;
}

function updateTextValues() {
  stateFields.textSizeValue.textContent = `${state.text.size}px`;
  stateFields.textXValue.textContent = `${state.text.x}%`;
  stateFields.textYValue.textContent = `${state.text.y}%`;
  stateFields.textSpacingValue.textContent = `${state.text.spacing}px`;
  stateFields.textOpacityValue.textContent = `${Math.round(state.text.opacity * 100)}%`;
  stateFields.textRadiusValue.textContent = `${state.text.radius}px`;
  stateFields.textAngleValue.textContent = `${state.text.angle}°`;
}

function updatePositionValues() {
  stateFields.scaleValue.textContent = `${state.imgScale.toFixed(2)}x`;
  stateFields.rotateValue.textContent = `${state.imgRotate}°`;
}

function updateBorderValues() {
  stateFields.borderWidthValue.textContent = `${state.border.width}px`;
  stateFields.borderOpacityValue.textContent = `${Math.round(state.border.opacity * 100)}%`;
  stateFields.borderOffsetValue.textContent = `${state.border.offset}px`;
  stateFields.borderRotationValue.textContent = `${state.border.rotation}°`;
}

function updateBackgroundValues() {
  stateFields.bgGradientAngleValue.textContent = `${state.background.gradientAngle}°`;
  stateFields.bgImageBlurValue.textContent = `${state.background.blur}px`;
}

function renderTextStraight(ctx, centerX, centerY, radius) {
  if (!state.text.value) return;
  ctx.save();
  ctx.font = `${state.text.weight} ${state.text.size}px ${state.text.font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const posX = centerX + (state.text.x - 50) * (radius / 50);
  const posY = centerY + (state.text.y - 50) * (radius / 50);
  ctx.translate(posX, posY);
  ctx.globalAlpha = state.text.opacity;
  applyTextFill(ctx, -radius, -radius, radius * 2, radius * 2);
  ctx.fillText(state.text.value, 0, 0);
  ctx.restore();
}

function renderTextVertical(ctx, centerX, centerY, radius) {
  if (!state.text.value) return;
  ctx.save();
  ctx.font = `${state.text.weight} ${state.text.size}px ${state.text.font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const posX = centerX + (state.text.x - 50) * (radius / 50);
  const posY = centerY + (state.text.y - 50) * (radius / 50);
  ctx.translate(posX, posY);
  ctx.globalAlpha = state.text.opacity;
  const letters = state.text.value.split("");
  letters.forEach((letter, index) => {
    applyTextFill(ctx, -radius, -radius, radius * 2, radius * 2);
    ctx.fillText(letter, 0, index * (state.text.size + state.text.spacing));
  });
  ctx.restore();
}

function renderTextCurved(ctx, centerX, centerY) {
  if (!state.text.value) return;
  ctx.save();
  ctx.font = `${state.text.weight} ${state.text.size}px ${state.text.font}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.globalAlpha = state.text.opacity;
  const text = state.text.value;
  const radius = state.text.radius;
  const startAngle = (state.text.angle * Math.PI) / 180;
  const totalAngle = (text.length * (state.text.size + state.text.spacing)) / radius;
  const offset = -totalAngle / 2;

  text.split("").forEach((letter, index) => {
    const angle = startAngle + offset + index * ((state.text.size + state.text.spacing) / radius);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.translate(0, -radius);
    applyTextFill(ctx, -radius, -radius, radius * 2, radius * 2);
    ctx.fillText(letter, 0, 0);
    ctx.restore();
  });
  ctx.restore();
}

function applyTextFill(ctx, x, y, width, height) {
  if (state.text.colorType === "gradient") {
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    state.text.gradient.forEach((color, index) => {
      gradient.addColorStop(index / (state.text.gradient.length - 1 || 1), color);
    });
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = state.text.solidColor;
  }
}

function buildFilterString() {
  const f = state.filters;
  return `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) blur(${f.blur}px) grayscale(${f.grayscale}%) hue-rotate(${f.hue}deg) invert(${f.invert}%) sepia(${f.sepia}%)`;
}

function applyShapeClip(ctx, centerX, centerY, radius) {
  ctx.beginPath();
  if (state.shape === "circle") {
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  } else if (state.shape === "rounded") {
    const size = radius * 2;
    const r = 32;
    ctx.roundRect(centerX - radius, centerY - radius, size, size, r);
  } else {
    ctx.rect(centerX - radius, centerY - radius, radius * 2, radius * 2);
  }
  ctx.closePath();
  ctx.clip();
}

function drawBackground(ctx, size) {
  ctx.save();
  if (state.background.type === "solid") {
    ctx.fillStyle = state.background.solidColor;
    ctx.fillRect(0, 0, size, size);
  } else if (state.background.type === "gradient") {
    const colors = state.background.gradientColors;
    let gradient;
    if (state.background.gradientType === "radial") {
      gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 1.2);
    } else {
      const angle = (state.background.gradientAngle * Math.PI) / 180;
      const x = Math.cos(angle) * size;
      const y = Math.sin(angle) * size;
      gradient = ctx.createLinearGradient(size / 2 - x / 2, size / 2 - y / 2, size / 2 + x / 2, size / 2 + y / 2);
    }
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1 || 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  } else if (state.background.type === "pattern") {
    const pattern = buildPattern(ctx, size, state.background.pattern);
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, size, size);
  } else if (state.background.type === "image" && state.background.image) {
    const img = state.background.image;
    ctx.save();
    if (state.background.blur > 0) {
      ctx.filter = `blur(${state.background.blur}px)`;
    }
    drawImageCover(ctx, img, 0, 0, size, size, state.background.fit === "contain");
    ctx.restore();
  }
  ctx.restore();
}

function buildPattern(ctx, size, type) {
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = 60;
  patternCanvas.height = 60;
  const pctx = patternCanvas.getContext("2d");
  pctx.fillStyle = state.background.solidColor;
  pctx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
  pctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  pctx.lineWidth = 1;
  if (type === "grid") {
    pctx.beginPath();
    pctx.moveTo(0, 30);
    pctx.lineTo(60, 30);
    pctx.moveTo(30, 0);
    pctx.lineTo(30, 60);
    pctx.stroke();
  } else if (type === "dots") {
    pctx.fillStyle = "rgba(255,255,255,0.2)";
    for (let x = 10; x <= 50; x += 20) {
      for (let y = 10; y <= 50; y += 20) {
        pctx.beginPath();
        pctx.arc(x, y, 3, 0, Math.PI * 2);
        pctx.fill();
      }
    }
  } else if (type === "diagonal") {
    pctx.beginPath();
    pctx.moveTo(0, 60);
    pctx.lineTo(60, 0);
    pctx.stroke();
  } else if (type === "zigzag") {
    pctx.beginPath();
    pctx.moveTo(0, 30);
    pctx.lineTo(20, 10);
    pctx.lineTo(40, 30);
    pctx.lineTo(60, 10);
    pctx.stroke();
  }
  return ctx.createPattern(patternCanvas, "repeat");
}

function drawImageCover(ctx, img, x, y, width, height, contain = false) {
  const ratio = img.width / img.height;
  const canvasRatio = width / height;
  let drawWidth = width;
  let drawHeight = height;
  if (contain ? ratio > canvasRatio : ratio < canvasRatio) {
    drawHeight = width / ratio;
  } else {
    drawWidth = height * ratio;
  }
  const offsetX = x + (width - drawWidth) / 2;
  const offsetY = y + (height - drawHeight) / 2;
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

function drawBorder(ctx, centerX, centerY, radius) {
  if (state.border.width <= 0) return;
  ctx.save();
  ctx.globalAlpha = state.border.opacity;
  ctx.lineWidth = state.border.width;
  ctx.lineCap = state.border.cap;
  let stroke;
  if (state.border.type === "gradient") {
    if (state.border.gradientType === "conic" && ctx.createConicGradient) {
      stroke = ctx.createConicGradient((state.border.rotation * Math.PI) / 180, centerX, centerY);
      state.border.gradient.forEach((color, index) => {
        stroke.addColorStop(index / (state.border.gradient.length - 1 || 1), color);
      });
    } else if (state.border.gradientType === "radial") {
      stroke = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius + state.border.width);
      state.border.gradient.forEach((color, index) => {
        stroke.addColorStop(index / (state.border.gradient.length - 1 || 1), color);
      });
    } else {
      const angle = (state.border.rotation * Math.PI) / 180;
      const x = Math.cos(angle) * radius * 2;
      const y = Math.sin(angle) * radius * 2;
      stroke = ctx.createLinearGradient(centerX - x, centerY - y, centerX + x, centerY + y);
      state.border.gradient.forEach((color, index) => {
        stroke.addColorStop(index / (state.border.gradient.length - 1 || 1), color);
      });
    }
  } else {
    stroke = state.border.solidColor;
  }
  ctx.strokeStyle = stroke;
  ctx.beginPath();
  const borderRadius = radius + state.border.offset + state.border.width / 2;
  if (state.shape === "circle") {
    ctx.arc(centerX, centerY, borderRadius, 0, Math.PI * 2);
  } else if (state.shape === "rounded") {
    const size = borderRadius * 2;
    const r = 32;
    ctx.roundRect(centerX - borderRadius, centerY - borderRadius, size, size, r);
  } else {
    ctx.rect(centerX - borderRadius, centerY - borderRadius, borderRadius * 2, borderRadius * 2);
  }
  ctx.stroke();
  ctx.restore();
}

function renderCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const size = canvas.width;
  const center = size / 2;
  drawBackground(ctx, size);
  if (state.imageReady) {
    ctx.save();
    applyShapeClip(ctx, center, center, size * 0.32 + state.border.offset);
    ctx.translate(center + state.imgOffsetX, center + state.imgOffsetY);
    ctx.scale(state.reflectX ? -state.imgScale : state.imgScale, state.reflectY ? -state.imgScale : state.imgScale);
    ctx.rotate((state.imgRotate * Math.PI) / 180);
    ctx.filter = buildFilterString();
    ctx.drawImage(state.image, -state.image.width / 2, -state.image.height / 2);
    ctx.restore();
  }
  drawBorder(ctx, center, center, size * 0.32);
  if (state.text.style === "straight") {
    renderTextStraight(ctx, center, center, size * 0.32);
  } else if (state.text.style === "vertical") {
    renderTextVertical(ctx, center, center, size * 0.32);
  } else {
    renderTextCurved(ctx, center, center);
  }
}

function startRenderLoop() {
  requestAnimationFrame(function tick() {
    renderCanvas();
    requestAnimationFrame(tick);
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  setTimeout(() => {
    toast.hidden = true;
  }, 1800);
}

function updateStateFromInputs() {
  state.imgScale = parseFloat(stateFields.scale.value);
  state.imgRotate = parseInt(stateFields.rotate.value, 10);
  state.border.width = parseInt(stateFields.borderWidth.value, 10);
  state.border.opacity = parseInt(stateFields.borderOpacity.value, 10) / 100;
  state.border.offset = parseInt(stateFields.borderOffset.value, 10);
  state.border.rotation = parseInt(stateFields.borderRotation.value, 10);
  state.border.cap = stateFields.borderCap.value;
  state.filters.brightness = parseInt(stateFields.brightness.value, 10);
  state.filters.contrast = parseInt(stateFields.contrast.value, 10);
  state.filters.saturation = parseInt(stateFields.saturation.value, 10);
  state.filters.blur = parseInt(stateFields.blur.value, 10);
  state.filters.grayscale = parseInt(stateFields.grayscale.value, 10);
  state.filters.hue = parseInt(stateFields.hue.value, 10);
  state.filters.invert = parseInt(stateFields.invert.value, 10);
  state.filters.sepia = parseInt(stateFields.sepia.value, 10);
  state.background.gradientAngle = parseInt(stateFields.bgGradientAngle.value, 10);
  state.background.blur = parseInt(stateFields.bgImageBlur.value, 10);
  state.text.value = stateFields.textInput.value;
  state.text.size = parseInt(stateFields.textSize.value, 10);
  state.text.x = parseInt(stateFields.textX.value, 10);
  state.text.y = parseInt(stateFields.textY.value, 10);
  state.text.font = stateFields.textFont.value;
  state.text.weight = parseInt(stateFields.textWeight.value, 10);
  state.text.spacing = parseInt(stateFields.textSpacing.value, 10);
  state.text.opacity = parseInt(stateFields.textOpacity.value, 10) / 100;
  state.text.radius = parseInt(stateFields.textRadius.value, 10);
  state.text.angle = parseInt(stateFields.textAngle.value, 10);
  updatePositionValues();
  updateBorderValues();
  updateFilterValues();
  updateBackgroundValues();
  updateTextValues();
  persistState();
}

function persistState() {
  const stored = JSON.stringify({
    imgScale: state.imgScale,
    imgRotate: state.imgRotate,
    imgOffsetX: state.imgOffsetX,
    imgOffsetY: state.imgOffsetY,
    reflectX: state.reflectX,
    reflectY: state.reflectY,
    shape: state.shape,
    border: state.border,
    background: {
      ...state.background,
      image: null,
    },
    filters: state.filters,
    text: state.text,
  });
  localStorage.setItem("pfp-state", stored);
}

function restoreState() {
  const stored = localStorage.getItem("pfp-state");
  if (!stored) return;
  const parsed = JSON.parse(stored);
  Object.assign(state, parsed);
  stateFields.scale.value = state.imgScale;
  stateFields.rotate.value = state.imgRotate;
  stateFields.borderWidth.value = state.border.width;
  stateFields.borderOpacity.value = state.border.opacity * 100;
  stateFields.borderOffset.value = state.border.offset;
  stateFields.borderRotation.value = state.border.rotation;
  stateFields.borderCap.value = state.border.cap;
  stateFields.brightness.value = state.filters.brightness;
  stateFields.contrast.value = state.filters.contrast;
  stateFields.saturation.value = state.filters.saturation;
  stateFields.blur.value = state.filters.blur;
  stateFields.grayscale.value = state.filters.grayscale;
  stateFields.hue.value = state.filters.hue;
  stateFields.invert.value = state.filters.invert;
  stateFields.sepia.value = state.filters.sepia;
  stateFields.bgGradientAngle.value = state.background.gradientAngle;
  stateFields.bgImageBlur.value = state.background.blur;
  stateFields.textInput.value = state.text.value;
  stateFields.textSize.value = state.text.size;
  stateFields.textX.value = state.text.x;
  stateFields.textY.value = state.text.y;
  stateFields.textFont.value = state.text.font;
  stateFields.textWeight.value = state.text.weight;
  stateFields.textSpacing.value = state.text.spacing;
  stateFields.textOpacity.value = state.text.opacity * 100;
  stateFields.textRadius.value = state.text.radius;
  stateFields.textAngle.value = state.text.angle;
  updatePositionValues();
  updateBorderValues();
  updateFilterValues();
  updateBackgroundValues();
  updateTextValues();
}

function switchPanel(panel) {
  activePanel = panel;
  document.querySelectorAll(".tool-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.panel === panel);
  });
  document.querySelectorAll(".panel").forEach((panelEl) => {
    panelEl.classList.toggle("active", panelEl.id === `panel-${panel}`);
  });
}

function setLoading(isLoading) {
  loading.hidden = !isLoading;
}

function loadImage(file) {
  if (!file) return;
  const reader = new FileReader();
  setLoading(true);
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      state.image = img;
      state.imageReady = true;
      state.imgScale = 1;
      state.imgRotate = 0;
      state.imgOffsetX = 0;
      state.imgOffsetY = 0;
      state.reflectX = false;
      state.reflectY = false;
      hero.hidden = true;
      editor.hidden = false;
      updatePositionValues();
      autoCenterImage();
      setLoading(false);
      showToast("Image loaded");
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function handleDrop(event) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  loadImage(file);
}

function handleDragOver(event) {
  event.preventDefault();
}

function autoCenterImage() {
  if (!state.imageReady) return;
  setLoading(true);
  if ("FaceDetector" in window) {
    const detector = new FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
    detector
      .detect(state.image)
      .then((faces) => {
        if (faces.length) {
          const face = faces[0].boundingBox;
          const centerX = face.x + face.width / 2;
          const centerY = face.y + face.height / 2;
          state.imgOffsetX = (canvas.width / 2 - centerX) * 0.2;
          state.imgOffsetY = (canvas.height / 2 - centerY) * 0.2;
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  } else {
    state.imgOffsetX = 0;
    state.imgOffsetY = 0;
    setLoading(false);
  }
}

function handleCanvasPointerDown(event) {
  if (!state.imageReady) return;
  const rect = canvas.getBoundingClientRect();
  lastPointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  if (activePanel === "text" && state.text.value) {
    isDraggingText = true;
  } else {
    isDraggingImage = true;
  }
}

function handleCanvasPointerMove(event) {
  if (!isDraggingImage && !isDraggingText) return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const dx = x - lastPointer.x;
  const dy = y - lastPointer.y;
  lastPointer = { x, y };
  if (isDraggingText) {
    state.text.x = Math.min(100, Math.max(0, state.text.x + dx * 0.2));
    state.text.y = Math.min(100, Math.max(0, state.text.y + dy * 0.2));
    stateFields.textX.value = state.text.x;
    stateFields.textY.value = state.text.y;
    updateTextValues();
  } else {
    state.imgOffsetX += dx;
    state.imgOffsetY += dy;
  }
  persistState();
}

function handleCanvasPointerUp() {
  isDraggingImage = false;
  isDraggingText = false;
}

function exportImage() {
  if (!state.imageReady) {
    showToast("Upload a photo first");
    return;
  }
  const size = parseInt(exportSize.value, 10);
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = size * window.devicePixelRatio;
  exportCanvas.height = size * window.devicePixelRatio;
  const exportCtx = exportCanvas.getContext("2d");
  exportCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
  exportCtx.clearRect(0, 0, size, size);
  drawBackground(exportCtx, size);

  if (state.imageReady) {
    exportCtx.save();
    const center = size / 2;
    applyShapeClip(exportCtx, center, center, size * 0.32 + state.border.offset);
    exportCtx.translate(center + state.imgOffsetX, center + state.imgOffsetY);
    exportCtx.scale(state.reflectX ? -state.imgScale : state.imgScale, state.reflectY ? -state.imgScale : state.imgScale);
    exportCtx.rotate((state.imgRotate * Math.PI) / 180);
    exportCtx.filter = buildFilterString();
    exportCtx.drawImage(state.image, -state.image.width / 2, -state.image.height / 2);
    exportCtx.restore();
  }
  drawBorder(exportCtx, size / 2, size / 2, size * 0.32);
  if (state.text.style === "straight") {
    renderTextStraight(exportCtx, size / 2, size / 2, size * 0.32);
  } else if (state.text.style === "vertical") {
    renderTextVertical(exportCtx, size / 2, size / 2, size * 0.32);
  } else {
    renderTextCurved(exportCtx, size / 2, size / 2);
  }

  const link = document.createElement("a");
  link.download = "pfp-border.png";
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
  showToast("Exported PNG");
}

function initEvents() {
  uploadButton.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (event) => loadImage(event.target.files[0]));
  uploadCard.addEventListener("dragover", handleDragOver);
  uploadCard.addEventListener("drop", handleDrop);

  document.querySelectorAll(".tool-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchPanel(btn.dataset.panel));
  });

  document.querySelectorAll("[data-shape]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-shape]").forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
      state.shape = btn.dataset.shape;
      persistState();
    });
  });

  document.querySelectorAll("[data-border-type]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-border-type]").forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
      state.border.type = btn.dataset.borderType;
      document.getElementById("borderSolidControls").hidden = state.border.type !== "solid";
      document.getElementById("borderGradientControls").hidden = state.border.type !== "gradient";
      persistState();
    });
  });

  document.querySelectorAll("[data-border-grad]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-border-grad]").forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
      state.border.gradientType = btn.dataset.borderGrad;
      persistState();
    });
  });

  document.querySelectorAll("[data-bg-type]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-bg-type]").forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
      state.background.type = btn.dataset.bgType;
      document.getElementById("bgSolidControls").hidden = state.background.type !== "solid";
      document.getElementById("bgGradientControls").hidden = state.background.type !== "gradient";
      document.getElementById("bgPatternControls").hidden = state.background.type !== "pattern";
      document.getElementById("bgImageControls").hidden = state.background.type !== "image";
      persistState();
    });
  });

  document.querySelectorAll("[data-bg-grad]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-bg-grad]").forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
      state.background.gradientType = btn.dataset.bgGrad;
      persistState();
    });
  });

  document.querySelectorAll("[data-bg-fit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-bg-fit]").forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
      state.background.fit = btn.dataset.bgFit;
      persistState();
    });
  });

  document.querySelectorAll(".pattern-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pattern-btn").forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
      state.background.pattern = btn.dataset.pattern;
      persistState();
    });
  });

  document.querySelectorAll("[data-text-style]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-text-style]").forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
      state.text.style = btn.dataset.textStyle;
      persistState();
    });
  });

  document.querySelectorAll("[data-text-color]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-text-color]").forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
      state.text.colorType = btn.dataset.textColor;
      document.getElementById("textGradientControls").hidden = state.text.colorType !== "gradient";
      persistState();
    });
  });

  stateFields.scale.addEventListener("input", () => {
    state.imgScale = parseFloat(stateFields.scale.value);
    updatePositionValues();
    persistState();
  });
  stateFields.rotate.addEventListener("input", () => {
    state.imgRotate = parseInt(stateFields.rotate.value, 10);
    updatePositionValues();
    persistState();
  });
  stateFields.borderWidth.addEventListener("input", () => {
    state.border.width = parseInt(stateFields.borderWidth.value, 10);
    updateBorderValues();
    persistState();
  });
  stateFields.borderOpacity.addEventListener("input", () => {
    state.border.opacity = parseInt(stateFields.borderOpacity.value, 10) / 100;
    updateBorderValues();
    persistState();
  });
  stateFields.borderOffset.addEventListener("input", () => {
    state.border.offset = parseInt(stateFields.borderOffset.value, 10);
    updateBorderValues();
    persistState();
  });
  stateFields.borderRotation.addEventListener("input", () => {
    state.border.rotation = parseInt(stateFields.borderRotation.value, 10);
    updateBorderValues();
    persistState();
  });
  stateFields.borderCap.addEventListener("change", () => {
    state.border.cap = stateFields.borderCap.value;
    persistState();
  });

  [
    "brightness",
    "contrast",
    "saturation",
    "blur",
    "grayscale",
    "hue",
    "invert",
    "sepia",
  ].forEach((key) => {
    stateFields[key].addEventListener("input", () => {
      state.filters[key] = parseInt(stateFields[key].value, 10);
      updateFilterValues();
      persistState();
    });
  });

  stateFields.bgGradientAngle.addEventListener("input", () => {
    state.background.gradientAngle = parseInt(stateFields.bgGradientAngle.value, 10);
    updateBackgroundValues();
    persistState();
  });

  stateFields.bgImageBlur.addEventListener("input", () => {
    state.background.blur = parseInt(stateFields.bgImageBlur.value, 10);
    updateBackgroundValues();
    persistState();
  });

  stateFields.textInput.addEventListener("input", () => {
    state.text.value = stateFields.textInput.value;
    persistState();
  });
  stateFields.textSize.addEventListener("input", () => {
    state.text.size = parseInt(stateFields.textSize.value, 10);
    updateTextValues();
    persistState();
  });
  stateFields.textX.addEventListener("input", () => {
    state.text.x = parseInt(stateFields.textX.value, 10);
    updateTextValues();
    persistState();
  });
  stateFields.textY.addEventListener("input", () => {
    state.text.y = parseInt(stateFields.textY.value, 10);
    updateTextValues();
    persistState();
  });
  stateFields.textFont.addEventListener("change", () => {
    state.text.font = stateFields.textFont.value;
    persistState();
  });
  stateFields.textWeight.addEventListener("change", () => {
    state.text.weight = parseInt(stateFields.textWeight.value, 10);
    persistState();
  });
  stateFields.textSpacing.addEventListener("input", () => {
    state.text.spacing = parseInt(stateFields.textSpacing.value, 10);
    updateTextValues();
    persistState();
  });
  stateFields.textOpacity.addEventListener("input", () => {
    state.text.opacity = parseInt(stateFields.textOpacity.value, 10) / 100;
    updateTextValues();
    persistState();
  });
  stateFields.textRadius.addEventListener("input", () => {
    state.text.radius = parseInt(stateFields.textRadius.value, 10);
    updateTextValues();
    persistState();
  });
  stateFields.textAngle.addEventListener("input", () => {
    state.text.angle = parseInt(stateFields.textAngle.value, 10);
    updateTextValues();
    persistState();
  });

  document.getElementById("resetFilters").addEventListener("click", () => {
    state.filters = { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, hue: 0, invert: 0, sepia: 0 };
    stateFields.brightness.value = state.filters.brightness;
    stateFields.contrast.value = state.filters.contrast;
    stateFields.saturation.value = state.filters.saturation;
    stateFields.blur.value = state.filters.blur;
    stateFields.grayscale.value = state.filters.grayscale;
    stateFields.hue.value = state.filters.hue;
    stateFields.invert.value = state.filters.invert;
    stateFields.sepia.value = state.filters.sepia;
    updateFilterValues();
    persistState();
  });

  document.getElementById("resetPosition").addEventListener("click", () => {
    state.imgScale = 1;
    state.imgRotate = 0;
    state.imgOffsetX = 0;
    state.imgOffsetY = 0;
    state.reflectX = false;
    state.reflectY = false;
    stateFields.scale.value = 1;
    stateFields.rotate.value = 0;
    updatePositionValues();
    persistState();
  });

  document.getElementById("resetAll").addEventListener("click", () => {
    state.imgScale = 1;
    state.imgRotate = 0;
    state.imgOffsetX = 0;
    state.imgOffsetY = 0;
    state.reflectX = false;
    state.reflectY = false;
    state.filters = { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, hue: 0, invert: 0, sepia: 0 };
    stateFields.scale.value = 1;
    stateFields.rotate.value = 0;
    Object.keys(state.filters).forEach((key) => {
      stateFields[key].value = state.filters[key];
    });
    updatePositionValues();
    updateFilterValues();
    persistState();
  });

  document.getElementById("reflectH").addEventListener("click", () => {
    state.reflectX = !state.reflectX;
    persistState();
  });
  document.getElementById("reflectV").addEventListener("click", () => {
    state.reflectY = !state.reflectY;
    persistState();
  });

  document.getElementById("autoCenter").addEventListener("click", autoCenterImage);

  document.getElementById("zoomIn").addEventListener("click", () => {
    state.imgScale = Math.min(3, state.imgScale + 0.1);
    stateFields.scale.value = state.imgScale;
    updatePositionValues();
    persistState();
  });

  document.getElementById("downloadBtn").addEventListener("click", exportImage);

  canvas.addEventListener("pointerdown", handleCanvasPointerDown);
  window.addEventListener("pointermove", handleCanvasPointerMove);
  window.addEventListener("pointerup", handleCanvasPointerUp);

  document.getElementById("bgImageUpload").addEventListener("click", () => {
    document.getElementById("bgImageInput").click();
  });
  document.getElementById("bgImageInput").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        state.background.image = img;
        state.background.type = "image";
        persistState();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  document.querySelectorAll(".grad-color").forEach((input, index) => {
    input.addEventListener("input", () => {
      state.background.gradientColors[index] = input.value;
      persistState();
    });
  });

  document.querySelectorAll(".border-grad-color").forEach((input, index) => {
    input.addEventListener("input", () => {
      state.border.gradient[index] = input.value;
      persistState();
    });
  });

  document.querySelectorAll(".text-grad-color").forEach((input, index) => {
    input.addEventListener("input", () => {
      state.text.gradient[index] = input.value;
      persistState();
    });
  });
}

function initUI() {
  buildSwatches(document.getElementById("borderSolidSwatches"), swatches, (color) => {
    state.border.solidColor = color;
    persistState();
  });
  buildSwatches(document.getElementById("bgSolidSwatches"), bgSwatches, (color) => {
    state.background.solidColor = color;
    persistState();
  });
  buildSwatches(document.getElementById("textSolidSwatches"), swatches, (color) => {
    state.text.solidColor = color;
    persistState();
  });
  buildGradientSwatches(document.getElementById("borderGradientSwatches"), gradientSwatches, (colors) => {
    state.border.gradient = [...colors];
    persistState();
  });
  buildGradientSwatches(document.getElementById("bgGradientSwatches"), bgGradientSwatches, (colors) => {
    state.background.gradientColors = [...colors];
    persistState();
  });

  document.getElementById("borderSolidPicker").addEventListener("input", (event) => {
    state.border.solidColor = event.target.value;
    persistState();
  });
  document.getElementById("bgSolidPicker").addEventListener("input", (event) => {
    state.background.solidColor = event.target.value;
    persistState();
  });
  document.getElementById("textSolidPicker").addEventListener("input", (event) => {
    state.text.solidColor = event.target.value;
    persistState();
  });

  presetFilters.forEach((preset) => {
    const btn = document.createElement("button");
    btn.className = "preset";
    btn.title = preset.name;
    btn.addEventListener("click", () => {
      state.filters = { ...state.filters, ...preset.values };
      Object.keys(preset.values).forEach((key) => {
        stateFields[key].value = state.filters[key];
      });
      updateFilterValues();
      persistState();
    });
    filterPresets.appendChild(btn);
  });

  updateStateFromInputs();
  restoreState();
}

initUI();
initEvents();
startRenderLoop();
