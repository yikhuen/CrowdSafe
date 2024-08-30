from flask import Flask, jsonify, request, send_from_directory
import numpy as np

# Initialize Flask app
app = Flask(__name__, static_folder='../frontend')

# Simulation parameters
num_agents = 100
width, height = 600, 600
entry_point = np.array([100, 100])
exit_point = np.array([500, 500])
stage_point = np.array([300, 300])
divider_point = np.array([300, 100])

# Initialize positions at the entry point
positions = np.random.rand(num_agents, 2) * 10 + entry_point  # Start close to the entry point

# Initialize velocities
velocities = np.zeros((num_agents, 2))

# ORCA parameters
time_horizon = 10  # Time horizon for collision prediction

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
        
        new_velocities[i] = orca_velocity
    
    return new_velocities

def social_force_model(phase):
    global positions, velocities
    
    # Define the target point based on the current phase
    if phase == 'to_entry':
        target_point = entry_point
    elif phase == 'to_stage':
        target_point = stage_point
    elif phase == 'to_exit':
        target_point = exit_point

    # Calculate the preferred velocity towards the target
    speed_multiplier = 2.0  # You can adjust this value to control the speed
    preferred_velocity = speed_multiplier * (target_point - positions) / np.linalg.norm(target_point - positions, axis=1, keepdims=True)
    
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
    phase = request.json.get('phase', 'to_stage')  # Get the phase from the request
    positions = social_force_model(phase)
    return jsonify({'positions': positions})

# Start the Flask application
if __name__ == '__main__':
    app.run(debug=True)



