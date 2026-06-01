import { SUPABASE_URL, SUPABASE_KEY } from '../.env.js';

// Initialize Supabase Client
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const registerForm = document.getElementById('registerForm');
const modalLoginBtn = document.getElementById('modalLoginBtn');

if (modalLoginBtn) {
    modalLoginBtn.addEventListener('click', () => {
        window.location.href = "../login/login.html";
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!supabaseClient) {
            alert("Supabase não está disponível. Verifique a sua ligação ou configuração.");
            return;
        }

        const submitBtn = registerForm.querySelector('button[type="submit"]');

        // Prevent double submission
        if (submitBtn.disabled) return;
        submitBtn.disabled = true;
        submitBtn.textContent = "A criar conta...";

        const display_name = document.getElementById('create-display_name').value;
        const email = document.getElementById('create-email').value;
        const password = document.getElementById('create-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            alert("As passwords não coincidem.");
            submitBtn.disabled = false;
            submitBtn.textContent = "Registar";
            return;
        }

        // Setup a 15-second timeout in case the network fails
        const timeoutId = setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = "Registar";
            alert("O pedido demorou muito. Tente novamente.");
        }, 15000);

        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: { data: { display_name } }
            });

            // Clear the timeout since the request finished
            clearTimeout(timeoutId);

            if (error) {
                alert("Erro no registo: " + error.message);
                submitBtn.disabled = false;  // Re-enable on error
                submitBtn.textContent = "Registar";
            } else {
                // Show custom beautiful success popup
                const successModal = document.getElementById('successModal');
                if (successModal) {
                    successModal.classList.add('active');
                } else {
                    alert("Conta criada com sucesso! Já pode fazer login.");
                    window.location.href = "../login/login.html";
                }
            }
        } catch (err) {
            // Make sure we clear the timeout and re-enable button on unexpected crash
            clearTimeout(timeoutId);
            alert("Ocorreu um erro inesperado: " + err.message);
            submitBtn.disabled = false;
            submitBtn.textContent = "Registar";
        }
    });
}