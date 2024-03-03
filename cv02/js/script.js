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
            updateBuggy(action, value); // Execute action once immediately for single click
            startContinuousAction(action, value); // Then start continuous action for holding down
        });
        element.addEventListener('mouseup', stopContinuousAction);
        element.addEventListener('mouseleave', stopContinuousAction);

        // For touch devices
        element.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevents scrolling on touch devices
            updateBuggy(action, value); // Execute action once immediately for single tap
            startContinuousAction(action, value); // Then start continuous action for holding down
        });
        element.addEventListener('touchend', stopContinuousAction);
    });
    updateDisplay(); // initialize display
});
