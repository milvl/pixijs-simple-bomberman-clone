import './ColorWindow.css';

function ColorWindow() {
    return (
        <div className="colorRectBox">
            <div id="rgbText">RGB(128, 128, 128)</div>
            <div id="hexText">HEX: #808080</div>
        </div>
    );
}

export default ColorWindow;
