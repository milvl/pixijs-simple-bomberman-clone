import Controller from "./Controller";

function RGBControllers({ colors, updateColor }) {
    const RGB = ['Red', 'Green', 'Blue']

    return (
        <>
            {RGB.map((color) => (
                <Controller
                    key={color} // React needs a unique key for list items
                    colorName={color}
                    colorValue={colors[color]}
                    updateColor={(value) => updateColor(color, value)} // passing a function to update the color
                />
            ))}
        </>
    );
}

export default RGBControllers;
