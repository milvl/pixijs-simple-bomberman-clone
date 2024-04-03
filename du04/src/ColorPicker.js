import './ColorPicker.css';
import ColorWindow from "./ColorWindow";
import RGBControllers from "./RGBControllers";

function ColorPicker() {
    return (
        <div className="boundingBox">
            <div className="window">
                <ColorWindow />
            </div>
            <div className="controllersBox">
                <RGBControllers />
            </div>
        </div>
    );
}

export default ColorPicker;
