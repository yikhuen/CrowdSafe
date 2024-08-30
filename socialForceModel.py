import numpy as np
import random

def simulate_crowd_movement():
    # Implement the Social Force Model to simulate crowd movement
    # This is a simplified placeholder; implement the actual logic based on your requirements
    grid_size = 10
    steps = 50  # Number of steps in the simulation

    grid_snapshots = []

    for step in range(steps):
        grid = np.zeros((grid_size, grid_size))

        # Random example logic for crowd movement; replace with actual Social Force Model logic
        entrance = (0, 0)
        exit = (9, 9)
        position = entrance

        while position != exit:
            next_move = (position[0] + random.choice([-1, 1]), position[1] + random.choice([-1, 1]))
            next_move = (min(max(0, next_move[0]), grid_size - 1), min(max(0, next_move[1]), grid_size - 1))
            grid[next_move[0], next_move[1]] += 1
            position = next_move

        grid_snapshots.append(grid.tolist())

    return grid_snapshots
