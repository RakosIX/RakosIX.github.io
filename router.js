let pageUrls = {
	about: '/index.html?about',
	contact: '/index.html?contact',
	gallery: '/index.html?gallery'
};

function OnStartUp() {
	popStateHandler();
}
OnStartUp();

document.querySelector('#about-link').addEventListener('click', (event) => {
	let stateObj = { page: 'about' };
	document.title = 'About';
	history.pushState(stateObj, "about", "?about");
	RenderAboutPage();
});

document.querySelector('#contact-link').addEventListener('click', (event) => {
	let stateObj = { page: 'contact' };
	document.title = 'Contact';
	history.pushState(stateObj, "contact", "?contact");
	RenderContactPage();
});

document.querySelector('#gallery-link').addEventListener('click', (event) => {
	let stateObj = { page: 'gallery' };
	document.title = 'Gallery';
	history.pushState(stateObj, "gallery", "?gallery");
	RenderGalleryPage();
});

function RenderAboutPage() {
	document.querySelector('main').innerHTML = `
	<h1 class="title">About Me</h1>
	<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry...</p>`;
}

function RenderContactPage() {
	document.querySelector('main').innerHTML = `
	<h1 class="title">Contact with me</h1>
	<form id="contact-form" novalidate>
	<div id="contact-errors" style="color:#900;margin-bottom:0.6rem"></div>
	<label for="name">Imię:</label>
	<input type="text" id="name" name="name" required>
	<label for="email">E-mail:</label>
	<input type="email" id="email" name="email" required>
	<label for="message">Wiadomość:</label>
	<textarea id="message" name="message" required></textarea>
	<div id="g-recaptcha" style="margin:0.6rem 0"></div>
	<button type="submit" id="contact-submit">Wyślij</button>
	</form>`;


	const RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
	const errorsEl = document.getElementById('contact-errors');
	const form = document.getElementById('contact-form');
	const submitBtn = document.getElementById('contact-submit');
	let recaptchaWidgetId = null;

	function showErrors(msg) {
		errorsEl.textContent = msg || '';
	}

	function validate() {
		const name = document.getElementById('name').value.trim();
		const email = document.getElementById('email').value.trim();
		const message = document.getElementById('message').value.trim();
		if (!name) return 'Podaj imię.';
		if (!email) return 'Podaj e-mail.';
		const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
		if (!emailRe.test(email)) return 'Podaj poprawny e-mail.';
		if (!message || message.length < 5) return 'Wiadomość powinna mieć co najmniej 5 znaków.';
		return null;
	}

	function loadRecaptcha(siteKey) {
		if (!siteKey) return;
		if (window.grecaptcha && window.grecaptcha.render) {
			recaptchaWidgetId = grecaptcha.render('g-recaptcha', { sitekey: siteKey });
			return;
		}
		const s = document.createElement('script');
		s.src = 'https://www.google.com/recaptcha/api.js?onload=__onRecaptchaLoaded&render=explicit';
		s.async = true; s.defer = true;
		document.head.appendChild(s);
		window.__onRecaptchaLoaded = function() {
			recaptchaWidgetId = grecaptcha.render('g-recaptcha', { sitekey: siteKey });
		};
	}

	loadRecaptcha(RECAPTCHA_SITE_KEY);

	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		showErrors('');
		const v = validate();
		if (v) { showErrors(v); return; }
		// reCAPTCHA check (if key provided)
		if (RECAPTCHA_SITE_KEY) {
			const token = grecaptcha.getResponse(recaptchaWidgetId);
			if (!token) { showErrors('Potwierdź, że nie jesteś robotem.'); return; }
			console.log('reCAPTCHA token:', token);
		}
		submitBtn.disabled = true;
		try {
			const payload = {
				name: document.getElementById('name').value.trim(),
				email: document.getElementById('email').value.trim(),
				message: document.getElementById('message').value.trim()
			};
			console.log('Sending contact payload', payload);
			alert('Wysłano formularz (mock).');
			form.reset();
			if (RECAPTCHA_SITE_KEY && window.grecaptcha && recaptchaWidgetId !== null) grecaptcha.reset(recaptchaWidgetId);
		} catch (e) {
			showErrors('Błąd wysyłki.');
		} finally { submitBtn.disabled = false; }
	});
}

function RenderGalleryPage() {
	const seeds = Array.from({ length: 9 }, (_, i) => i + 1);
	document.querySelector('main').innerHTML = `
	<h1 class="title">Gallery</h1>
	<div id="gallery" class="gallery-grid">
		${seeds.map(i => `<div class="thumb" data-src="https://picsum.photos/seed/${i}/1200/900" tabindex="0"><div class="thumb-placeholder">Ładowanie...</div></div>`).join('')}
	</div>
	<div id="modal" class="modal hidden">
		<div class="modal-backdrop"></div>
		<div class="modal-content">
			<button id="modal-close" class="modal-close">Zamknij</button>
			<img id="modal-image" class="modal-image" src="" alt="Zdjęcie">
		</div>
	</div>`;

	const gallery = document.getElementById('gallery');
	const thumbs = gallery.querySelectorAll('.thumb');

	function openModal(url) {
		const modal = document.getElementById('modal');
		const modalImg = document.getElementById('modal-image');
		modalImg.src = url;
		modal.classList.remove('hidden');
	}

	function closeModal() {
		const modal = document.getElementById('modal');
		const modalImg = document.getElementById('modal-image');
		modal.classList.add('hidden');
		modalImg.src = '';
	}

	document.getElementById('modal-close').addEventListener('click', closeModal);
	document.querySelector('.modal-backdrop').addEventListener('click', closeModal);
	window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

	const observer = new IntersectionObserver((entries, obs) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const el = entry.target;
				if (el.dataset.loaded) { obs.unobserve(el); return; }
				const src = el.dataset.src;
				fetch(src).then(res => res.blob()).then(blob => {
					const url = URL.createObjectURL(blob);
					const img = document.createElement('img');
					img.className = 'thumb-img';
					img.src = url;
					img.alt = 'Photo';
					el.innerHTML = '';
					el.appendChild(img);
					el.dataset.loaded = '1';
					img.addEventListener('click', () => openModal(url));
					el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') openModal(url); });
				}).catch(() => {
					el.innerHTML = '<div class="thumb-error">Błąd</div>';
				});
				obs.unobserve(el);
			}
		});
	}, { rootMargin: '200px' });

	thumbs.forEach(t => observer.observe(t));
}

function popStateHandler() {
	let loc = window.location.href.toString().split(window.location.host)[1];
	if (loc === pageUrls.contact) { RenderContactPage(); }
	else if (loc === pageUrls.about) { RenderAboutPage(); }
	else if (loc === pageUrls.gallery) { RenderGalleryPage(); }
}

window.onpopstate = popStateHandler;

function setupThemeToggle() {
	const btn = document.getElementById('theme-toggle');
	if (!btn) return;
	const stored = localStorage.getItem('theme');
	if (stored === 'dark') document.body.classList.add('dark-mode');
	else document.body.classList.remove('dark-mode');
	btn.addEventListener('click', () => {
		const isDark = document.body.classList.toggle('dark-mode');
		try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (e) {}
	});
}
setupThemeToggle();
