const svg = d3.select("#scatterplot");
const width = +svg.attr("width");
const height = +svg.attr("height");
const updateInterval = 50;

const entry = { x: 100, y: 100, label: 'Entry' };
const exit = { x: 500, y: 500, label: 'Exit' };
const stage = { x: 300, y: 300, label: 'Stage' };
const divider = { x: 300, y: 100, label: 'Divider' };

const labels = [entry, exit, stage, divider];

// Draw labeled spots
svg.selectAll(".label")
    .data(labels)
    .enter().append("text")
    .attr("class", "label")
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .text(d => d.label);

// Function to update the scatter plot with new data
function updateData(data) {
    const dots = svg.selectAll(".dot")
        .data(data);

    dots.enter().append("circle")
        .attr("class", "dot")
        .attr("r", 5)
        .merge(dots)
        .attr("cx", d => d[0])
        .attr("cy", d => d[1]);

    dots.exit().remove();
}

document.getElementById("simulate").addEventListener("click", function() {
    setInterval(() => {
        fetch('/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => updateData(data.positions))
        .catch(error => console.error('Error:', error));
    }, updateInterval);
});
