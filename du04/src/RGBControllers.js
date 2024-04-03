import Controller from "./Controller";

function RGBControllers() {
    const RGB = ['Red', 'Green', 'Blue']

    return (
        <>
            {RGB.map((color) => (
                <Controller
                    color = {color}
                />
            ))}
        </>
    );
}

export default RGBControllers;
