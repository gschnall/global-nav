/* Global Footer: Tooling
/* ========================================================================== */

import { $assign as $, $dispatch } from 'esri-global-shared';

import languageDialog from 'esri-global-language';

/* Global Footer
/* ========================================================================== */

export default (data, prefix) => {
	// Language Selection Button
	const $labelText = document.createTextNode(data.buttonLabel);
	const $control = $('button', { class: `${prefix}-language-control`, ariaDescribedby: `${prefix}-language` }, $labelText);
	const $barrier = $('div', { class: `${prefix}-language` }, $control);

	$control.addEventListener('click', openDialog);

	// Language Dialog
	data.prefix = `${prefix}-language-dialog`;

	const $languageDialog = languageDialog(data);

	// Language Dialog Close Button
	const $languageDialogClose = $('button', {
		class: `${prefix}-language-dialog-close`, id: 'dialog-description',
		ariaLabel: data.closeLabel
	});

	$languageDialogClose.addEventListener('click', closeDialog);

	$($languageDialog, $languageDialogClose);

	// Language Dialog Canvas
	const $cancelCanvas = $('button', {
		class: `${prefix}-language-dialog-cancel-canvas`,
		type: 'button',
		tabindex: -1
	});

	$cancelCanvas.addEventListener('click', closeDialog);

	function openDialog(event) {
		event.preventDefault();

		$($canvas, {
			aria: { expanded: true }
		});
	}

	function closeDialog(event) {
		event.preventDefault();

		$($canvas, {
			aria: { expanded: false }
		});
	}

	// ...
	const $canvas = $('div', {
		class: `${prefix}-language-dialog-barrier`,
		aria: { expanded: false }
	}, $languageDialog, $cancelCanvas);

	// ...
	$control.addEventListener('click', () => {
		$dispatch($control, 'footer:click:language', data);
	});

	// ...
	$barrier.addEventListener('footer:update:language', ({ detail }) => {
		$labelText.nodeValue = detail.buttonLabel;

		$barrier.ownerDocument.body.appendChild(
			$canvas
		);

		$barrier.ownerDocument.defaultView.addEventListener('keydown', ({ keyCode } = event) => {
			if (27 === keyCode) {
				closeDialog(event);
			}
		});
	});

	return $barrier;
};
