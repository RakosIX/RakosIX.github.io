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
	<form id="contact-form">
	<label for="name">Name:</label>
	<input type="text" id="name" name="name" required>
	<label for="email">Email:</label>
	<input type="email" id="email" name="email" required>
	<label for="message">Message:</label>
	<textarea id="message" name="message" required></textarea>
	<button type="submit">Send</button>
	</form>`;

	document.getElementById('contact-form').addEventListener('submit', (event) => {
		event.preventDefault();
		alert('Form submitted!');
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
					// also open on Enter key for accessibility
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
