import React, { useState } from 'react';
import './Controller.css';

function Controller({ colorName, colorValue, updateColor }) {
    const [value, setValue] = useState(Number(colorValue));

    /**
     * Increases the value of the color by 1.
     */
    const increaseValue = () => {
        const newValue = Math.min(255, value + 1);
        setValue(newValue);
        updateColor(newValue); // Use the newly calculated value
    }

    /**
     * Decreases the value of the color by 1.
     */
    const decreaseValue = () => {
        const newValue = Math.max(0, value - 1);
        setValue(newValue);
        updateColor(newValue); // Use the newly calculated value
    };

    /**
     * Updates the value of the color.
     * @param e Event object
     */
    const updateValue = (e) => {
        let newValue = parseInt(e.target.value, 10);
        newValue = Math.min(255, Math.max(0, newValue));
        setValue(isNaN(newValue) ? 0 : newValue);
        updateColor(newValue);
    };

    return (
        <div id={'controller' + colorName} className="controller">
            <div id={'controllerText' + colorName} className='controllerText'>{colorName}</div>
            <button id={'controllerMinusButton' + colorName} className='controllerButton' onClick={decreaseValue}>-</button>
            <input
                type="range"
                min="0"
                max="255"
                id={'controllerSlider' + colorName}
                className='controllerSlider'
                value={value}
                onChange={updateValue}
            />
            <button id={'controllerPlusButton' + colorName} className='controllerButton' onClick={increaseValue}>+</button>
            <input
                type="number"
                min="0"
                max="255"
                id={'controllerValue' + colorName}
                className='controllerValue'
                value={value}
                onChange={updateValue}
            />
        </div>
    );
}

export default Controller;
