/**
 * Event listener for increment button
 */
document.addEventListener('DOMContentLoaded', function() {
    const incrementBtn = document.getElementById('incrementBtn');
    const counterDisplay = document.getElementById('counter');
    let count = 0;

    incrementBtn.addEventListener('click', function() {
        count++;
        counterDisplay.textContent = count;
    });
});
