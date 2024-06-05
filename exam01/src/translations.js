import i18next from "i18next";
import { initReactI18next } from "react-i18next";

export const dataGridLocaleEn = {
    // DataGrid labels
    // Root
    'noRowsLabel': 'No rows',
    'noResultsOverlayLabel': 'No results found.',
    // Density selector toolbar button text
    'toolbarDensity': 'Density',
    'toolbarDensityLabel': 'Density',
    'toolbarDensityCompact': 'Compact',
    'toolbarDensityStandard': 'Standard',
    'toolbarDensityComfortable': 'Comfortable',
    // Columns selector toolbar button text
    'toolbarColumns': 'Columns',
    'toolbarColumnsLabel': 'Select columns',
    // Filters toolbar button text
    'toolbarFilters': 'Filters',
    'toolbarFiltersLabel': 'Show filters',
    'toolbarFiltersTooltipHide': 'Hide filters',
    'toolbarFiltersTooltipShow': 'Show filters',
    // Quick filter toolbar field
    'toolbarQuickFilterPlaceholder': 'Search…',
    'toolbarQuickFilterLabel': 'Search',
    'toolbarQuickFilterDeleteIconLabel': 'Clear',
    // Export selector toolbar button text
    'toolbarExport': 'Export',
    'toolbarExportLabel': 'Export',
    'toolbarExportCSV': 'Download as CSV',
    'toolbarExportPrint': 'Print',
    'toolbarExportExcel': 'Download as Excel',
    // Columns management text
    'columnsManagementSearchTitle': 'Search',
    'columnsManagementNoColumns': 'No columns',
    'columnsManagementShowHideAllText': 'Show/Hide All',
    'columnsManagementReset': 'Reset',
    // Filter panel text
    'filterPanelAddFilter': 'Add filter',
    'filterPanelRemoveAll': 'Remove all',
    'filterPanelDeleteIconLabel': 'Delete',
    'filterPanelLogicOperator': 'Logic operator',
    'filterPanelOperator': 'Operator',
    'filterPanelOperatorAnd': 'And',
    'filterPanelOperatorOr': 'Or',
    'filterPanelColumns': 'Columns',
    'filterPanelInputLabel': 'Value',
    'filterPanelInputPlaceholder': 'Filter value',
    // Filter operators text
    'filterOperatorContains': 'contains',
    'filterOperatorEquals': 'equals',
    'filterOperatorStartsWith': 'starts with',
    'filterOperatorEndsWith': 'ends with',
    'filterOperatorIs': 'is',
    'filterOperatorNot': 'is not',
    'filterOperatorAfter': 'is after',
    'filterOperatorOnOrAfter': 'is on or after',
    'filterOperatorBefore': 'is before',
    'filterOperatorOnOrBefore': 'is on or before',
    'filterOperatorIsEmpty': 'is empty',
    'filterOperatorIsNotEmpty': 'is not empty',
    'filterOperatorIsAnyOf': 'is any of',
    // Header filter operators text
    'headerFilterOperatorContains': 'Contains',
    'headerFilterOperatorEquals': 'Equals',
    'headerFilterOperatorStartsWith': 'Starts with',
    'headerFilterOperatorEndsWith': 'Ends with',
    'headerFilterOperatorIs': 'Is',
    'headerFilterOperatorNot': 'Is not',
    'headerFilterOperatorAfter': 'Is after',
    'headerFilterOperatorOnOrAfter': 'Is on or after',
    'headerFilterOperatorBefore': 'Is before',
    'headerFilterOperatorOnOrBefore': 'Is on or before',
    'headerFilterOperatorIsEmpty': 'Is empty',
    'headerFilterOperatorIsNotEmpty': 'Is not empty',
    'headerFilterOperatorIsAnyOf': 'Is any of',
    'headerFilterOperator=': 'Equals',
    'headerFilterOperator!=': 'Not equals',
    'headerFilterOperator>': 'Greater than',
    'headerFilterOperator>=': 'Greater than or equal to',
    'headerFilterOperator<': 'Less than',
    'headerFilterOperator<=': 'Less than or equal to',
    // Filter values text
    'filterValueAny': 'any',
    'filterValueTrue': 'true',
    'filterValueFalse': 'false',
    // Column menu text
    'columnMenuLabel': 'Menu',
    'columnMenuShowColumns': 'Show columns',
    'columnMenuManageColumns': 'Manage columns',
    'columnMenuFilter': 'Filter',
    'columnMenuHideColumn': 'Hide column',
    'columnMenuUnsort': 'Unsort',
    'columnMenuSortAsc': 'Sort by ASC',
    'columnMenuSortDesc': 'Sort by DESC',
    // Column header text
    'columnHeaderFiltersLabel': 'Show filters',
    'columnHeaderSortIconLabel': 'Sort',
    // Total row amount footer text
    'footerTotalRows': 'Total Rows:',
    // Checkbox selection text
    'checkboxSelectionHeaderName': 'Checkbox selection',
    'checkboxSelectionSelectAllRows': 'Select all rows',
    'checkboxSelectionUnselectAllRows': 'Unselect all rows',
    'checkboxSelectionSelectRow': 'Select row',
    'checkboxSelectionUnselectRow': 'Unselect row',
    // Boolean cell text
    'booleanCellTrueLabel': 'yes',
    'booleanCellFalseLabel': 'no',
    // Actions cell more text
    'actionsCellMore': 'more',
    // Column pinning text
    'pinToLeft': 'Pin to left',
    'pinToRight': 'Pin to right',
    'unpin': 'Unpin',
    // Tree Data
    'treeDataGroupingHeaderName': 'Group',
    'treeDataExpand': 'see children',
    'treeDataCollapse': 'hide children',
    // Grouping columns
    'groupingColumnHeaderName': 'Group',
    // Master/detail
    'detailPanelToggle': 'Detail panel toggle',
    'expandDetailPanel': 'Expand',
    'collapseDetailPanel': 'Collapse',
    // Used core components translation keys
    'MuiTablePagination': {},
    // Row reordering text
    'rowReorderingHeaderName': 'Row reordering',
    // Aggregation
    'aggregationMenuItemHeader': 'Aggregation',
    'aggregationFunctionLabelSum': 'sum',
    'aggregationFunctionLabelAvg': 'avg',
    'aggregationFunctionLabelMin': 'min',
    'aggregationFunctionLabelMax': 'max',
    'aggregationFunctionLabelSize': 'size',
}

