from flask import Flask, request, jsonify
from socialForceModel import simulate_crowd_movement

app = Flask(__name__)

@app.route('/simulate', methods=['POST'])
def simulate():
    # Start the simulation based on input parameters (if any)
    result = simulate_crowd_movement()
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
