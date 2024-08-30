const svg = d3.select("#scatterplot");
const width = +svg.attr("width");
const height = +svg.attr("height");
const updateInterval = 10;  // 10 ms for smoother animation
const simulationDuration = 10000;  // 10 seconds for 1 hour simulation
let currentTime = 0;  // Start time at 0 ms
let phase = 'to_entry';  // Initial phase

const labels = [
    { x: 100, y: 100, label: 'Entry' },
    { x: 300, y: 300, label: 'Stage' },
    { x: 500, y: 500, label: 'Exit' }
];

// Draw labeled spots
svg.selectAll(".label")
    .data(labels)
    .enter().append("text")
    .attr("class", "label")
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .text(d => d.label);

// Timer setup
const timerElement = document.createElement("span");
timerElement.id = "timer";
document.getElementById("simulate").insertAdjacentElement("afterend", timerElement);

// Function to update the timer
function updateTimer() {
    let simulatedMinutes = Math.floor((currentTime / simulationDuration) * 60);  // Simulated time in minutes
    let simulatedSeconds = Math.floor(((currentTime / simulationDuration) * 3600) % 60);  // Simulated seconds

    // Ensure the timer reads exactly 60 minutes and 0 seconds at the end
    if (currentTime >= simulationDuration) {
        simulatedMinutes = 60;
        simulatedSeconds = 0;
    }

    timerElement.innerText = ` Time: ${simulatedMinutes}m ${simulatedSeconds}s`;
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
            // Calculate the number of neighbors within an increased radius
            const neighbors = data.filter((other, j) => {
                if (i === j) return false;  // Skip itself
                return calculateDistance(d, other) < 30;  // Increased radius to 30 meters
            });

            // Change color based on the number of neighbors
            return neighbors.length >= 5 ? "red" : "steelblue";
        });

    dots.exit().remove();
}

document.getElementById("simulate").addEventListener("click", function() {
    const intervalId = setInterval(() => {
        // Update the timer
        updateTimer();

        // Control the phase transition
        if (currentTime > simulationDuration * 0.3 && phase === 'to_entry') {
            phase = 'to_stage';  // Switch phase to move towards stage
        } else if (currentTime > simulationDuration * 0.6 && phase === 'to_stage') {
            phase = 'to_exit';  // Switch phase to move towards exit
        }

        // Fetch and update positions
        fetch('/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phase: phase })  // Send the current phase to the backend
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






