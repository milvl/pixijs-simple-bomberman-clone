import './ColorWindow.css'

function ColorWindow({ colors }) {

    /**
     * Converts RGB to HEX
     * @param r Red value
     * @param g Green value
     * @param b Blue value
     * @returns {string} String representation of the HEX color
     */
    const rgbToHex = (r, g, b) => {
        const res = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        return res.toUpperCase();
    }

    /**
     * HEX color string
     * @type {string} HEX color string
     */
    const hexColor = rgbToHex(colors.Red, colors.Green, colors.Blue);

    /**
     * Gets the relative luminance of a color
     * @param color Object containing the Red, Green, and Blue values
     * @returns {number} Relative luminance of the color
     */
    function getRelativeLuminance(color) {
        const [r, g, b] = [color.Red, color.Green, color.Blue].map((val) => {
            val /= 255;
            return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    /**
     * Relative luminance of the color
     * @type {number} Relative luminance of the color
     */
    const relativeLuminance = getRelativeLuminance(colors);

    /**
     * Style object for the color rectangle
     * @type {{backgroundColor: string, color: (string)}} Style object for the color rectangle
     */
    const style = {
        color: relativeLuminance > 0.179 ? 'black' : 'white', // Adjust threshold as needed
        backgroundColor: hexColor,
    };

    return (
        <div style={style} className="colorRectBox">
            <div id="rgbText">RGB({colors.Red}, {colors.Green}, {colors.Blue})</div>
            <div id="hexText">HEX: {hexColor}</div>
        </div>
    );
}

export default ColorWindow;
