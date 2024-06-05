import './KeywordSelect.css'
import { useState, useEffect } from 'react';
import { Select, MenuItem, Button } from '@mui/material';

const keywordSelectPanelId = 'keywordSelectPanel';
const keywordSelectId = 'keywordSelect';
const labelId = 'label';

/**
 * Returns a dynamic select component.
 * @param label The label.
 * @param rows The rows.
 * @param onKeywordSelect The function to call when a keyword is selected.
 * @param buttonLabel The label of the button.
 * @returns {Element} The component.
 * @constructor
 */
export function KeywordSelect({ label, rows, onKeywordSelect, buttonLabel }) {
    const [keywords, setKeywords] = useState([]);
    const [selectedKeyword, setSelectedKeyword] = useState('');

    /**
     * Updates the keywords when the rows change.
     */
    useEffect(() => {
        const allKeywords = new Set();
        rows.forEach(row => {
            row.keywords.forEach(keyword => {
                if (keyword) {
                    allKeywords.add(keyword);
                }
            });
        });
        setKeywords(Array.from(allKeywords));
    }, [rows]);

    /**
     * Handles the change of the selected keyword.
     * @param event
     */
    const handleChange = (event) => {
        setSelectedKeyword(event.target.value);
    };

    /**
     * Handles the click on the button.
     */
    const handleButtonClick = () => {
        if (onKeywordSelect) {
            onKeywordSelect(selectedKeyword);
        }
    };

    return (
        <div id={keywordSelectPanelId}>
            <div id={labelId}>{label}</div>
            <Select
                id={keywordSelectId}
                value={selectedKeyword}
                onChange={handleChange}
                displayEmpty
                renderValue={selectedValue => selectedValue || ''}

            >
                {keywords.map((keyword, index) => (
                    <MenuItem key={index} value={keyword}>
                        {keyword}
                    </MenuItem>
                ))}
            </Select>
            <Button
                onClick={handleButtonClick}
                >
                {buttonLabel || 'Action'}
            </Button>
        </div>
    );
}

// export default KeywordSelect;
