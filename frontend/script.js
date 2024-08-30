const svg = d3.select("#scatterplot");
const width = +svg.attr("width");
const height = +svg.attr("height");
const updateInterval = 10;  // 10 ms for smoother animation
const simulationDuration = 10000;  // 10 seconds for 1 hour simulation
let currentTime = 0;  // Start time at 0 ms
let phase = 'to_stage';  // Initial phase

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

// Timer setup
const timerElement = document.createElement("span");
timerElement.id = "timer";
document.getElementById("simulate").insertAdjacentElement("afterend", timerElement);

// Function to update the timer
function updateTimer() {
    let simulatedMinutes = Math.floor((currentTime / simulationDuration) * 60);  // Simulated time in minutes
    let simulatedSeconds = Math.floor(((currentTime / simulationDuration) * 3600) % 60);  // Simulated seconds
    timerElement.innerText = ` Time: ${simulatedMinutes}m ${simulatedSeconds}s`;
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
        .attr("cy", d => d[1]);

    dots.exit().remove();
}

document.getElementById("simulate").addEventListener("click", function() {
    const intervalId = setInterval(() => {
        // Update the timer
        updateTimer();

        // Control the phase transition
        if (currentTime > simulationDuration * 0.8 && phase === 'to_stage') {
            phase = 'to_exit';  // Switch phase to move towards exit near the end
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


