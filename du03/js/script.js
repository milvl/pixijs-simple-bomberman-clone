let rValue = document.getElementById('RValue');
let gValue = document.getElementById('GValue');
let bValue = document.getElementById('BValue');

let colorCircle = document.getElementById('circle');

let rgbDisplay = document.getElementById('rgb');
let hexDisplay = document.getElementById('hex');

function printData() {
    function createCSSColor(r, g, b) {
      return 'rgb(' + r + ', ' + g + ', ' + b + ")";
    }

		let color = createCSSColor(rValue.value, gValue.value, bValue.value)
    console.log(color);

    colorCircle.style.backgroundColor = color;
    
    function componentToHex(c) {
        var hex = parseInt(c).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }
    
    color = createCSSColor(rValue.value, gValue.value, bValue.value);
    let hex = rgbToHex(rValue.value, gValue.value, bValue.value);

    console.log(color);
    console.log(hex);

    colorCircle.style.backgroundColor = color;
    rgbDisplay.innerText = `${rValue.value}, ${gValue.value}, ${bValue.value}`;
    hexDisplay.innerText = hex;
}

function changeCol(c, v) {
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
	elem.value = parseInt(elem.value) + v;
  elem.dispatchEvent(new Event('input'));
}