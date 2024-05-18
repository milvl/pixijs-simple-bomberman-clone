//promenna
let data = 1
//pole
let arr = [1, 2, 3, 4, 5]
console.log(data);
//zmena d. typu
//data = "Pes";

//cykly
for (i = 0; i < arr.length; i++) {
	console.log(arr[i]);
}

for (let object in arr) {
	//pro psani do dokumentu
	document.write(arr[object] + " ");
}

let a = 5;
while (a > 0) {
	console.log("Pes")
  a = a - 1;
}

//objekty
let auto = {
	barva: "zelena",
  cena: 500000,
  ridic: {
  	jmeno: "John",
    prijmeni: "Doe"
  }
};
auto.barva = "modra"
auto.ridic.jmeno = "Jan"
console.log(auto)

//foreach key
for (let key in auto) {
	console.log(key + " " + auto[key]);
}

//fce
function mojeFce(a, b, c) {
	console.log("Called(" + a + " " + b + " " + c + ")");
  return 1;
}

mojeFce(1, 2, 3);
mojeFce("Pes", [1, 2], {zvire: "pes"});
mojeFce(1);
mojeFce(1, 2, 3, 4, 5)
console.log(mojeFce());

let autoSFunkci = {
	palivo: 100,
  ujeto: 0,
  jezdi: function(kolik) {
  	this.palivo = this.palivo - kolik;
    this.ujeto = this.ujeto + kolik;
  }
}

console.log(autoSFunkci);
autoSFunkci.jezdi(10);
console.log(autoSFunkci);

let b = 10;
let c = 0.25;
console.log(b*c / b*c / b);
