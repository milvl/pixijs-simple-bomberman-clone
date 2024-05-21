import React, {useEffect, useState} from 'react';
import './FileSystemNavigator.css';
import {RichTreeView, TreeItem2} from '@mui/x-tree-view';
import { styled, alpha } from '@mui/material/styles';
import { TreeItem as MuiTreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { FILE_1_TXT_CONTENT, FILE_2_CSS_CONTENT, FILE_3_CSS_CONTENT, FILE_4_JS_CONTENT} from "./FileContents";

// icon imports
import {
    ChevronRight as ChevronRightIcon,
    ExpandMore as ExpandMoreIcon,
    Folder as FolderIcon,
    FolderOpen as FolderOpenIcon,
    InsertDriveFile as InsertDriveFileIcon,
    FolderOpenTwoTone as FolderOpenTwoToneIcon,
    CreateNewFolder as CreateNewFolderIcon,
    NoteAdd as NoteAddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Deselect as DeselectIcon,
} from '@mui/icons-material';

// component imports
import {
    Typography,
    Toolbar,
    IconButton,
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, Tooltip
} from '@mui/material';

/**
 * The styling used for nesting lines in the tre view.
 * @type {StyledComponent<PropsOf<React.ForwardRefExoticComponent<TreeItemProps & React.RefAttributes<HTMLLIElement>>> & MUIStyledCommonProps<Theme>, {}, {}>}
 */
const TreeItem = styled(MuiTreeItem)(({ theme }) => ({
    [`& .${treeItemClasses.groupTransition}`]: {
        marginLeft: 18,
        paddingLeft: 18,
        borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
    }
}));

/**
 * Returns the collapse icons.
 * @returns {Element} Collapse icons
 */
const collapseIcons = () => {
    return <>
        <FolderOpenIcon />
        <ChevronRightIcon />
    </>
}

/**
 * Returns the expand icons.
 * @returns {Element} Expand icons
 */
const expandIcons = () => {
    return <>
        <FolderIcon />
        <ExpandMoreIcon />
    </>
}

// /**
//  * The initial data for the file system.
//  * @type Array
//  */
// const oldInitialFileSystem = [
//     { id: "1", label: "Folder1", type: "folder", children: ["2", "3"], ancestor: null },
//     { id: "2", label: "File1.txt", type: "file", content: "This is a text file.", ancestor: "1" },
//     { id: "3", label: "Folder2", type: "folder", children: ["4", "5"], ancestor: "1" },
//     { id: "4", label: "File2.txt", type: "file", content: "This is an image file.", ancestor: "3" },
//     { id: "5", label: "Folder3", type: "folder", children: ["6"], ancestor: "3" },
//     { id: "6", label: "File3.css", type: "file", content: "This is an audio file.", ancestor: "5" },
//     { id: "7", label: "File4.js", type: "file", content: "This is a js file.", ancestor: null },
//     { id: "8", label: "Folder4", type: "folder", children: [], ancestor: null }
// ];

/**
 * The initial data for the file system.
 * @type Array
 */
const initialFileSystem = [
    {id: '1', label: 'File4.js', type: 'file', content: FILE_4_JS_CONTENT, ancestor: null,},
    {id: '2', label: 'Folder1', type: 'folder', ancestor: null, children: [
            {id: '3', label: 'File1.txt', type: 'file', content: FILE_1_TXT_CONTENT, ancestor: '2',},
            {id: '4', label: 'Folder2', type: 'folder', ancestor: '2', children: [
                    {id: '5', label: 'File2.css', type: 'file', content: FILE_2_CSS_CONTENT, ancestor: '4',},
                    {id: '6', label: 'Folder3', type: 'folder', ancestor: '4', children: [
                            {id: '7', label: 'File3.css', type: 'file', content: FILE_3_CSS_CONTENT, ancestor: '6',},
                        ],
                    },
                ],
            },
        ],
    },
    {id: '8', label: 'Folder4', type: 'folder', ancestor: null, children: []},
];

/**
 * The initial file system map.
 * @type Object
 */
const initialFileSystemMap = {
    "1": initialFileSystem[0],
    "2": initialFileSystem[1],
    "3": initialFileSystem[1].children[0],
    "4": initialFileSystem[1].children[1],
    "5": initialFileSystem[1].children[1].children[0],
    "6": initialFileSystem[1].children[1].children[1],
    "7": initialFileSystem[1].children[1].children[1].children[0],
    "8": initialFileSystem[2]
}

const noFileSelectedString = "No file selected";

/**
 * The file system navigator component.
 * @returns {Element} File system navigator component
 * @constructor
 */
function FileSystemNavigator() {
    const [fileSystem, setFileSystem] = useState(initialFileSystem);
    const [fileSystemMap, setFileSystemMap] = useState(initialFileSystemMap);
    const [lastId, setLastId] = useState(parseInt(initialFileSystem[initialFileSystem.length - 1].id));
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [selectedFileContent, setSelectedFileContent] = useState(noFileSelectedString);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openRenameDialog, setOpenRenameDialog] = useState(false);
    const [newName, setNewName] = useState("");
    const [fileSystemChanged, setFileSystemChanged] = useState(false);

    /**
     * Handles the content of the selected file.
     * @param file {Object} The selected file
     */
    const handleSelectedFileContent = (file) => {
        if (!file) {
            setSelectedFileContent(noFileSelectedString);
            return;
        }
        if (file.type === "file") {
            if (file.label.endsWith(".txt") || file.label.endsWith(".css") || file.label.endsWith(".js")) {
                setSelectedFileContent(file.content);
            }
            else {
                setSelectedFileContent("This file type is not supported. (only .js, .css and .txt files are supported at the moment)");
            }
        }
    }

    /**
     * Handles the selection of a node in the tree view.
     * @param event {Event} The event
     * @param itemId {String} The id of the selected item
     */
    const handleNodeSelect = (event, itemId) => {
        if (!itemId) {
            setSelectedFileId(null);
            setSelectedFileContent(noFileSelectedString);
            return;
        }
        const file = fileSystemMap[itemId];
        setSelectedFileId(itemId);
        handleSelectedFileContent(file);
    };

    /**
     * Deletes the selected file from the file system.
     */
    const handleDelete = () => {
        // sanity check
        if (!selectedFileId) {
            setOpenDeleteDialog(false);
            setSelectedFileId(null);
            handleSelectedFileContent(null);
            return;
        }

        const file = fileSystemMap[selectedFileId];
        let updatedFileSystemMap = { ...fileSystemMap };

        // remove the selected file from its parent's children
        if (file.ancestor) {
            fileSystemMap[file.ancestor].children = fileSystemMap[file.ancestor].children.filter(item => item.id !== file.id);
            setFileSystem([...fileSystem]);
        }
        // is in the root
        else {
            let updatedFileSystem = fileSystem.filter(item => item.id !== file.id);
            setFileSystem(updatedFileSystem);
        }
        // remove the selected file and all of its nested files from the file system map
        if (file.children) {
            let queue = file.children.map(item => item.id);
            while (queue.length > 0) {
                let currentId = queue.shift();
                let currentItem = fileSystemMap[currentId];
                if (currentItem.children) {
                    queue = queue.concat(currentItem.children.map(item => item.id));
                }
                delete updatedFileSystemMap[currentId];
            }
        }

        delete updatedFileSystemMap[file.id];
        setFileSystemMap(updatedFileSystemMap);

        setOpenDeleteDialog(false);
        setSelectedFileId(null);
        handleSelectedFileContent(null);
        setFileSystemChanged(true);
    };

    /**
     * Adds a new file or folder to the file system.
     * @param type {String} The type of the new file or folder
     */
    const handleAdd = (type) => {
        let newId = (lastId + 1).toString();
        setLastId(lastId + 1);

        let newFile = {
            id: newId,
            label: type === "folder" ? "NewFolder" : "NewFile.unknown",
            type: type,
            content: "<PLACEHOLDER FOR FUTURE TEXT INPUT FUNCTIONALITY>",
        };

        if (type === "folder") {
            newFile.children = [];
        }

        if (selectedFileId) {
            if (fileSystemMap[selectedFileId].type === "file") {
                newFile.ancestor = fileSystemMap[selectedFileId].ancestor;
                if (newFile.ancestor) {
                    fileSystemMap[fileSystemMap[selectedFileId].ancestor].children.push(newFile);
                }
                else {
                    fileSystem.push(newFile);
                }
            }
            else {
                newFile.ancestor = selectedFileId;
                fileSystemMap[selectedFileId].children.push(newFile);
            }

            setFileSystem([...fileSystem]);
        }
        else {
            newFile.ancestor = null;
            setFileSystem([...fileSystem, newFile]);
        }

        setFileSystemMap({ ...fileSystemMap, [newId]: newFile });

        setOpenRenameDialog(true);
        setSelectedFileId(newId);
        handleSelectedFileContent(newFile);
        setFileSystemChanged(true);
    }

    /**
     * Renames the selected file.
     */
    const handleRename = () => {
        if (newName === "") {
            setOpenRenameDialog(false);
            return;
        }
        let file = fileSystemMap[selectedFileId];
        file.label = newName;
        setFileSystem([...fileSystem]);
        setFileSystemMap({ ...fileSystemMap, [selectedFileId]: file });
        setNewName("");
        setSelectedFileId(file.id);
        handleSelectedFileContent(file);
        setOpenRenameDialog(false);
        setFileSystemChanged(true);
    };

    /**
     * The custom tree item component.
     * Takes care of displaying the correct icon for files
     * and folders that are empty.
     * @type {React.ForwardRefExoticComponent<React.PropsWithoutRef<{}> & React.RefAttributes<unknown>>}
     */
    const CustomTreeItem = React.forwardRef((props, ref) => {
        if (props && props.itemId && fileSystemMap[props.itemId] && fileSystemMap[props.itemId].type === "file") {
            return (
                <TreeItem2
                    ref={ref}
                    {...props}
                    slots={{
                        icon: InsertDriveFileIcon
                    }}
                />
            );
        }
        return (
            <TreeItem2
                ref={ref}
                {...props}
            />
        );
    });

    /**
     * Sorts the nodes in the file system.
     * @param a {Object} The first node
     * @param b {Object} The second node
     * @returns {number} The comparison result
     */
    const sortNodesFn = (a, b) => {
        if (a.type === "folder" && b.type === "file") {
            return -1;
        }
        if (a.type === "file" && b.type === "folder") {
            return 1;
        }
        else {
            return a.label.localeCompare(b.label);
        }
    }

    /**
     * Sorts the file system.
     * @param fileSystem
     * @param node
     */
    const sortNode = (fileSystem, node) => {

    }

    /**
     * Sorts the file system.
     */
    const sortFileSystem = () => {
        let fileSystemCopy = [...fileSystem];
        fileSystemCopy.sort(sortNodesFn);
        for (let node of fileSystemCopy) {
            if (node.type === "folder" && node.children.length > 0) {
                node.children.sort(sortNodesFn);
            }
        }

        setFileSystem(fileSystemCopy);

        // map the sorted file system]
        let updatedFileSystemMap = {};
        const mapFileSystem = (fileSystemMap, fileSystem, startingNode) => {
            if (!fileSystem) {
                return;
            }

            for (let node of fileSystem) {
                fileSystemMap[node.id] = node;
                if (node.children) {
                    mapFileSystem(fileSystemMap, node.children, node);
                }
            }
        }
        mapFileSystem(updatedFileSystemMap, fileSystemCopy, null);
        setFileSystemMap(updatedFileSystemMap);
    }

    /**
     * Handles the cancel action for the rename dialog.
     */
    const handleRenameDialogCancel = () => {
        setNewName("");
        setOpenRenameDialog(false);
    }

    // sort the file system when it changes
    useEffect(() => {
        sortFileSystem();
        setFileSystemChanged(false);
    }, [fileSystemChanged]);

    // for debugging purposes
    useEffect(() => {
        console.log("fileSystem", fileSystem);
        console.log("fileSystemMap", fileSystemMap);
    }, [fileSystem, fileSystemMap]);

    return (
        <div className="FileSystemNavigator">
            <div className="TreeViewSection">

                {/* Toolbar */}
                <Toolbar>
                    <Tooltip title={"Create New Folder"}>
                        <IconButton color="default" onClick={() => handleAdd('folder')} >
                            <CreateNewFolderIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={"Create New File"}>
                        <IconButton color="default" onClick={() => handleAdd('file')} >
                            <NoteAddIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={"Delete Selected Item"}>
                        <IconButton color="default" onClick={() => setOpenDeleteDialog(true)} disabled={!selectedFileId}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={"Rename Selected Item"}>
                        <IconButton color="default" onClick={() => setOpenRenameDialog(true)} disabled={!selectedFileId}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={"Deselect Selected Item"}>
                        <IconButton color="default" onClick={() => handleNodeSelect(null, null)} disabled={!selectedFileId}>
                            <DeselectIcon />
                        </IconButton>
                    </Tooltip>
                </Toolbar>

                {/* tree view */}
                <RichTreeView
                    items={fileSystem}
                    aria-label="customized"
                    onSelectedItemsChange={handleNodeSelect}
                    selectedItems={selectedFileId}
                    slots={{
                        collapseIcon: collapseIcons,
                        expandIcon: expandIcons,
                        endIcon: FolderOpenTwoToneIcon,
                        item: CustomTreeItem
                    }}
                >
                </RichTreeView>
            </div>

            {/* content view */}
            <div className="ContentViewSection">
                <TextField
                    id="outlined-multiline-static"
                    multiline
                    value={selectedFileContent}
                    variant="outlined"
                    fullWidth
                    disabled
                >
                    {selectedFileContent}
                </TextField>
            </div>

            {/*dialogs*/}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>{"Confirm Delete"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete this item (and all of its possible nested files)?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDelete} color="error">Delete</Button>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="primary">Cancel</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openRenameDialog} onClose={() => setOpenRenameDialog(false)}>
                <DialogTitle>{"Choose Name For Item"}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="New Name"
                        type="text"
                        fullWidth
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleRename} color="primary">Submit</Button>
                    <Button onClick={handleRenameDialogCancel} color="primary">Cancel</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default FileSystemNavigator;
