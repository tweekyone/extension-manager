"use strict"

const activeExtTabId = 'active-table';
const inactiveExtTabId = 'inactive-table';
const activeExtTbodyId = 'active-tbody';
const inactiveExtTbodyId = 'inactive-tbody';
const extRowId = 'ext-row-';
const extCellId = 'ext-cell-';
const pinIconId = 'pin-icon-';
const switcherId = 'switch-';

let activeTable;
let activeTbody;

let inactiveTable;
let inactiveTbody;

let allExtensions;

let pinExtIds = [];

const pinActiveExtTabId = 'pin-active-table';
const pinInactiveExtTabId = 'pin-inactive-table';
const pinActiveExtTbodyId = 'pin-active-tbody';
const pinInactiveExtTbodyId = 'pin-inactive-tbody';
const pinExtRowId = 'pin-ext-row-';

let pinnedActiveTable;
let pinnedActiveTbody;

let pinnedInactiveTable;
let pinnedInactiveTbody;

let pinnedExtensions;

class ExtWithPinFlag {
    constructor(extension, pinned) {
        this.extension = extension;
        this.pinned = pinned;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initTables();

    chrome.storage.local.get(["pinnedExtensionIdsKey"]).then((result) => {
        pinExtIds = result.pinnedExtensionIdsKey;
    });
    if (pinExtIds === undefined) {
        pinExtIds = [];
    }

    chrome.management.getAll(function(extensionsInfo) {
        setExtensionsTables(extensionsInfo);
    });

    const allExtensionsButton = document.getElementById('all_extensions_button');
    allExtensionsButton.addEventListener('click', function(event) {
        openTab(event, 'all_extensions');
    });

    const pinnedExtensionsButton = document.getElementById('pinned_extensions_button');
    pinnedExtensionsButton.addEventListener('click', function(event) {
        openTab(event, 'pinned_extensions');
    });
});

function initTables() {
    activeTable = document.createElement('table');
    activeTbody = document.createElement('tbody');
    activeTable.id = activeExtTabId;
    activeTbody.id = activeExtTbodyId;
    activeTable.appendChild(activeTbody);

    inactiveTable = document.createElement('table');
    inactiveTbody = document.createElement('tbody');
    inactiveTable.id = inactiveExtTabId;
    inactiveTbody.id = inactiveExtTbodyId;     
    inactiveTable.appendChild(inactiveTbody);

    allExtensions = document.getElementById('all_extensions');
    allExtensions.appendChild(activeTable);
    allExtensions.appendChild(document.createElement('hr'));
    allExtensions.appendChild(inactiveTable);

    pinnedActiveTable = document.createElement('table');
    pinnedActiveTbody = document.createElement('tbody');
    pinnedActiveTable.id = pinActiveExtTabId;
    pinnedActiveTbody.id = pinActiveExtTbodyId;
    pinnedActiveTable.appendChild(pinnedActiveTbody);

    pinnedInactiveTable = document.createElement('table');
    pinnedInactiveTbody = document.createElement('tbody');
    pinnedInactiveTable.id = pinInactiveExtTabId;
    pinnedInactiveTbody.id = pinInactiveExtTbodyId;     
    pinnedInactiveTable.appendChild(pinnedInactiveTbody);

    pinnedExtensions = document.getElementById('pinned_extensions');
    pinnedExtensions.appendChild(pinnedActiveTable);
    pinnedExtensions.appendChild(document.createElement('hr'));
    pinnedExtensions.appendChild(pinnedInactiveTable);
}

