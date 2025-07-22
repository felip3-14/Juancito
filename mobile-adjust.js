document.addEventListener('DOMContentLoaded', function() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
        document.body.classList.add('mobile-detected');
    }
}); 