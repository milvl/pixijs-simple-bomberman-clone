import React from 'react';
import './PrevColorWindows.css';

function PrevColorWindows({ prevColors, onSelectColor }) {
    return (
        <>
            {prevColors.map((colors, index) => (
                <div key={index} className="prevColorWindow"
                     style={{ backgroundColor: `rgb(${colors.Red}, ${colors.Green}, ${colors.Blue})` }}
                     onClick={() => onSelectColor(colors)}
                >
                </div>
            ))}
        </>
    );
}

export default PrevColorWindows;