function setExtensionsTables(extensions) {
    extensions.forEach(function(extension) {
        let pinFlag = false;
        if (pinExtIds !== undefined && pinExtIds.includes(extension.id)) {
            pinFlag = true;
        }
        let extWithFlag = new ExtWithPinFlag(extension, pinFlag)

        const row = generateTableRow(extWithFlag);
        row.id =  extRowId + extension.id;
        if (extWithFlag.extension.enabled) {
            activeTbody.appendChild(row);
        } else {
            inactiveTbody.appendChild(row);
        }

        if (extWithFlag.pinned) {
            let pinnedRow =row.cloneNode(true);
            setClonedRow(pinnedRow, extWithFlag);
            if (extWithFlag.extension.enabled) {
                pinnedActiveTbody.appendChild(pinnedRow);
            } else {
                pinnedInactiveTbody.appendChild(pinnedRow);
            }
        } 
    });
}

function generateTableRow(extWithFlag) {
    let row = document.createElement('tr');

    let cellPin = document.createElement('td');
    cellPin.appendChild(generatePin(extWithFlag));
    
    let cellIcon = document.createElement('td');
    let icon = document.createElement('img');
    icon.src = extWithFlag.extension.icons[0].url;
    icon.classList.add('app-icon');
    cellIcon.appendChild(icon);

    let cellName = document.createElement('td');
    let cellText = document.createTextNode(extWithFlag.extension.name);
    cellName.appendChild(cellText);

    let cellInfo = document.createElement('td');
    cellInfo.className = 'td-tooltip';
    let tooltip = generateTooltipDescription(extWithFlag.extension.description);
    cellInfo.appendChild(tooltip);
    cellInfo.appendChild(generateInfoIcon(tooltip));

    let cellEnable = document.createElement('td');
    cellEnable.appendChild(generateToggleSwitch(extWithFlag));

    row.appendChild(cellPin);
    row.appendChild(cellIcon);
    row.appendChild(cellName);
    row.appendChild(cellInfo);
    row.appendChild(cellEnable);

    return row;
}

function generatePin(extWithFlag) {
    let pinIcon = document.createElement('img');
    pinIcon.id = pinIconId + extWithFlag.extension.id;
    if (extWithFlag.pinned) {
        pinIcon.src = 'resources/pinned.png';
    } else {
        pinIcon.src = 'resources/unpinned.png';
    }
    pinIcon.onclick = function() {
        switchPinExt(extWithFlag);
    }
    return pinIcon;
}

function switchPinExt(extWithFlag) {
    const extensionIdExtractor = (extensionId) => extensionId === extWithFlag.extension.id;
    let extensionTableId = pinExtIds.findIndex(extensionIdExtractor);
    let switchebbleRow = document.getElementById(extRowId + extWithFlag.extension.id);
    console.log(document);
    let switchebbleIcon = switchebbleRow.querySelector('#' + pinIconId + extWithFlag.extension.id);
    let switchebblePinRow = document.getElementById(pinExtRowId + extWithFlag.extension.id);
    if (switchebblePinRow == null) {
        switchebblePinRow = switchebbleRow.cloneNode(true);
        switchebblePinRow.id = pinExtRowId + extWithFlag.extension.id;
    }
    let switchebblePinIcon = switchebblePinRow.querySelector('#' + pinIconId + extWithFlag.extension.id);
    setClonedRow(switchebblePinRow, extWithFlag);

    if (extensionTableId > -1) {
        pinExtIds.splice(extensionTableId, 1);
        switchebbleIcon.src = 'resources/unpinned.png';
        if (switchebblePinIcon !== undefined) {
            switchebblePinIcon.src = 'resources/unpinned.png';
        }
        if (switchebblePinRow.parentNode != null) {
            switchebblePinRow.parentNode.removeChild(switchebblePinRow);
        }
        extWithFlag.pinned = false;
    } else {
        pinExtIds.push(extWithFlag.extension.id);
        switchebbleIcon.src = 'resources/pinned.png';
        if (switchebblePinIcon !== undefined) {
            switchebblePinIcon.src = 'resources/pinned.png';
        }
        if (extWithFlag.extension.enabled) {
            let pinActiveExtTbody = document.getElementById(pinActiveExtTbodyId);
            pinActiveExtTbody.appendChild(switchebblePinRow)
        } else {
            let pinActiveExtTbody = document.getElementById(pinInactiveExtTbodyId);
            pinActiveExtTbody.appendChild(switchebblePinRow)
        }
        extWithFlag.pinned = true;
    }

    chrome.storage.local.set({ pinnedExtensionIdsKey: pinExtIds });
}


