import './LanguageSelection.css';
import {Tooltip} from "@mui/material";

const languageSelectionId = 'languageSelection';
const englishButtonId = 'englishButton';
const englishString = 'en';
const czechButtonId = 'czechButton';
const czechString = 'cs';
const buttonClassId = 'languageButton';

/**
 * Returns component with two buttons to change the language.
 * @param props The properties of the component.
 * @param props.onLanguageChange The function to call when the language is changed.
 * @returns {JSX.Element} The component.
 * @constructor
 */
function LanguageSelection(props) {
    return (
        <div id={languageSelectionId}>
            <Tooltip title={'Change language to english'} placement={'top'}>
            <button id={englishButtonId}
                    className={buttonClassId}
                    onClick={() => props.onLanguageChange(englishString)}>{englishString.toUpperCase()}
            </button>
            </Tooltip>
            <Tooltip title={'Změnit jazyk na češtinu'} placement={'top'}>
            <button id={czechButtonId}
                    className={buttonClassId}
                    onClick={() => props.onLanguageChange(czechString)}>{czechString.toUpperCase()}
            </button>
            </Tooltip>
        </div>
    );
}

export default LanguageSelection;