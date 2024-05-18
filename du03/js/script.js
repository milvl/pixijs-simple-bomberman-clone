const rValue = document.getElementById('RValue');
const gValue = document.getElementById('GValue');
const bValue = document.getElementById('BValue');
const rValueInput = document.getElementById('redValueInput');
const gValueInput = document.getElementById('greenValueInput');
const bValueInput = document.getElementById('blueValueInput');

const colorRect = document.getElementById('rect');

const rgbDisplay = document.getElementById('rgb');
const hexDisplay = document.getElementById('hex');

function calculateLuminance(r, g, b) {
  const sRGBThreshold = 0.03928;
  const linearRGBCoefficient = 12.92;
  const linearRGBOffset = 0.055;
  const gamma = 2.4;
  const linearRGBDivisor = 1.055;
  const luminanceCoefficientR = 0.2126;
  const luminanceCoefficientG = 0.7152;
  const luminanceCoefficientB = 0.0722;
  const sRGBRange = 255;

  const a = [r, g, b].map(function(v) {
      // convert to sRGB
      v /= sRGBRange; 
      return v <= sRGBThreshold ? v / linearRGBCoefficient : Math.pow((v + linearRGBOffset) / linearRGBDivisor, gamma);
  });
  return a[0] * luminanceCoefficientR + a[1] * luminanceCoefficientG + a[2] * luminanceCoefficientB;
}

function hexToRgb(hex) {
  var r = 0, g = 0, b = 0;
  // 3 digits
  if (hex.length == 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
  }
  // 6 digits
  else if (hex.length == 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
  }
  return [r,g,b];
}

function updateTextColor() {
  const luminanceThreshold = 0.179;

  let bgColor = hexDisplay.innerText.split(' ')[1];
  let rgb = hexToRgb(bgColor);

  let luminance = calculateLuminance(rgb[0], rgb[1], rgb[2]);

  let textColor = luminance > luminanceThreshold ? 'black' : 'white';
  rgbDisplay.style.color = textColor;
  hexDisplay.style.color = textColor;
}

function createCSSColor(r, g, b) {
  return 'rgb(' + r + ', ' + g + ', ' + b + ")";
}

function componentToHex(c) {
  var hex = parseInt(c).toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r).toUpperCase() + componentToHex(g).toUpperCase() + componentToHex(b).toUpperCase();
}

function updateValueInputFields() {
  rValueInput.value = rValue.value;
  gValueInput.value = gValue.value;
  bValueInput.value = bValue.value;
}

function printData() {
		let color = createCSSColor(rValue.value, gValue.value, bValue.value)

    colorRect.style.backgroundColor = color;
    
    color = createCSSColor(rValue.value, gValue.value, bValue.value);
    let hex = rgbToHex(rValue.value, gValue.value, bValue.value);

    colorRect.style.backgroundColor = color;
    rgbDisplay.innerText = `RGB(${rValue.value}, ${gValue.value}, ${bValue.value})`;
    hexDisplay.innerText = `HEX: ${hex}`;

    updateValueInputFields();
    updateTextColor();
}

function addCol(c, v) {
	let elem;
  switch (c) {
  	case 'r':
    	elem = rValue;
      break;
    case 'g':
    	elem = gValue;
      break;
    case 'b':
    	elem = bValue;
      break;
    default:
    	console.error(c + " is not a valid option.")
    	return;
  }
	elem.value = parseInt(elem.value) + parseInt(v);
  elem.dispatchEvent(new Event('input'));
}

function setCol(c, v) {
	let elem;
  let input;
  switch (c) {
  	case 'r':
    	elem = rValue;
      input = rValueInput;
      break;
    case 'g':
    	elem = gValue;
      input = gValueInput;
      break;
    case 'b':
    	elem = bValue;
      input = bValueInput;
      break;
    default:
    	console.error(c + " is not a valid option.")
    	return;
  }

  if (v == '')
    v = 0
  else 
    v = Math.max(elem.min, Math.min(elem.max, parseInt(v, 10)));
	elem.value = v
  elem.dispatchEvent(new Event('input'));

  input.value = String(elem.value);
}