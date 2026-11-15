const inputs = document.querySelectorAll('.code-input');
const submitBtn = document.getElementById('submitBtn');
const resendBtn = document.getElementById('resendBtn');
const form = document.getElementById('codeForm');

// Avtomatik fokus
inputs[0].addEventListener('paste', (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{4}$/.test(pasteData)) {
        pasteData.split('').forEach((digit, i) => {
            inputs[i].value = digit;
            inputs[i].classList.add('filled');
        });
        checkAllFilled();
    }
});

inputs.forEach((input, index) => {
    input.addEventListener('input', () => {
        input.value = input.value.replace(/[^0-9]/g, '');
        
        if (input.value) {
            input.classList.add('filled');
            input.classList.remove('error');
            if (index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        } else {
            input.classList.remove('filled');
        }
        checkAllFilled();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && index > 0) {
            inputs[index - 1].focus();
            inputs[index - 1].value = '';
            inputs[index - 1].classList.remove('filled', 'error');
        }
    });

    input.addEventListener('focus', () => {
        input.select();
    });
});

function checkAllFilled() {
    const allFilled = Array.from(inputs).every(inp => inp.value.length === 1);
    submitBtn.disabled = !allFilled;
    return allFilled;
}

// Yuborish
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = Array.from(inputs).map(i => i.value).join('');
    
    submitBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Tekshirilmoqda...';
    submitBtn.disabled = true;

    // ⏳ Simulyatsiya — haqiqiy kodni o'zgartiring
    setTimeout(() => {
        if (code === '2006') {
            // ✅ To'g'ri kod kiritdingiz
            submitBtn.innerHTML = '<i class="bx bx-check"></i> Muvaffaqiyatli!';
            submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            setTimeout(() => {
                // alert('Assalomu Alaykum Xush kelibsiz!');
                // resetForm();

                            // ✅ Sahifaga o'tish
            window.location.href = 'shaxsiy/Shaxsiy_menu.html'; // ← sahifa nomini yozing
            }, 1000);
        } else {
            // ❌ Noto'g'ri Telefon qiling!!!
            submitBtn.innerHTML = '<span>Kirish</span><i class="bx bx-right-arrow-alt"></i>';
            submitBtn.disabled = false;
            inputs.forEach(inp => {
                inp.classList.add('error');
                inp.value = '';
                inp.classList.remove('filled');
            });
            inputs[0].focus();
        }
    }, 1500);
});

function resetForm() {
    inputs.forEach(inp => {
        inp.value = '';
        inp.classList.remove('filled', 'error');
    });
    submitBtn.innerHTML = '<span>Kirish</span><i class="bx bx-right-arrow-alt"></i>';
    submitBtn.style.background = '';
    submitBtn.disabled = true;
    inputs[0].focus();
}

// Qayta yuborish
let countdown;
resendBtn.addEventListener('click', () => {
    resendBtn.disabled = true;
    let seconds = 999999;
    resendBtn.textContent = `${seconds} soniya... Kutasaa☻`;
    
    countdown = setInterval(() => {
        seconds--;
        if (seconds <= 0) {
            clearInterval(countdown);
            resendBtn.textContent = 'Qayta yuborish';
            resendBtn.disabled = false;
        } else {
            resendBtn.textContent = `${seconds} soniya...`;
        }
    }, 1000);

    // ⏳ Kod yuborish simulyatsiyasi
    console.log('Yangi kod yuborildi!');
});
