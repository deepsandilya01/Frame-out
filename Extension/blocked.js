document.addEventListener('DOMContentLoaded', () => {
    const returnBtn = document.getElementById('returnBtn');
    if (returnBtn) {
        returnBtn.addEventListener('click', () => {
            // Attempt to go back, or just go to a neutral page if history is empty
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = 'https://www.google.com';
            }
        });
    }
});
