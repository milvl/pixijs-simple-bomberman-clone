import './ColorPicker.css';
import ColorWindow from "./ColorWindow";
import RGBControllers from "./RGBControllers";
import { useState } from "react";

function ColorPicker() {
    const [colors, setColors] = useState({Red: 128, Green: 128, Blue: 128});

    /**
     * Updates the color value in the colors object.
     * @param color Color to update
     * @param value New value for the color
     */
    const updateColor = (color, value) => {
        setColors((prevColors) => ({
            ...prevColors,
            [color]: value
        }));
    };

    return (
        <div className="boundingBox">
            <div className="window">
                <ColorWindow colors={colors} />
            </div>
            <div className="controllersBox">
                <RGBControllers colors={colors} updateColor={updateColor} />
            </div>
        </div>
    );
}

export default ColorPicker;
