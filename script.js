const svg = d3.select("#scatterplot");
const width = +svg.attr("width");
const height = +svg.attr("height");
const numPoints = 100;
const updateInterval = 500;

// Generate initial random data points
let data = d3.range(numPoints).map(() => ({
    x: Math.random() * width,
    y: Math.random() * height
}));

// Create the scatter plot
const dots = svg.selectAll(".dot")
    .data(data)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("r", 5)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);

// Function to update the scatter plot
function updateData() {
    // Move points in random directions
    data = data.map(d => ({
        x: Math.max(0, Math.min(width, d.x + (Math.random() - 0.5) * 20)),
        y: Math.max(0, Math.min(height, d.y + (Math.random() - 0.5) * 20))
    }));

    dots.data(data)
        .transition()
        .duration(updateInterval)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
}

// Set the interval to update the data
setInterval(updateData, updateInterval);
