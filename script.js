document.getElementById('startButton').addEventListener('click', () => {
    fetch('/api/simulate', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            animateGrid(data);
        })
        .catch(error => console.error('Error:', error));
});

function animateGrid(data) {
    const grid = document.getElementById('grid');

    data.forEach((snapshot, index) => {
        setTimeout(() => {
            grid.innerHTML = '';
            snapshot.forEach((row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                    const div = document.createElement('div');
                    if (cell > 0) div.className = 'crowd';
                    grid.appendChild(div);
                });
            });
        }, index * 500);  // Adjust speed as needed
    });
}


