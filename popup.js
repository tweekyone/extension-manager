"use strict"

const activeExtTabId = 'active-table';
const inactiveExtTabId = 'inactive-table';
const activeExtTbodyId = 'active-tbody';
const inactiveExtTbodyId = 'inactive-tbody';
const extRowId = 'ext-row-';

const activeTable = document.createElement('table');
const activeTbody = document.createElement('tbody');
activeTable.id = activeExtTabId;
activeTbody.id = activeExtTbodyId;
activeTable.appendChild(activeTbody);

const inactiveTable = document.createElement('table');
const inactiveTbody = document.createElement('tbody');
inactiveTable.id = inactiveExtTabId;
inactiveTbody.id = inactiveExtTbodyId;     
inactiveTable.appendChild(inactiveTbody);

const appIconsContainer = document.getElementById('appIconsContainer');
appIconsContainer.appendChild(activeTable);
appIconsContainer.appendChild(document.createElement('hr'));
appIconsContainer.appendChild(inactiveTable);

let pinnedExtensionIds = [];

document.addEventListener('DOMContentLoaded', function() {
    chrome.management.getAll(function(extensionsInfo) {
        setExtensionsTables(extensionsInfo);
    });
});

function setExtensionsTables(extensions) {
    extensions.forEach(function(extension) {
        const row = generateTableRow(extension);
        row.id = extRowId + extension.id;
        if (extension.enabled) {
            activeTbody.appendChild(row);
        } else {
            inactiveTbody.appendChild(row);
        }
    });
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
    cellInfo.className = 'td-tooltip';
    let tooltip = generateTooltipDescription(extension.description);
    cellInfo.appendChild(tooltip);
    cellInfo.appendChild(generateInfoIcon(tooltip));

    let cellEnable = document.createElement('td');
    cellEnable.appendChild(generateToggleSwitch(extension));

    row.appendChild(cellPin);
    row.appendChild(cellIcon);
    row.appendChild(cellName);
    row.appendChild(cellInfo);
    row.appendChild(cellEnable);

    return row;
}

// function generatePinCheckbox(extension) {
//     let switchLabel = document.createElement('label');
//     switchLabel.className = 'switch';
//     let switchSpan = document.createElement('span');
//     let switchInput = document.createElement('input');
//     switchInput.type = 'checkbox';
//     switchInput.checked = extension.enabled;
//     switchInput.onclick = function() {
//         setTimeout(
//             () => {
//                 extension.enabled = this.checked;
//                 chrome.management.setEnabled(extension.id, extension.enabled);
//                 switchExtensionTable(extension);
//             },
//             1 * 400
//         );
//     };

//     switchSpan.className = 'slider round'; 
//     switchLabel.appendChild(switchInput);
//     switchLabel.appendChild(switchSpan);
//     return switchLabel;
// }

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

function switchExtensionArray(extension) {
    const extensionIdExtractor = (extension) => extension.id;
    let extensionTableId;
    if (extension.enabled) {
        extensionTableId = pinnedExtensionIds.findIndex(extensionIdExtractor);
        if (extensionTableId > -1) {
            pinnedExtensionIds.splice(extensionTableId, 1);
        }
        inactiveExtensionsInfo.push(extension);
    } else {
        extensionTableId = inactiveExtensionsInfo.findIndex(extensionIdExtractor);
        if (extensionTableId > -1) {
            inactiveExtensionsInfo.splice(extensionTableId, 1);
        }
        pinnedExtensionIds.push(extension);
    }
}