import React, { useState } from 'react';
import './Controller.css';

function Controller({ color }) {
    const [value, setValue] = useState(128);

    const increaseValue = () =>
        setValue((prevValue) =>
            Math.min(255, prevValue + 1));

    const decreaseValue = () =>
        setValue((prevValue) =>
            Math.max(0, prevValue - 1));

    const updateValue = (e) => {
        let newValue = parseInt(e.target.value, 10);
        newValue = Math.min(255, Math.max(0, newValue));
        setValue(isNaN(newValue) ? 0 : newValue);
    };

    return (
        <div id={'controller' + color} className="controller">
            <div id={'controllerText' + color} className='controllerText'>{color}</div>
            <button id={'controllerMinusButton' + color} className='controllerButton' onClick={decreaseValue}>-</button>
            <input
                type="range"
                min="0"
                max="255"
                id={'controllerSlider' + color}
                className='controllerSlider'
                value={value}
                onChange={updateValue}
            />
            <button id={'controllerPlusButton' + color} className='controllerButton' onClick={increaseValue}>+</button>
            <input
                type="number"
                min="0"
                max="255"
                id={'controllerValue' + color}
                className='controllerValue'
                value={value}
                onChange={updateValue}
            />
        </div>
    );
}

export default Controller;
