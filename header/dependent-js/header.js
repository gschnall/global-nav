import { $assign as $, $dispatch, $enableFocusRing, $replaceAll } from 'esri-global-shared';

import createAccount from './header-account';
import createBrand   from './header-brand';
import createMenus   from './header-menus';
import createSearch  from './header-search';
import createApps    from './header-apps';

/* Header
/* ====================================================================== */

export default (data) => {
	let viewportIsSmall;
	let viewportIsSmallMedium;

	/* Canvas
	/* ====================================================================== */

	const $headerCanvas = $('button', {
		class: 'esri-header-canvas',
		tabindex: '-1',
		data: { open: false }
	});

	$headerCanvas.addEventListener('click', () => {
		$dispatch($headerCanvas, 'header:menu:close');
	});

	/* Elements
	/* ====================================================================== */

	const $brand   = createBrand();
	const $account = createAccount();
	const $menus   = createMenus();
	const $search  = createSearch();
	const $apps    = createApps();

	const $client  = $('div', { class: 'esri-header-client' },
		$account
	);

	const $lineBreak = $('div', { class: 'esri-header-lineBreak' });

	const $header = $('div', { class: `esri-header -${data.theme || 'web'}` },
		$headerCanvas,
		$brand,
		$menus,
		$search,
		$lineBreak,
    $apps,
		$client
	);

	$enableFocusRing($header);

	/* On Header Update
	/* ====================================================================== */

	$header.addEventListener('header:update', ({ detail }) => {
		if (detail.brand) {
			$dispatch($brand, 'header:update:brand', detail.brand);
		}

		if (detail.menus) {
			$dispatch($menus, 'header:update:menus', detail.menus);
		}

		if (detail.search) {
			$dispatch($search, 'header:update:search', detail.search);
		}

		if (detail.apps) {
			$dispatch($apps, 'header:update:apps', detail.apps);
		}

		if (detail.account) {
			$dispatch($client.lastChild, 'header:update:account', detail.account);
		}

		$header.ownerDocument.defaultView.addEventListener('keydown', ({ keyCode }) => {
			if (27 === keyCode) {
				$dispatch($header, 'header:menu:close');
			}
		});
	});

	/* On Header Menu Toggle
	/* ====================================================================== */

	$header.addEventListener('header:menu:toggle', ({ detail }) => {
		const submenuShouldOpen = 'true' !== detail.control.getAttribute('aria-expanded');
		const eventType = submenuShouldOpen ? 'header:menu:open' : 'header:menu:close';

		$dispatch(detail.control, eventType, detail);
	});

	/* On Header Menu Open
	/* ====================================================================== */

	let accountDetail = null;
	let appsDetail    = null;
	let searchDetail  = null;
	let menusDetail   = null;
	let menuDetail    = null;

	$header.addEventListener('header:menu:open', ({ detail }) => {
		const isMenuToggle = 'menu-toggle' === detail.type;

		// Update Control, Content
		$(detail.control, { aria: { expanded: true } });
		$(detail.content, { aria: { expanded: true, hidden: false } });

		if (menuDetail && menuDetail.control !== detail.control) {
			$dispatch(menuDetail.control, 'header:menu:close', menuDetail);
		}

		if ('menu-toggle' === detail.type) {
			menuDetail = detail;
		}

		if ($search === detail.target) {
			searchDetail = detail;
		} else if (searchDetail) {
			$dispatch($search, 'header:menu:close', searchDetail);

			searchDetail = null;
		}

		if ($menus === detail.target) {
			menusDetail = detail;
		} else if (menusDetail && !isMenuToggle && !viewportIsSmall.matches) {
			$dispatch($menus, 'header:menu:close', menusDetail);

			menusDetail = null;
		}

		if ($account === detail.target) {
			accountDetail = detail;
		} else if (accountDetail) {
			$dispatch($account, 'header:menu:close', accountDetail);

			accountDetail = null;
		}

		if ($apps === detail.target) {
			appsDetail = detail;
		} else if (appsDetail) {
			$dispatch($apps, 'header:menu:close', appsDetail);

			appsDetail = null;
		}

		// Update Canvas
		$($headerCanvas, { data: { open: true, state: detail.state } });

		// Update Document Root
		$($header.ownerDocument.documentElement, { data: { 'header-is-open': true } });
	});

	/* On Header Menu Close
	/* ====================================================================== */

	$header.addEventListener('header:menu:close', ({ detail }) => {
		const currentDetail = detail || menusDetail || searchDetail || accountDetail || appsDetail || menuDetail;

		if (currentDetail) {
			// Close the Detail
			$(currentDetail.control, { aria: { expanded: false } });
			$(currentDetail.content, { aria: { expanded: false, hidden: true } });

			const canvasShouldClose = !viewportIsSmallMedium.matches || 'menu-close' !== currentDetail.type && 'account-close' !== currentDetail.type;

			if (searchDetail && searchDetail.control === currentDetail.control) {
				$dispatch(searchDetail.content.lastChild, 'reset');
			}

			if (canvasShouldClose) {
				// Close the Canvas
				$($headerCanvas, { data: { open: false } });

				// Update Document Root
				$header.ownerDocument.documentElement.removeAttribute('data-header-is-open');
			}
		}
	});

	/* On DOMNodeInserted
	/* ====================================================================== */

	$header.addEventListener('DOMNodeInserted', function onload() {
		// Get Document and Window
		const $headerDocument = $header.ownerDocument;
		const $headerWindow   = $headerDocument.defaultView;

		const $style = $('style');

		let overflowY;

		if ($header.parentNode) {
			// Unbind Node Inserted
			$header.removeEventListener('DOMNodeInserted', onload);

			// Update Header
			$dispatch($header, 'header:update', data);

			/* On Resize
			/* ============================================================== */

			$($headerDocument.head,
				$style
			);

			$headerWindow.addEventListener('orientationchange', onresize);
			$headerWindow.addEventListener('resize', onresize);

			onresize();

			/* On Match Media Change
			/* ============================================================== */

			viewportIsSmall       = $headerWindow.matchMedia('(max-width: 767px)');
			viewportIsSmallMedium = $headerWindow.matchMedia('(max-width: 1023px)');

			viewportIsSmall.addListener(onViewportIsSmallChange);
			viewportIsSmallMedium.addListener(onViewportIsSmallMediumChange);

			onViewportIsSmallChange();
			onViewportIsSmallMediumChange();
		}

		function onresize() {
			const width  = $headerDocument.documentElement.clientWidth;
			const height = $headerDocument.documentElement.clientHeight;
			const scrollHeight = $headerDocument.documentElement.scrollHeight;

			overflowY = getComputedStyle($headerDocument.documentElement).overflowY.replace('visible', () => {
				return scrollHeight > height ? 'scroll' : 'visible';
			});

			$replaceAll($style,
				`:root{--esri-vw:${width}px;--esri-vh:${height}px}[data-header-is-open]{width:${width}px;height:${height}px;overflow-y:${overflowY}}`
			);
		}

		function onViewportIsSmallChange() {
			if (viewportIsSmall.matches) {
				$dispatch($header, 'header:breakpoint:s');

				$menus.lastChild.appendChild($account);
			} else {
				$dispatch($header, 'header:breakpoint:not:s');

				$client.appendChild($account);
			}
		}

		function onViewportIsSmallMediumChange() {
			if (viewportIsSmallMedium.matches) {
				$dispatch($header, 'header:breakpoint:sm');

				$($menus.lastChild, { aria: { hidden: 'false' === $menus.lastChild.getAttribute('aria-expanded') } });
			} else {
				$dispatch($header, 'header:breakpoint:not:sm');

				$($menus.lastChild, { aria: { hidden: false } });
			}
		}
	});

	return $header;
};
