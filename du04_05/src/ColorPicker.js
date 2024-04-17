import './ColorPicker.css';
import ColorWindow from "./ColorWindow";
import RGBControllers from "./RGBControllers";
import PrevColorWindows from "./PrevColorWindows";
import { useState } from "react";

function ColorPicker() {
    const initialColors = {Red: 128, Green: 128, Blue: 128};
    const [colors, setColors] = useState(initialColors);
    const [prevColors, setPrevColors] = useState(Array(5).fill(initialColors));

    /**
     * Updates the color value in the colors object.
     * @param color Color to update
     * @param value New value for the color
     */
    const updateColor = (color, value) => {
        setColors(prev => ({
            ...prev,
            [color]: value
        }));
    };

    /**
     * Saves the current color to the history.
     */
    const saveToHistory = () => {
        setPrevColors(prevHistory => [colors, ...prevHistory.slice(0, 4)]);
    };

    /**
     * Handles the selection of a color from the history.
     * @param selectedColors Selected color
     */
    const handleSelectColor = (selectedColors) => {
        setColors(selectedColors);
    };

    return (
        <div className="boundingBox">
            <div className="window">
                <ColorWindow colors={colors}/>
            </div>
            <div className="prevColorWindows">
                <PrevColorWindows prevColors={prevColors} onSelectColor={handleSelectColor} />
            </div>
            <div className="controllersBox">
                <RGBControllers colors={colors} updateColor={updateColor}/>
                <button id='submitHistoryButton' onClick={saveToHistory}>Save Color to History</button>
            </div>
        </div>
    );
}

export default ColorPicker;
