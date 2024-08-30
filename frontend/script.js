const svg = d3.select("#scatterplot");
const width = +svg.attr("width");
const height = +svg.attr("height");
const updateInterval = 10;  // 10 ms for smoother animation
const simulationDuration = 10000;  // 10 seconds for 1 hour simulation

let phase = 'to_entry';  // Initial phase

let labels = [
    { x: 100, y: 100, label: 'Entry' },
    { x: 300, y: 300, label: 'Stage' },
    { x: 500, y: 500, label: 'Exit' }
];

// Function to update label positions and redraw them
function updateLabels() {
    const labelElements = svg.selectAll(".label")
        .data(labels);

    labelElements.enter()
        .append("text")
        .attr("class", "label")
        .merge(labelElements)
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .text(d => d.label)
        .call(d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded));

    labelElements.exit().remove();
}

// Drag event functions
function dragStarted(event, d) {
    d3.select(this).raise().classed("active", true);
}

function dragged(event, d) {
    d.x = event.x;
    d.y = event.y;
    d3.select(this)
        .attr("x", d.x)
        .attr("y", d.y);
}

function dragEnded(event, d) {
    d3.select(this).classed("active", false);
}

// Function to calculate Euclidean distance
function calculateDistance(point1, point2) {
    return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2));
}

// Function to update the scatter plot with new data
function updateData(data) {
    const dots = svg.selectAll(".dot")
        .data(data);

    dots.enter().append("circle")
        .attr("class", "dot")
        .attr("r", 5)
        .merge(dots)
        .transition()  // Apply a smooth transition
        .duration(updateInterval)  // Match the transition duration with the update interval
        .ease(d3.easeLinear)  // Use linear easing for constant speed
        .attr("cx", d => d[0])
        .attr("cy", d => d[1])
        .style("fill", function(d, i) {
            const neighbors = data.filter((other, j) => {
                if (i === j) return false;  // Skip itself
                return calculateDistance(d, other) < 30;  // Increased radius to 30 meters
            });

            return neighbors.length >= 5 ? "red" : "steelblue";
        });

    dots.exit().remove();
}

// Initialize the labels on the SVG
updateLabels();

document.getElementById("simulate").addEventListener("click", function() {
    // Reset the phase to 'to_entry' at the start of each simulation
    phase = 'to_entry';
    currentTime = 0;  // Reset the current time as well

    const intervalId = setInterval(() => {
        // Adjust the phase transition timings
        if (currentTime > simulationDuration * 0.2 && phase === 'to_entry') {
            phase = 'to_stage';  // Switch phase to move towards stage after 20% of time
        } else if (currentTime > simulationDuration * 0.8 && phase === 'to_stage') {
            phase = 'to_exit';  // Switch phase to move towards exit after 80% of time
        }

        // Update the positions of the labels in the backend
        const labelPositions = {
            entry: labels[0],
            stage: labels[1],
            exit: labels[2]
        };

        // Fetch and update positions
        fetch('/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phase: phase, labels: labelPositions })  // Send the current phase and label positions to the backend
        })
        .then(response => response.json())
        .then(data => updateData(data.positions))
        .catch(error => console.error('Error:', error));

        // Increment the current time
        currentTime += updateInterval;

        // Stop the simulation after the duration
        if (currentTime >= simulationDuration) {
            clearInterval(intervalId);
        }
    }, updateInterval);
});











