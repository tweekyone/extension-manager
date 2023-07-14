"use strict"

const activeExtTabId = 'active_table';
const inactiveExtTabId = 'inactive_table';
const activeExtTbodyId = 'active_tbody';
const inactiveExtTbodyId = 'inactive_tbody';
const extRowId = 'ext_row_';

let appIconsContainer = document.getElementById('appIconsContainer');
let activeExtensionsInfo = [];
let inactiveExtensionsInfo = [];

document.addEventListener('DOMContentLoaded', function() {
    chrome.management.getAll(function(extensionsInfo) {
        extensionsInfo.forEach(function(extensionInfo) {
            if (extensionInfo.enabled) {
                activeExtensionsInfo.push(extensionInfo);
            } else {
                inactiveExtensionsInfo.push(extensionInfo);
            }
        });
        appIconsContainer.appendChild(generateExtensionsTable(activeExtensionsInfo, true));
        appIconsContainer.appendChild(document.createElement('hr'));
        appIconsContainer.appendChild(generateExtensionsTable(inactiveExtensionsInfo, false));
    });
});

// const cellsNumber = 5;

// function generateElementsTable(extensionInfo) {
//     const table = document.createElement('table');
//     const tbody = document.createElement('tbody');
//     const firstRow = generateHeadRow;
// }

function generateExtensionsTable(extensions, isActive) {
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');

    if (isActive) {
        table.id = activeExtTabId;
        tbody.id = activeExtTbodyId;
    } else {
        table.id = inactiveExtTabId;
        tbody.id = inactiveExtTbodyId;        
    }

    extensions.forEach(function(extension) {
        const row = generateTableRow(extension);
        row.id = extRowId + extension.id;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    return table;
}

function generateTableRow(extension) {
    let row = document.createElement('tr');

    let cellPin = document.createElement('td');
    let pinIcon = document.createElement('img');
    pinIcon.src = 'resources/unpinned.png'
    cellPin.appendChild(pinIcon);
    
    let cellIcon = document.createElement('td');
    let icon = document.createElement('img');
    icon.src = extension.icons[0].url;
    icon.classList.add('app-icon');
    cellIcon.appendChild(icon);

    let cellName = document.createElement('td');
    let cellText = document.createTextNode(extension.name);
    cellName.appendChild(cellText);

    let cellInfo = document.createElement('td');
    cellInfo.appendChild(generateInfoIcon(extension.description));

    let cellEnable = document.createElement('td');
    cellEnable.appendChild(generateToggleSwitch(extension));

    row.appendChild(cellPin);
    row.appendChild(cellIcon);
    row.appendChild(cellName);
    row.appendChild(cellInfo);
    row.appendChild(cellEnable);

    return row;
}

function generateInfoIcon(description) {
    let tooltip = document.createElement('div');
    tooltip.id = 'tooltip';
    tooltip.textContent = description;
    
    let icon = document.createElement('img');
    icon.src = 'resources/question.png'
    icon.appendChild(tooltip);

    icon.addEventListener('mouseover', function() {
        tooltip.style.display = 'block';
    });

    icon.addEventListener('mouseout', function() {
        tooltip.style.display = 'none';
    });

    return icon;
}

function generateToggleSwitch(extension) {
    let switchLabel = document.createElement('label');
    switchLabel.className = 'switch';
    let switchSpan = document.createElement('span');
    let switchInput = document.createElement('input');
    switchInput.type = 'checkbox';
    switchInput.checked = extension.enabled;
    switchInput.onclick = function() {
        setTimeout(
            () => {
                extension.enabled = this.checked;
                chrome.management.setEnabled(extension.id, extension.enabled);
                switchExtensionArray(extension);
                switchExtensionTable(extension);
            },
            1 * 400
        );
    };

    switchSpan.className = 'slider round'; 
    switchLabel.appendChild(switchInput);
    switchLabel.appendChild(switchSpan);
    return switchLabel;
}

function switchExtensionArray(extension) {
    const extensionIdExtractor = (extension) => extension.id;
    let extensionTableId;
    if (extension.enabled) {
        extensionTableId = activeExtensionsInfo.findIndex(extensionIdExtractor);
        if (extensionTableId > -1) {
            activeExtensionsInfo.splice(extensionTableId, 1);
        }
        inactiveExtensionsInfo.push(extension);
    } else {
        extensionTableId = inactiveExtensionsInfo.findIndex(extensionIdExtractor);
        if (extensionTableId > -1) {
            inactiveExtensionsInfo.splice(extensionTableId, 1);
        }
        activeExtensionsInfo.push(extension);
    }
}

function switchExtensionTable(extension) {
    const newTableRow = generateTableRow(extension);
    newTableRow.id = extRowId + extension.id;
    document.getElementById(newTableRow.id).remove();

    if (extension.enabled) {
        document.getElementById(activeExtTbodyId)
        .appendChild(newTableRow);
    } else {
        document.getElementById(inactiveExtTbodyId)
        .appendChild(newTableRow);
    }
}