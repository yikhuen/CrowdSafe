const svg = d3.select("#scatterplot");
const width = +svg.attr("width");
const height = +svg.attr("height");
const updateInterval = 10;  // 10 ms for smoother animation

let phase = 'to_entry';  // Initial phase
let currentTime = 0;  // Track simulation time
let intervalId = null;  // Store the interval ID for pausing and resuming

let labels = [
    { x: 100, y: 100, label: 'Entry' },
    { x: 300, y: 300, label: 'Stage' },
    { x: 500, y: 500, label: 'Exit' },
    { x: 200, y: 200, label: 'Barrier 1' },
    { x: 400, y: 400, label: 'Barrier 2' }
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
                return calculateDistance(d, other) < 25;  // Increased radius to 25 meters
            });

            return neighbors.length >= 5 ? "red" : "steelblue";
        });

    dots.exit().remove();
}

// Initialize the labels on the SVG
updateLabels();

function startFlowSimulation() {
    phase = 'to_entry';
    currentTime = 0;

    intervalId = setInterval(() => {
        // Continuous flow transition
        if (currentTime > 2000 && phase === 'to_entry') {
            phase = 'to_stage';  // Switch to the stage phase
        } else if (currentTime > 5000 && phase === 'to_stage') {  // Adjusted timing to 5 seconds
            phase = 'to_exit';  // Switch to the exit phase
        }

        const labelPositions = {
            entry: labels[0],
            stage: labels[1],
            exit: labels[2],
            barrier1: labels[3],
            barrier2: labels[4]
        };

        fetch('/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phase: phase, labels: labelPositions })
        })
        .then(response => response.json())
        .then(data => updateData(data.positions))
        .catch(error => console.error('Error:', error));

        currentTime += updateInterval;

        // Stop the simulation after 8 seconds
        if (currentTime >= 8000) {
            clearInterval(intervalId);
        }
    }, updateInterval);
}

function pauseSimulation() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

document.getElementById("simulate").addEventListener("click", function() {
    if (intervalId === null) {
        startFlowSimulation();
    }
});

document.getElementById("pause").addEventListener("click", function() {
    pauseSimulation();
});













