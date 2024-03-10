class Car {
	constructor(SPZ, fuelCap,initFuel, initDriven) {
    // sanity checks
    if (typeof SPZ !== 'string') {
      return undefined;
    }
    if (typeof initFuel !== 'number' || typeof initDriven !== 'number' || typeof fuelCap !== 'number') {
      return undefined;
    }
    if (initFuel > fuelCap) {
    	return undefined;
    }
		
    this.SPZ = SPZ;
    this.fuelCap = fuelCap;
    this.fuelLevel = initFuel;
    this.driven = initDriven;
  }
  
  
  ride(distance) {
      // sanity checks
      if (typeof distance !== 'number') {
        return 0;
      }
      if (distance < 0) {
        return 0;
      }
      
      if (distance <= this.fuelLevel) {
        this.fuelLevel = this.fuelLevel - distance;
        this.driven = this.driven + distance;
        return distance;
      }
      else {
        return 0;
      }
  }
  
  fuel(volume) {
		  // sanity checks
      if (typeof volume !== 'number') {
        return 0;
      }
      if (volume < 0) {
        return 0;
      }
      
      const availableSpace = this.fuelCap - this.fuelLevel;
 			const actualVolumeAdded = Math.min(volume, availableSpace);
  		this.fuelLevel += actualVolumeAdded;
     
      return actualVolumeAdded;
  }
}

///////////////////////////////////////////////////////////////////////////////
const MAX = 999

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function prepareData() {
  let smallestFuelCap = Number.MAX_SAFE_INTEGER
  let tanks = [];
  for (let i = 0; i < 5; i++) {
    let fuelCap = -1
    while (fuelCap % 2 != 0) {
      fuelCap = getRandomInt(MAX)  // very inefficient but for this task is OK
    }
    smallestFuelCap = Math.min(smallestFuelCap, fuelCap)
    tanks[i] = new Car("tank" + (i + 1), fuelCap, fuelCap / 2, getRandomInt(MAX));
  }
  tanks[5] = new Car("tank6", smallestFuelCap, smallestFuelCap / 2, getRandomInt(MAX))
  
	return {"tanks": tanks, "smallestFuelCap": smallestFuelCap}
}

function printInfo01(tanks) {
	for (let tank of tanks) {
  	let fSPZ, fDriven, fFuel, fFuelCap
    const padLen = MAX.toString().length
    fSPZ = tank.SPZ.toString().padStart(padLen, '0')
    fDriven = tank.driven.toString().padStart(padLen, '0')
    fFuel = tank.fuelLevel.toString().padStart(padLen, '0')
    fFuelCap = tank.fuelCap.toString().padStart(padLen, '0')
  	msg = `SPZ: '${fSPZ}';\todometer: ${fDriven} km;\tfuel: ${fFuel} l;\tfuel capacity: ${fFuelCap} l`
    console.log(msg)
  }
}

function printInfo02(tanks) {
	console.log("Tanks not moved:")
	for (let tank of tanks) {
  	if (tank.not_moved && tank.not_moved == true) {
    	msg = `SPZ: '${tank.SPZ}';`
    	console.log(msg)
    }
  }
}

function moveCars(cars, distance) {
	for (let car of cars) {
  	let res = car.ride(distance)
    if (res == 0) {
    	car.not_moved = true
    }
  }
}

function fuelTanks(tanks, maxTanksFilled) {
	let countFilled = 0
  
  while (countFilled < maxTanksFilled || countFilled < tanks.length) {
  	for (let tank of tanks) {
    	tank.fuel(1)		// very inefficient but for this task is OK
      if (tank.fuelLevel == tank.fuelCap) {
      	countFilled++
      }
    }
  }
}

function main() {
	let data = prepareData()
  let tanks = data.tanks
  let smallestFuelVolume = data.smallestFuelCap / 2

	console.log("Tanks created:")
  printInfo01(tanks)
  
  console.log()
  console.log("Moving tanks first time...")
  moveCars(tanks, smallestFuelVolume - 10) 
  printInfo01(tanks)
  
  console.log()
  console.log("Moving tanks 15 km...")
  moveCars(tanks, 15) 
  printInfo01(tanks)
  printInfo02(tanks)
  
  console.log()
  console.log("Fueling up tanks...")
  fuelTanks(tanks, 2)
  printInfo01(tanks)
  
  console.log("Terminating...")
}

main()
//mvlach\\