function initRegisterPage() {
    const form = document.getElementById('registerForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!fullName || !email || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        
        const result = registerUser(email, password, fullName);
        if (result.success) {
            alert(result.message);
            window.location.href = 'index.html';
        } else {
            alert(result.message);
        }
    });
}

function initLoginPage() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        const result = loginUser(email, password);
        if (result.success) {
            alert(result.message);
            window.location.href = 'index.html';
        } else {
            alert(result.message);
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page;
    if (page === 'register') initRegisterPage();
    if (page === 'login') initLoginPage();
});
