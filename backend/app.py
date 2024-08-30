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

# Initialize positions randomly
positions = np.random.rand(num_agents, 2) * [width, height]

# Social force model to simulate crowd movement
def social_force_model():
    global positions
    # Calculate forces towards the stage for simplicity
    desired_velocity = (stage_point - positions) / np.linalg.norm(stage_point - positions, axis=1, keepdims=True)
    noise = 0.3 * (np.random.rand(num_agents, 2) - 0.5)
    positions += desired_velocity + noise
    positions = np.clip(positions, 0, [width, height])
    return positions.tolist()

# Serve the index.html file when the root URL is accessed
@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

# API route to run the simulation and return positions
@app.route('/simulate', methods=['POST'])
def simulate():
    positions = social_force_model()
    return jsonify({'positions': positions})

# Start the Flask application
if __name__ == '__main__':
    app.run(debug=True)


