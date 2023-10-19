document.addEventListener("DOMContentLoaded", function() {
    const svgContainer = document.getElementById('svgContainer');
    const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

    let mainSVG, textSVG;
    let logoURL = new URL(window.location.href).searchParams.get('logo');

    if (logoURL) {
        fetch(logoURL)
            .then(response => response.text())
            .then(data => {
                svgContainer.innerHTML = data;
                mainSVG = SVG(svgContainer.firstChild);
            });
    }

    function loadTextSVG(number) {
        if (textSVG) textSVG.remove();
        fetch(`/text${number}.svg`)
            .then(response => response.text())
            .then(data => {
                const tempContainer = document.createElement('div');
                tempContainer.innerHTML = data;
                const svgElement = tempContainer.firstChild;
                mainSVG.node.appendChild(svgElement);
                textSVG = SVG(svgElement);
    
                // Add dragging and resizing
                textSVG.draggable().resize();
            });
    }
    
    function downloadSVG() {
        const serializer = new XMLSerializer();
        const source = serializer.serializeToString(mainSVG.node);
        const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "edited-logo.svg";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

   
function changeColor(color) {
    if (textSVG) {
        textSVG.fill(color);
    }
}
});

