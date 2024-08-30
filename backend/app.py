from flask import Flask, jsonify, request
import numpy as np

app = Flask(__name__)

# Social force model parameters
num_agents = 100
width, height = 600, 600
entry_point = (100, 100)
exit_point = (500, 500)
stage_point = (300, 300)
divider_point = (300, 100)

# Initialize positions randomly
positions = np.random.rand(num_agents, 2) * [width, height]

# Define a simple social force model
def social_force_model():
    global positions
    # Simulate forces towards the stage for simplicity
    desired_velocity = (stage_point - positions) / np.linalg.norm(stage_point - positions, axis=1, keepdims=True)
    noise = 0.3 * (np.random.rand(num_agents, 2) - 0.5)
    positions += desired_velocity + noise
    positions = np.clip(positions, 0, [width, height])
    return positions.tolist()

@app.route('/simulate', methods=['POST'])
def simulate():
    positions = social_force_model()
    return jsonify({'positions': positions})

if __name__ == '__main__':
    app.run(debug=True)