function setClonedRow(clonedRow, extWithFlag) {
    clonedRow.id = pinExtRowId + extWithFlag.extension.id;
    let pinIcon = clonedRow.querySelector('#' + pinIconId + extWithFlag.extension.id);
    pinIcon.onclick = function() {
        switchPinExt(extWithFlag);
    }
    let switchInput = clonedRow.querySelector('#' + switcherId + extWithFlag.extension.id);
    switchInput.checked = extWithFlag.extension.enabled;
    switchInput.onclick = function() {
        switchExtensionTable(extWithFlag, switchInput);
    }
}

function generateTooltipDescription(description) {
    let tooltip = document.createElement('span');
    tooltip.className = 'tooltip';
    tooltip.textContent = description;
    tooltip.style.display = 'none';

    return tooltip;
}

function generateInfoIcon(tooltip) {
    let icon = document.createElement('img');
    icon.src = 'resources/question.png';
    icon.className = 'info-icon';
    icon.addEventListener('mouseover', function(event) {
        tooltip.style.top = (event.clientY - tooltip.offsetHeight - 10) + 'px';
        tooltip.style.left = (event.clientX + 10) + 'px';
        tooltip.style.display = 'block';
    });
    icon.addEventListener('mouseout', function() {
        tooltip.style.display = 'none';
    });

    return icon;
}

function generateToggleSwitch(extWithFlag) {
    let switchLabel = document.createElement('label');
    switchLabel.className = 'switch';
    let switchSpan = document.createElement('span');
    switchSpan.className = 'slider round'; 
    let switchInput = document.createElement('input');
    switchInput.id = switcherId + extWithFlag.extension.id;
    switchInput.type = 'checkbox';
    switchInput.checked = extWithFlag.extension.enabled;
    switchInput.onclick = function() {
        switchExtensionTable(extWithFlag, switchInput);
    }
    switchLabel.appendChild(switchInput);
    switchLabel.appendChild(switchSpan);
    return switchLabel;
}

function switchExtensionTable(extWithFlag, switchInput) {
    extWithFlag.extension.enabled = switchInput.checked;
    chrome.management.setEnabled(extWithFlag.extension.id, extWithFlag.extension.enabled);
    setTimeout(
        () => {
            let switchableRow = document.getElementById(extRowId + extWithFlag.extension.id);
            if (switchableRow) {
                switchableRow.parentNode.removeChild(switchableRow);
                if (extWithFlag.extension.enabled) {
                    document.getElementById(activeExtTbodyId)
                    .appendChild(switchableRow);
                } else {
                    document.getElementById(inactiveExtTbodyId)
                    .appendChild(switchableRow);
                }
                let switchInput = switchableRow.querySelector('#' + switcherId + extWithFlag.extension.id);
                switchInput.checked = extWithFlag.extension.enabled;
            }

            if (extWithFlag.pinned) {
                let switchablePinnedRow = document.getElementById(pinExtRowId + extWithFlag.extension.id);
                switchablePinnedRow.parentNode.removeChild(switchablePinnedRow);
                if (extWithFlag.extension.enabled) {
                    document.getElementById(pinActiveExtTbodyId)
                    .appendChild(switchablePinnedRow);
                } else {
                    document.getElementById(pinInactiveExtTbodyId)
                    .appendChild(switchablePinnedRow);
                }
                let switchInput = switchablePinnedRow.querySelector('#' + switcherId + extWithFlag.extension.id);
                switchInput.checked = extWithFlag.extension.enabled;
            }
        },
        1 * 400
    );
}

function openTab(event, tableName) {
    // Get all elements with class="tabcontent" and hide them
    let tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    let tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tableName).style.display = "block";
    event.currentTarget.className += " active";
}