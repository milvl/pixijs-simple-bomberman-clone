const handleKeywordsRender = (params) => {
    if (typeof params.value === 'string') {
        params.value = params.value.split(', ');
    }

    return params.value ? params.value.join(', ') : '';
}

/**
 * The definitions of the columns in the table.
 * @type {Array} The columns.
 */
export const columnsDefinitions = [
    {
        field: 'name',
        width: 200,
        editable: true
    },
    {
        field: 'releaseDate',
        width: 150,
        type: 'date',
        editable: true
    },
    {
        field: 'author',
        width: 180,
        editable: true
    },
    {
        field: 'keywords',
        width: 200,
        editable: true,
        renderCell: handleKeywordsRender
    },
    {
        field: 'type',
        width: 130,
        editable: true,
        type: 'singleSelect',
        valueOptions: ['book', 'article', 'journal', 'unspecified'],
    }
];

/**
 * Returns the initial rows.
 * @returns {Array} The initial rows.
 */
export function getInitRows() {
    return [
        {
            id: 1,
            name: '1984',
            releaseDate: new Date('08.06.1949'),
            author: 'George Orwell',
            keywords: ['dystopia', 'political'],
            type: 'book'
        },
        {
            id: 2,
            name: 'Journal of Unreproducible Results',
            releaseDate: new Date('01.04.1955'),
            author: 'Alexander Kohn',
            keywords: ['science', 'humor'],
            type: 'journal'
        },
        {
            id: 3,
            name: 'Nature',
            releaseDate: new Date('04.11.1869'),
            author: 'Norman Lockyer',
            keywords: ['science', 'research'],
            type: 'journal'
        }
    ];
}