const dataGridLocaleCs = {
    // DataGrid labels
    // Root
    'noRowsLabel': 'Žádné řádky',
    'noResultsOverlayLabel': 'Nebyly nalezeny žádné výsledky.',
    // Density selector toolbar button text
    'toolbarDensity': 'Mezera mezi řádky',
    'toolbarDensityLabel': 'Mezera mezi řádky',
    'toolbarDensityCompact': 'Kompaktní',
    'toolbarDensityStandard': 'Standardní',
    'toolbarDensityComfortable': 'Široká',
    // Columns selector toolbar button text
    'toolbarColumns': 'Sloupce',
    'toolbarColumnsLabel': 'Vyberte sloupce',
    // Filters toolbar button text
    'toolbarFilters': 'Filtry',
    'toolbarFiltersLabel': 'Zobrazit filtry',
    'toolbarFiltersTooltipHide': 'Skrýt filtry',
    'toolbarFiltersTooltipShow': 'Zobrazit filtry',
    // Quick filter toolbar field
    'toolbarQuickFilterPlaceholder': 'Hledat…',
    'toolbarQuickFilterLabel': 'Hledat',
    'toolbarQuickFilterDeleteIconLabel': 'Vymazat',
    // Export selector toolbar button text
    'toolbarExport': 'Export',
    'toolbarExportLabel': 'Export',
    'toolbarExportCSV': 'Stáhnout jako CSV',
    'toolbarExportPrint': 'Tisk',
    'toolbarExportExcel': 'Stáhnout jako Excel',
    // Columns management text
    'columnsManagementSearchTitle': 'Hledat',
    'columnsManagementNoColumns': 'Žádné sloupce',
    'columnsManagementShowHideAllText': 'Zobrazit/Skrýt vše',
    'columnsManagementReset': 'Resetovat',
    // Filter panel text
    'filterPanelAddFilter': 'Přidat filtr',
    'filterPanelRemoveAll': 'Odstranit vše',
    'filterPanelDeleteIconLabel': 'Smazat',
    'filterPanelLogicOperator': 'Logický operátor',
    'filterPanelOperator': 'Operátor',
    'filterPanelOperatorAnd': 'A',
    'filterPanelOperatorOr': 'Nebo',
    'filterPanelColumns': 'Sloupce',
    'filterPanelInputLabel': 'Hodnota',
    'filterPanelInputPlaceholder': 'Hodnota filtru',
    // Filter operators text
    'filterOperatorContains': 'obsahuje',
    'filterOperatorEquals': 'rovná se',
    'filterOperatorStartsWith': 'začíná na',
    'filterOperatorEndsWith': 'končí na',
    'filterOperatorIs': 'je',
    'filterOperatorNot': 'není',
    'filterOperatorAfter': 'je po',
    'filterOperatorOnOrAfter': 'je na nebo po',
    'filterOperatorBefore': 'je před',
    'filterOperatorOnOrBefore': 'je na nebo před',
    'filterOperatorIsEmpty': 'je prázdný',
    'filterOperatorIsNotEmpty': 'není prázdný',
    'filterOperatorIsAnyOf': 'je některý z',
    // Header filter operators text
    'headerFilterOperatorContains': 'Obsahuje',
    'headerFilterOperatorEquals': 'Rovná se',
    'headerFilterOperatorStartsWith': 'Začíná na',
    'headerFilterOperatorEndsWith': 'Končí na',
    'headerFilterOperatorIs': 'Je',
    'headerFilterOperatorNot': 'Není',
    'headerFilterOperatorAfter': 'Je po',
    'headerFilterOperatorOnOrAfter': 'Je na nebo po',
    'headerFilterOperatorBefore': 'Je před',
    'headerFilterOperatorOnOrBefore': 'Je na nebo před',
    'headerFilterOperatorIsEmpty': 'Je prázdný',
    'headerFilterOperatorIsNotEmpty': 'Není prázdný',
    'headerFilterOperatorIsAnyOf': 'Je některý z',
    'headerFilterOperator=': 'Rovná se',
    'headerFilterOperator!=': 'Nerovná se',
    'headerFilterOperator>': 'Větší než',
    'headerFilterOperator>=': 'Větší než nebo rovno',
    'headerFilterOperator<': 'Menší než',
    'headerFilterOperator<=': 'Menší než nebo rovno',
    // Filter values text
    "filterValueAny": "jakýkoliv",
    "filterValueTrue": "ano",
    "filterValueFalse": "ne",
    // Column menu text
    "columnMenuLabel": "Menu",
    "columnMenuShowColumns": "Zobrazit sloupce",
    "columnMenuManageColumns": "Spravovat sloupce",
    "columnMenuFilter": "Filtr",
    "columnMenuHideColumn": "Skrýt sloupec",
    "columnMenuUnsort": "Zrušit řazení",
    "columnMenuSortAsc": "Řadit vzestupně",
    "columnMenuSortDesc": "Řadit sestupně",
    // Column header text
    "columnHeaderFiltersLabel": "Zobrazit filtry",
    "columnHeaderSortIconLabel": "Řadit",
    // Total row amount footer text
    "footerTotalRows": "Celkem řádků:",
    // Checkbox selection text
    "checkboxSelectionHeaderName": "Výběr zaškrtávacím políčkem",
    "checkboxSelectionSelectAllRows": "Vybrat všechny řádky",
    "checkboxSelectionUnselectAllRows": "Zrušit výběr všech řádků",
    "checkboxSelectionSelectRow": "Vybrat řádek",
    "checkboxSelectionUnselectRow": "Zrušit výběr řádku",
    // Boolean cell text
    "booleanCellTrueLabel": "ano",
    "booleanCellFalse/Split-the-promptLabel": "ne",
    // Actions cell more text
    "actionsCellMore": "více",
    // Column pinning text
    "pinToLeft": "Připnout vlevo",
    "pinToRight": "Připnout vpravo",
    "unpin": "Odepnout",
    // Tree Data
    "treeDataGroupingHeaderName": "Skupina",
    "treeDataExpand": "zobrazit potomky",
    "treeDataCollapse": "skrýt potomky",
    // Grouping columns
    "groupingColumnHeaderName": "Skupina",
    // Master/detail
    "detailPanelToggle": "Přepínání detailního panelu",
    "expandDetailPanel": "Rozbalit",
    "collapseDetailPanel": "Sbalit",
    // Used core components translation keys
    "MuiTablePagination": {},
    // Row reordering text
    "rowReorderingHeaderName": "Přeuspořádání řádků",
    // Aggregation
    "aggregationMenuItemHeader": "Agregace",
    "aggregationFunctionLabelSum": "součet",
    "aggregationFunctionLabelAvg": "průměr",
    "aggregationFunctionLabelMin": "min",
    "aggregationFunctionLabelMax": "max",
    "aggregationFunctionLabelSize": "počet"
}

