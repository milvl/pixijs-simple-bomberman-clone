import './App.css';
import {dataGridLocaleEn, i18next} from './translations';
import {useTranslation} from 'react-i18next';
import LanguageSelection from "./LanguageSelection";
import {columnsDefinitions, getInitRows} from "./tableDefinition";
import Box from '@mui/material/Box';
import {DataGrid, GridToolbar} from '@mui/x-data-grid';
import {enUS} from '@mui/x-data-grid/locales'
import {Button, createTheme, Dialog, ThemeProvider, Tooltip} from "@mui/material";
import {KeywordSelect} from './KeywordSelect';
import {useState} from "react";

const headerId = 'header';
const titleId = 'title';
const contentId = 'content';
const actionPanelId = 'actionPanel';
const deleteRowButtonId = 'deleteRowButton';
const deleteRowButtonId2 = 'deleteRowButton2';
const deleteDialogId = 'deleteDialog';
const dialogDeleteButtonsClassId = 'dialogDeleteButtons';
const closeButtonId = 'closeButton';

/**
 * The theme of the application.
 * @type {Theme} The theme.
 */
const theme = createTheme({
    palette: {
        app: {
            main: '#282c34',
            light: '#3a3f4b',
            dark: '#20232a',
            contrastText: '#fff',
        },
    },
});

/**
 * The main component of the application.
 * @returns {JSX.Element} The component.
 * @constructor
 */
function App() {
    /**
     * The useTranslation hook is used to access the t function, which is used to translate text.
     */
    const { t } = useTranslation();

    /**
     * Returns the text for the locale.
     * @returns {Object} The locale text.
     */
    const getLocaleText = () => {
        const locale = {};
        Object.keys(dataGridLocaleEn).forEach((key) => {
            locale[key] = t(key.toString());
        });

        return {
            ...enUS.components.MuiDataGrid.defaultProps.localeText,

            ...locale
        };
    }

    /**
     * The definitions of the columns in the table.
     * @type {Array} The columns.
     */
    const columnsDef = columnsDefinitions;
    columnsDefinitions.forEach((column) => {
        column.headerName = t(column.field);
        if (column.field === 'type') {
            column.renderCell = (params) => {
                return t(params.value);
            }
        }
    });

    // useState hook to manage columns
    const [columns, setColumns] = useState(columnsDef);
    // useState hook to manage localization
    const [localeText, setLocaleText] = useState(getLocaleText());
    // useState hook to manage the rows
    const [rows, setRows] = useState(getInitRows());
    // useState hook to manage the selected rows
    const [selectedRowsIds, setSelectedRowsIds] = useState([]);

    /**
     * Handles the change of the language.
     * @param language The new language to use.
     */
    function handleLanguageChange(language) {
        i18next.changeLanguage(language);

        // update the columns
        const newColumns = columnsDef.map((column) => {
            column.headerName = t(column.field);
            if (column.field === 'type') {
                column.renderCell = (params) => {
                    return t(params.value);
                }
            }
            return column;
        });
        setColumns(newColumns);

        // update the locale text
        setLocaleText(getLocaleText());
    }

    /**
     * Handles the addition of a new row.
     */
    const handleAddRow = () => {
        const newId = rows.reduce((maxId, row) => Math.max(row.id, maxId), -1) + 1;
        const newRow = {
            id: newId,
            name: 'id' + newId,
            releaseDate: new Date(),
            type: 'unspecified',
            keywords: []
        }
        setRows([...rows, newRow]);
    }

    const [open, setOpen] = useState(false);

    /**
     * Handles the opening of the delete dialog.
     */
    const handleDeleteOpen = () => {
        setOpen(true);
    };

    /**
     * Handles the closing of the delete dialog.
     */
    const handleDeleteClose = () => {
        setOpen(false);
    };

    /**
     * Handles the deletion of a row.
     */
    const handleDeleteRow = () => {
        const newRows = rows.filter((row) => !selectedRowsIds.includes(row.id));
        setRows(newRows);
        setOpen(false);
        setSelectedRowsIds([]);
    }

    /**
     * Handles the deletion of a keyword.
     * @param keyword The keyword to delete.
     */
    const handleDeleteKeyword = (keyword) => {
        for (const row of rows) {
            row.keywords = row.keywords.filter((k) => k !== keyword);
        }
        setRows([...rows]);
    }

    /**
     * Processes the update of a row.
     * @param newRow The new row.
     * @param oldRow The old row.
     * @returns {*} The new row.
     */
    const processRowUpdate = (newRow, oldRow) => {
        if (newRow && typeof newRow.keywords === 'string') {
            newRow.keywords = newRow.keywords.split(',').map(keyword => keyword.trim());
        }

        setRows(rows.map(row => (row.id === newRow.id ? newRow : row)));
        return newRow;
    };

    // const handleRowProcessError = (error) => {
    //     console.log('error', error)
    // }

    /**
     * Returns whether the delete button is disabled.
     * @returns {boolean}
     */
    const getDeleteButtonDisabled = () => {
        return selectedRowsIds === null || selectedRowsIds.length === 0;
    }

return (
    <ThemeProvider theme={theme}>
    <div className="App">

        {/* header */}
        <div id={headerId}>
            <div id={titleId}>
                <h1>{t('title')}</h1>
            </div>
            <LanguageSelection onLanguageChange={handleLanguageChange} />
        </div>

        {/* content */}
        <Box id={contentId} >

            {/* keyword select panel */}
            <KeywordSelect
                label={t('keywordSelectLabel')}
                rows={rows}
                onKeywordSelect={handleDeleteKeyword}
                buttonLabel={t('deleteKeyword')} />

            {/* action panel */}
            <div className={actionPanelId}>

                    {/* add new record button */}
                    <Button
                        variant="outlined"
                        color="app"
                        onClick={handleAddRow}
                    >
                        {t('addRow')}
                    </Button>
                    {/* delete selected record button */}
                    <Button id={deleteRowButtonId}
                        variant="outlined"
                        color="app"
                        disabled={getDeleteButtonDisabled()}
                        onClick={handleDeleteOpen}
                    >
                        {t('deleteRow')}
                    </Button>
                    <Dialog
                        open={open}
                        onClose={handleDeleteClose}>
                        <div>
                            <h3 id={deleteDialogId}> {t('deletePrompt')} </h3>
                            <Button
                                id={deleteRowButtonId2}
                                className={dialogDeleteButtonsClassId}
                                variant="outlined"
                                color="app"
                                onClick={handleDeleteRow}>
                                {t('yes')}
                            </Button>

                            <Button
                                className={dialogDeleteButtonsClassId}
                                variant="outlined"
                                color="app"
                                onClick={handleDeleteClose}>
                                {t('no')}
                            </Button>
                        </div>
                    </Dialog>
            </div>

            {/* data grid */}
            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkboxSelection
                disableRowSelectionOnClick
                onRowSelectionModelChange={(newSelection) => {
                    setSelectedRowsIds(newSelection);
                }}
                rowSelectionModel={selectedRowsIds}
                processRowUpdate={processRowUpdate}
                // onProcessRowUpdateError={handleRowProcessError}
                localeText={localeText}
                slots={{
                    toolbar: GridToolbar,
                }}
            />
        </Box>
        <Tooltip
            title={t('closeTooltip')}
            placement={'top'}
        >
            <Button
                id={closeButtonId}
                variant="outlined"
                color="app"
                onClick={() => {window.close()}}
            >
                {t('close')}
            </Button>
        </Tooltip>
    </div>
    </ThemeProvider>
);
}

export default App;
