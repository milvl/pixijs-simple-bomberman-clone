document.addEventListener("DOMContentLoaded", function() {
    // buggy state
    const buggy = {
        latitude: parseFloat(document.getElementById('location').textContent.split(',')[0].split(':')[1].trim()),
        longitude: parseFloat(document.getElementById('location').textContent.split(',')[1].split(':')[1].trim()),
        cameraAngleX: parseInt(document.getElementById('cameraAngle').textContent.split('°')[0]),
        cameraAngleY: parseInt(document.getElementById('cameraAngle').textContent.split(', ')[1])
    };

    // update buggy state
    function updateBuggy(action, value) {
        switch(action) {
            case 'moveNorth':
                buggy.latitude += value;
                break;
            case 'moveSouth':
                buggy.latitude -= value;
                break;
            case 'moveEast':
                buggy.longitude += value;
                break;
            case 'moveWest':
                buggy.longitude -= value;
                break;
            case 'cameraUp':
                buggy.cameraAngleY = (buggy.cameraAngleY + value + 360) % 360;
                break;
            case 'cameraDown':
                buggy.cameraAngleY = (buggy.cameraAngleY - value + 360) % 360;
                break;
            case 'cameraLeft':
                buggy.cameraAngleX = (buggy.cameraAngleX - value + 360) % 360;
                break;
            case 'cameraRight':
                buggy.cameraAngleX = (buggy.cameraAngleX + value) % 360;
                break;
        }
        updateDisplay();
    }

    // update display based on buggy state
    function updateDisplay() {
        document.getElementById('location').textContent = `Latitude: ${buggy.latitude.toFixed(1)}, Longitude: ${buggy.longitude.toFixed(1)}`;
        document.getElementById('cameraAngle').textContent = `${buggy.cameraAngleX}°, ${buggy.cameraAngleY}°`;
    }

    // continuous action (hold button)
    let intervalId = null;

    function startContinuousAction(action, value) {
        if (intervalId !== null) 
            clearInterval(intervalId);
        intervalId = setInterval(() => updateBuggy(action, value), 100);
    }

    function stopContinuousAction() {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    // continuous action setup
    const continuousActions = {
        'forwardBtn': ['moveNorth', 0.1],
        'backwardBtn': ['moveSouth', 0.1],
        'leftBtn': ['moveWest', 0.1],
        'rightBtn': ['moveEast', 0.1],
        'cameraUpBtn': ['cameraUp', 1],
        'cameraDownBtn': ['cameraDown', 1],
        'cameraLeftBtn': ['cameraLeft', 1],
        'cameraRightBtn': ['cameraRight', 1]
    };

    // attach event listeners for continuous action
    Object.keys(continuousActions).forEach(id => {
        const element = document.getElementById(id);
        const [action, value] = continuousActions[id];

        element.addEventListener('mousedown', (e) => {
            updateBuggy(action, value); // execute action once immediately for single click
            startContinuousAction(action, value); // then start continuous action for holding down
        });
        element.addEventListener('mouseup', stopContinuousAction);
        element.addEventListener('mouseleave', stopContinuousAction);
    });
    updateDisplay(); // initialize display

    /**************************************************/
    // on/off and restart
    let isOn = !document.getElementById('systemOnOffStat').checked;

    // on/off
    document.getElementById('systemOnOffStat').addEventListener('change', function() {
        isOn = !isOn;
        if (isOn) {
            document.getElementById('onLight').style.color = 'green';
            document.getElementById('offLight').style.color = 'gray';
        } else {
            document.getElementById('onLight').style.color = 'gray';
            document.getElementById('offLight').style.color = 'red';
        }
    });

    // restart
    document.getElementById('restartBttn').addEventListener('click', function() {
        isOn = true;
        document.getElementById('systemOnOffStat').checked = false;
        document.getElementById('onLight').style.color = 'green';
        document.getElementById('offLight').style.color = 'gray';
    });

    /**************************************************/
    // on/off and HUD
    let isHUDOn = !document.getElementById('HUDOnOffStat').checked;

    // on/off
    document.getElementById('HUDOnOffStat').addEventListener('change', function() {
        isHUDOn = !isHUDOn;
        if (isHUDOn) {
            document.getElementById('onLightHUD').style.color = 'green';
            document.getElementById('offLightHUD').style.color = 'gray';
            let e;
            e = document.getElementById('locationBox');
            e.hidden = false;
            e.style.display = 'grid';

            e = document.getElementById('cameraAngleBox');
            e.hidden = false;
            e.style.display = 'grid';

            e = document.getElementById('systemController');
            e.hidden = false;
            e.style.display = 'flex';

            e = document.getElementById('sensorsBox');
            e.hidden = false;
            e.style.display = 'flex';

            e = document.getElementById('energySourceOptionsBox');
            e.hidden = false;
            e.style.display = 'flex';

            e = document.getElementById('infoBox');
            e.hidden = false;
            e.style.display = 'flex';

            e = document.getElementById('statusBox');
            e.hidden = false;
            e.style.display = 'flex';

            e = document.getElementById('accessPanel');
            e.hidden = true;
            e.style.display = 'flex';

            let movBttns = document.getElementsByClassName('movementButtons');
            let camBttns = document.getElementsByClassName('cameraButtons');
            for (let i = 0; i < movBttns.length; i++) {
                movBttns[i].hidden = false;
                movBttns[i].style.display = 'grid';
            }
            for (let i = 0; i < camBttns.length; i++) {
                camBttns[i].hidden = false;
                camBttns[i].style.display = 'grid';

            }
        } else {
            document.getElementById('onLightHUD').style.color = 'gray';
            document.getElementById('offLightHUD').style.color = 'red';
            let e;
            e = document.getElementById('locationBox');
            e.hidden = true;
            e.style.display = 'none';

            e = document.getElementById('cameraAngleBox');
            e.hidden = true;
            e.style.display = 'none';

            e = document.getElementById('systemController');
            e.hidden = true;
            e.style.display = 'none';

            e = document.getElementById('sensorsBox');
            e.hidden = true;
            e.style.display = 'none';

            e = document.getElementById('energySourceOptionsBox');
            e.hidden = true;
            e.style.display = 'none';

            e = document.getElementById('infoBox');
            e.hidden = true;
            e.style.display = 'none';

            e = document.getElementById('statusBox');
            e.hidden = true;
            e.style.display = 'none';

            e = document.getElementById('accessPanel');
            e.hidden = true;
            e.style.display = 'none';

            let movBttns = document.getElementsByClassName('movementButtons');
            let camBttns = document.getElementsByClassName('cameraButtons');
            for (let i = 0; i < movBttns.length; i++) {
                movBttns[i].hidden = true;
                movBttns[i].style.display = 'none';
            }
            for (let i = 0; i < camBttns.length; i++) {
                camBttns[i].hidden = true;
                camBttns[i].style.display = 'none';
            }
        }
    });
});