const typesLocaleEn = {
    'book': 'Book',
    'article': 'Article',
    'journal': 'Journal',
    'unspecified': 'Unspecified'
}

const typesLocaleCs = {
    'book': 'Kniha',
    'article': 'Článek',
    'journal': 'Časopis',
    'unspecified': 'Nespecifikováno'
}

i18next
    .use(initReactI18next)
    .init({
        fallbackLng: 'cs',
        lng: 'cs',
        resources: {
            en: {
                translation: {
                    'title': 'Database Interface',
                    'name': 'Name',
                    'releaseDate': 'Release Date',
                    'author': 'Author',
                    'keywords': 'Keywords',
                    'type': 'Type',
                    'addRow': 'Add new record',
                    'deleteRow': 'Delete selected',
                    'deleteKeyword': 'Delete keyword',
                    'keywordSelectLabel': 'Keywords: ',
                    'deletePrompt': 'Are you sure you want to delete the selected rows?',
                    'yes': 'Yes',
                    'no': 'No',
                    'close': 'Close',
                    'closeTooltip': 'Closes the application',

                    ...typesLocaleEn,

                    ...dataGridLocaleEn
                }
            },
            cs: {
                translation: {
                    'title': 'Rozhraní k databázi',
                    'name': 'Název',
                    'releaseDate': 'Datum vydání',
                    'author': 'Autor',
                    'keywords': 'Klíčová slova',
                    'type': 'Typ',
                    'addRow': 'Přidat nový záznam',
                    'deleteRow': 'Smazat vybrané',
                    'deleteKeyword': 'Smazat klíčové slovo',
                    'keywordSelectLabel': 'Klíčová slova: ',
                    'deletePrompt': 'Opravdu chcete smazat vybrané řádky?',
                    'yes': 'Ano',
                    'no': 'Ne',
                    'close': 'Zavřít',
                    'closeTooltip': 'Zavře aplikaci',

                    ...typesLocaleCs,

                    ...dataGridLocaleCs
                }
            }
        }
    });

export { i18next }