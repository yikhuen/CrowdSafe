from flask import Flask, jsonify, request, send_from_directory
import numpy as np

# Initialize Flask app
app = Flask(__name__, static_folder='../frontend')

# Simulation parameters
num_agents = 100
width, height = 600, 600

# Define the boxes for entry, stage, exit, and barriers
entry_box = np.array([[50, 50], [150, 150]])  # Top-left and bottom-right corners of the entry box
stage_box = np.array([[250, 250], [350, 350]])  # Stage box
exit_box = np.array([[450, 450], [550, 550]])  # Exit box
barrier1 = np.array([200, 200])  # Barrier 1 position
barrier2 = np.array([400, 400])  # Barrier 2 position

# Initialize positions and velocities
positions = np.random.rand(num_agents, 2) * (entry_box[1] - entry_box[0]) + entry_box[0]
velocities = np.zeros((num_agents, 2))

def reset_positions():
    """Reset the positions to start at the entry box."""
    global positions, velocities
    positions = np.random.rand(num_agents, 2) * (entry_box[1] - entry_box[0]) + entry_box[0]
    velocities = np.zeros((num_agents, 2))

def orca_velocity(velocities, positions, preferred_velocity):
    new_velocities = np.copy(velocities)
    
    for i in range(num_agents):
        orca_velocity = preferred_velocity[i]
        for j in range(num_agents):
            if i != j:
                relative_position = positions[j] - positions[i]
                relative_velocity = velocities[j] - velocities[i]
                distance = np.linalg.norm(relative_position)
                if distance > 0:
                    combined_radius = 10  # Radius sum for collision
                    combined_radius_sq = combined_radius ** 2
                    if distance < combined_radius:
                        orca_velocity -= relative_position * (combined_radius_sq / (distance ** 2))
        
        # Avoid barriers
        for barrier in [barrier1, barrier2]:
            relative_position = barrier - positions[i]
            distance = np.linalg.norm(relative_position)
            if distance > 0 and distance < 15:  # Avoid the barrier within 15 meters
                avoidance_strength = (15 - distance) / 15  # Stronger repulsion closer to the barrier
                orca_velocity -= avoidance_strength * relative_position / distance
        
        new_velocities[i] = orca_velocity
    
    return new_velocities

def social_force_model(phase):
    global positions, velocities
    
    # Define the target point based on the current phase
    if phase == 'to_entry':
        reset_positions()  # Reset positions to start at the entry box
        target_box = entry_box
    elif phase == 'to_stage':
        target_box = stage_box
    elif phase == 'to_exit':
        target_box = exit_box

    # Calculate the center of the target box
    target_center = target_box.mean(axis=0)
    
    # Calculate the preferred velocity towards the center of the target box
    speed_multiplier = 2.0  # Adjust this value to control the speed
    preferred_velocity = speed_multiplier * (target_center - positions) / np.linalg.norm(target_center - positions, axis=1, keepdims=True)
    
    # Add randomness
    noise = 0.2 * (np.random.rand(num_agents, 2) - 0.5)
    preferred_velocity += noise
    
    # Apply ORCA to adjust velocities
    velocities = orca_velocity(velocities, positions, preferred_velocity)
    
    # Update positions based on the adjusted velocities
    positions += velocities
    
    # Ensure agents stay within the boundaries
    positions = np.clip(positions, 0, [width, height])
    
    return positions.tolist()

# Serve the index.html file when the root URL is accessed
@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

# Serve other static files (e.g., script.js)
@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

# API route to run the simulation and return positions
@app.route('/simulate', methods=['POST'])
def simulate():
    data = request.json
    phase = data.get('phase', 'to_stage')  # Get the phase from the request
    labels = data.get('labels')  # Get the updated label positions from the request
    
    if labels:
        global entry_box, stage_box, exit_box, barrier1, barrier2
        entry_box = np.array([[labels['entry']['x'] - 50, labels['entry']['y'] - 50],
                              [labels['entry']['x'] + 50, labels['entry']['y'] + 50]])
        stage_box = np.array([[labels['stage']['x'] - 50, labels['stage']['y'] - 50],
                              [labels['stage']['x'] + 50, labels['stage']['y'] + 50]])
        exit_box = np.array([[labels['exit']['x'] - 50, labels['exit']['y'] - 50],
                             [labels['exit']['x'] + 50, labels['exit']['y'] + 50]])
        barrier1 = np.array([labels['barrier1']['x'], labels['barrier1']['y']])
        barrier2 = np.array([labels['barrier2']['x'], labels['barrier2']['y']])
    
    positions = social_force_model(phase)
    return jsonify({'positions': positions})

# Start the Flask application
if __name__ == '__main__':
    app.run(debug=True)







