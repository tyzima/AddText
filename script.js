let lastSelectedColor = null;
let lastSelectedSize = null;
let lastSelectedLat = null;
let lastSelectedLong = 370;



document.addEventListener("DOMContentLoaded", function() {
    // Load SVG logo from URL parameter
    let params = new URLSearchParams(window.location.search);
    let logoURL = params.get('logo');
    
    if(logoURL) {
        fetch(logoURL)
        .then(response => response.text())
        .then(data => {
            document.getElementById('svgContainer').innerHTML = data;
            let svgElement = document.querySelector('.svg-container svg');
            svgElement.setAttribute('width', '400');
            svgElement.setAttribute('height', 'auto');
        });
    }

    // Add event listeners for sliders
    document.getElementById('sizeSlider').addEventListener('input', adjustSize);
    document.getElementById('latSlider').addEventListener('input', adjustLatitude);
    document.getElementById('longSlider').addEventListener('input', adjustLongitude);
});

function adjustSize(event) {
    let svgText = document.querySelector('.text-svg');
    if (svgText) {
        let value = event.target.value;
        svgText.setAttribute('width', `${value}px`);
        svgText.setAttribute('height', 'auto');
        lastSelectedSize = value;  // Update the global variable
    }
}

function adjustLatitude(event) {
    let svgTextContainer = document.querySelector('.text-svg-container');
    if (svgTextContainer) {
        svgTextContainer.style.left = `${event.target.value}px`;
        lastSelectedLat = event.target.value;  // Update the global variable
    }
}

function adjustLongitude(event) {
    let svgTextContainer = document.querySelector('.text-svg-container');
    if (svgTextContainer) {
        svgTextContainer.style.top = `${event.target.value}px`;
        lastSelectedLong = event.target.value;  // Update the global variable
    }
}



function loadTextSVG(number) {
    let url = `/text${number}.svg`;

    fetch(url)
    .then(response => response.text())
    .then(data => {
        // First, remove any previously added text SVG containers
        let existingTextSVGContainer = document.querySelector('.svg-container .text-svg-container');
        if(existingTextSVGContainer) existingTextSVGContainer.remove();
        
        // Create a container div for the SVG
        let svgContainer = document.createElement('div');
        svgContainer.classList.add('text-svg-container');
        svgContainer.innerHTML = data;
        let svgElement = svgContainer.querySelector('svg');
        svgElement.classList.add('text-svg');
        
        // Append the container to the main SVG container
        document.querySelector('.svg-container').appendChild(svgContainer);

        // If there's a last selected color, apply it to the new text SVG
        if (lastSelectedColor) {
            applyColorToTextSVG(lastSelectedColor);
        }

        if (lastSelectedSize) {
            let svgText = svgContainer.querySelector('.text-svg');
            svgText.setAttribute('width', `${lastSelectedSize}px`);
            svgText.setAttribute('height', 'auto');
        }
        if (lastSelectedLat) {
            svgContainer.style.left = `${lastSelectedLat}px`;
        }
        if (lastSelectedLong) {
            svgContainer.style.top = `${lastSelectedLong}px`;
        }
    });
}



function makeResizableDiv(div) {
    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    div.appendChild(resizer);
    div.style.position = 'relative';
    
    let isResizing = false;
    let lastX, lastY;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        lastX = e.clientX;
        lastY = e.clientY;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
        });
    });

    function handleMouseMove(e) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        
        const newWidth = parseInt(window.getComputedStyle(div).width) + dx;
        const newHeight = parseInt(window.getComputedStyle(div).height) + dy;
        
        div.style.width = newWidth + 'px';
        div.style.height = newHeight + 'px';

        lastX = e.clientX;
        lastY = e.clientY;
    }
}

const colorPickerBtn = document.getElementById('colorPickerBtn');
const colorPopup = document.getElementById('colorPopup');

colorPickerBtn.addEventListener('click', () => {
    if (colorPopup.classList.contains('active')) {
        colorPopup.classList.remove('active');
    } else {
        colorPopup.classList.add('active');
    }
});


colorPopup.addEventListener('click', (event) => {
    if (event.target.tagName.toLowerCase() === 'li') {
        const color = event.target.style.backgroundColor;
        lastSelectedColor = color;  // Update the global variable
        applyColorToTextSVG(color);

        colorPopup.classList.remove('active');
    }
});

function applyColorToTextSVG(color) {
    const textSVG = document.querySelector('.text-svg');
    if (textSVG) {
        // Change the fill color of all child elements of the SVG
        Array.from(textSVG.querySelectorAll('*')).forEach(child => {
            if (child.getAttribute('fill')) {
                child.setAttribute('fill', color);
            }
            if (child.getAttribute('stroke')) {
                child.setAttribute('stroke', color);
            }
        });
    }
}

function downloadTrueVectorSVG() {
    // Get the main SVG and the text SVG
    const svgContainer = document.querySelector('.svg-container');
    const mainSVG = svgContainer.querySelector('svg:not(.text-svg)');
    const textSVG = svgContainer.querySelector('.text-svg');

    if (!mainSVG) return;

    // Create a new SVG for the export
    const exportSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    
    // Append cloned versions of the main SVG and text SVG (if it exists)
    exportSVG.appendChild(mainSVG.cloneNode(true));
    if (textSVG) {
        exportSVG.appendChild(textSVG.cloneNode(true));
    }

    // Calculate dimensions and viewBox
    const containerBounds = svgContainer.getBoundingClientRect();
    exportSVG.setAttribute('width', `${containerBounds.width}`);
    exportSVG.setAttribute('height', `${containerBounds.height}`);
    exportSVG.setAttribute('viewBox', `0 0 ${containerBounds.width} ${containerBounds.height}`);
    
    // Generate blob and download
    const blob = new Blob([new XMLSerializer().serializeToString(exportSVG)], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged-logo.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
