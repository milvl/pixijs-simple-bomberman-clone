let rValue = document.getElementById('RValue');
let gValue = document.getElementById('GValue');
let bValue = document.getElementById('BValue');

let colorBoxes = document.getElementsByClassName('box');
console.log(colorBoxes.length);


function printData() {
    function createCSSColor(r, g, b) {
      return 'rgb(' + r + ', ' + g + ', ' + b + ")";
    }

		let color = createCSSColor(rValue.value, gValue.value, bValue.value)
    console.log(color);

    for (let elem of colorBoxes) {
      elem.style.backgroundColor = color;
    }
}

function decreaseR() {
	rValue.value = parseInt(rValue.value) - 10;
  printData();
}

function increaseR() {
	rValue.value = parseInt(rValue.value) + 10;
  printData();
}