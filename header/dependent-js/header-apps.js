/* Tooling
/* ========================================================================== */

import { $assign as $, $dispatch, $replaceAll } from 'esri-global-shared';

/* Apps 
/* ========================================================================== */

const prefix = 'esri-header-apps';

export default () => {
	/* Apps: Content
	/* ====================================================================== */

	const $content = $('div', {
		class: `${prefix}-content`, 
		id: `${prefix}-content`,
		aria: { expanded: false, labelledby: `${prefix}-control` }
	});

	const $appSwitcherIcon = $('span', {
    title: "App Launcher",
    "aria-label": "App Launcher Icon"
	});

	$appSwitcherIcon.innerHTML = '<svg height="24px" width="24px" class="app-switcher-svg" shape-rendering="crispEdges"><rect x="1" y="1" width="4" height="4"/><rect x="10" y="1" width="4" height="4"/><rect x="19" y="1" width="4" height="4"/><rect x="1" y="10" width="4" height="4"/><rect x="10" y="10" width="4" height="4"/><rect x="19" y="10" width="4" height="4"/><rect x="1" y="19" width="4" height="4"/><rect x="10" y="19" width="4" height="4"/><rect x="19" y="19" width="4" height="4"/></svg>'

	/* Apps: Control
	/* ====================================================================== */

	const $controlContainer = $('button', { 
		class: `${prefix}-control empty-padding`, id: `${prefix}-control`,
	});

	const $dropdown = $('div', {
		class: 'dropdown'
	});

	$controlContainer.append($dropdown);

	const $control = $controlContainer;

	$controlContainer.addEventListener('click', (event) => {
		$dispatch($control, 'header:click:apps', { event });

		// Elements with following class won't trigger/dispatch the dropdown 
		if (event.target.classList.contains(`${prefix}-prevent-dropdown`)) return;

		$dispatch($control, 'header:menu:toggle', {
			state: 'menu',
			target: $target,
			type: 'root-toggle',
			control: $control,
			content: $content,
			event
		});
	});

	/* Apps: Target
	/* ====================================================================== */

	const $target = $('div', { class: prefix },
		$control
	);

	/* Apps: Helper Functions for Update
	/* ====================================================================== */

  const createDefaultAppLayout = ($topAppContainer, currentApp) => {
		const abbreviationSizes = ["0px", "32px", "24px", "20px", "18px", "16px", "14px"];

		let listItem = $("li", {
			alt: "",
			class: `${prefix}-prevent-dropdown link-off-black appLinkContainer`,
			role: "menuitem"
		});

		let appLink = $("a", {
			href: currentApp.url, // + "#username=" + this._currentUser.username,
			target: "_blank",
			class: "appLink"
		});
		// Check if App has Icon
		if (currentApp.image) {
			let appImageContainer = $("div", {"class": "appIconImage"});
			appImageContainer.append($("img", {"class": "appIconPng", "alt": "", src: currentApp.image}));
			appLink.append(appImageContainer);
		}
		else {
      let stringWidth = Math.round(getTextWidth(currentApp.abbr || "", "avenir") / 5);
      let abbreviationSize = abbreviationSizes[stringWidth];
      if (stringWidth > 6) { // Prevent user from exceeding icon width
        currentApp.abbr = currentApp.abbr.substr(0, 4);
        abbreviationSize =  abbreviationSizes[4];
      }
			let surfaceDiv = $("div", {"class": "appIconImage"});
			let surfaceSpan = $("span", {
				style: "font-size:" + abbreviationSize,
				class: "avenir appIconSvgText"
			}, currentApp.abbr)
			surfaceDiv.append(surfaceSpan);
			surfaceDiv.append($("img", {"src": currentApp.placeHolderIcon, "alt": ""}));
			appLink.append(surfaceDiv);
		}
		let p = $("p", {style: "margin:0 auto; text-align:center" }, currentApp.label);
		appLink.append(p);
		listItem.append(appLink);
		$topAppContainer.append(listItem);
	}

  const getTextWidth = (text, font) => { // Adds support for app abbreviations in all languages
    let canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    let context = canvas.getContext("2d");
    context.font = font;
    let metrics = context.measureText(text);
    return metrics.width;
  }

	/* Apps: On Update
	/* ====================================================================== */

	$target.addEventListener('header:update:apps', ({ detail }) => {
    if (detail.icons) {
      $target.appendChild($content);
      $control.className = `${prefix}-control`;

      $($control, { aria: { label: detail.label } });

      let numberOfApps = detail.icons.length;
      let dropdownWidth = " dropdown-width-" + String(numberOfApps < 4 ? numberOfApps : 4);

      // App Icons

      const $topAppContainer = $("ul", {
        class: `${prefix}-prevent-dropdown appContainer`,
        role: "menu"
      });

      let maxAppsPerDialog = numberOfApps >= 100 ? 100 : numberOfApps;
      for (let i = 0; i < maxAppsPerDialog; i++) {
        if (detail.icons[i]["webMappingApp"] && detail.icons.appTitle !== this.currentUserApps[i]["title"].toLowerCase()) {
          this._createWebMappingAppLayout($topAppContainer, i);
        } else if (detail.icons[i].label) {
          createDefaultAppLayout($topAppContainer, detail.icons[i]);
        }
      }

      // Container
      const $dropdownWrapper = $('div', {class: `${prefix}-prevent-dropdown`}, $topAppContainer);

      const $dropdownNav = $('nav', {
        class: `${prefix}-prevent-dropdown dropdown-menu dropdown-right app-switcher-dropdown-menu` + dropdownWidth,
        role: "menu"
      }, $dropdownWrapper);

      $replaceAll($dropdown, $appSwitcherIcon, $dropdownNav);
    }
	});

	return $target;
};
