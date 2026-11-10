// ==UserScript==
// @name         Instagram DMs → Microsoft Teams skin
// @namespace    https://github.com/baljinnyam/monkey_tamper
// @version      0.2.0
// @description  Reskins Instagram Direct (instagram.com/direct) so it looks like the Microsoft Teams (new Teams, light theme) chat app.
// @author       Baljinnyam
// @match        https://www.instagram.com/*
// @grant        none
// @run-at       document-start
// @noframes
// ==/UserScript==

(function () {
    'use strict';

    const NS = 'tms'; // prefix for everything we inject
    const ON = `html.${NS}-on`; // every rule is scoped to Direct pages only

    // Fluent 2 teamsLightTheme tokens (from @fluentui/react-theme).
    const T = {
        brand: '#5b5fc7',
        brandBg2: '#e8ebfa',
        bg1: '#ffffff',
        bg1Hover: '#f5f5f5',
        bg1Selected: '#ebebeb',
        bg3: '#f5f5f5',
        bg5: '#ebebeb',
        fg1: '#242424',
        fg2: '#424242',
        fg3: '#616161',
        fg4: '#707070',
        fgDisabled: '#bdbdbd',
        stroke1: '#d1d1d1',
        stroke2: '#e0e0e0',
        red: '#c4314b',
        green: '#6bb700',
        font: '"Segoe UI", "Segoe UI Web (West European)", -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", sans-serif',
        shadow2: '0 0 2px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.14)',
        shadow16: '0 0 2px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.14)',
    };

    const TITLEBAR_H = 48;
    const RAIL_W = 68;

    // ---------------------------------------------------------------------
    // Icons (Fluent-style 20px regular outlines, drawn by hand)
    // ---------------------------------------------------------------------
    const svg = (body, size = 20) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

    const ICONS = {
        activity: svg('<path d="M10 2.5a5 5 0 0 0-5 5v3.2L3.6 13.6a.6.6 0 0 0 .54.9h11.72a.6.6 0 0 0 .54-.9L15 10.7V7.5a5 5 0 0 0-5-5Z"/><path d="M8 14.5a2 2 0 0 0 4 0"/>'),
        chat: svg('<path d="M10 3c3.9 0 7 2.7 7 6s-3.1 6-7 6c-.8 0-1.6-.1-2.3-.3L4 16.5l.9-3.1C3.7 12.3 3 10.7 3 9c0-3.3 3.1-6 7-6Z"/>'),
        teams: svg('<circle cx="7.5" cy="6.5" r="2.5"/><circle cx="14" cy="7" r="2"/><path d="M2.5 15.5v-1.2c0-1.8 1.5-3.3 3.3-3.3h3.4c1.8 0 3.3 1.5 3.3 3.3v1.2"/><path d="M13 11h1.6c1.6 0 2.9 1.3 2.9 2.9v1.1"/>'),
        calendar: svg('<rect x="3" y="4" width="14" height="13" rx="2"/><path d="M3 8h14M7 2.5V5M13 2.5V5"/>'),
        calls: svg('<path d="M6.3 3.2 4.6 3.6c-.8.2-1.3 1-1.1 1.8.9 4.9 4.7 8.8 9.6 9.9.8.2 1.6-.3 1.8-1.1l.5-1.7a1 1 0 0 0-.5-1.2l-2.2-1.1a1 1 0 0 0-1.2.3l-.7.9a8 8 0 0 1-3.8-3.8l.9-.7a1 1 0 0 0 .3-1.2L7.5 3.7a1 1 0 0 0-1.2-.5Z"/>'),
        onedrive: svg('<path d="M5.5 15.5h9.5a3 3 0 0 0 .4-6 4.5 4.5 0 0 0-8.6-1A3.5 3.5 0 0 0 5.5 15.5Z"/>'),
        apps: svg('<rect x="3" y="3" width="5.5" height="5.5" rx="1"/><rect x="11.5" y="3" width="5.5" height="5.5" rx="1"/><rect x="3" y="11.5" width="5.5" height="5.5" rx="1"/><path d="M14.25 11.5v5.5M11.5 14.25H17"/>'),
        more: svg('<circle cx="4.5" cy="10" r=".9" fill="currentColor"/><circle cx="10" cy="10" r=".9" fill="currentColor"/><circle cx="15.5" cy="10" r=".9" fill="currentColor"/>'),
        search: svg('<circle cx="8.5" cy="8.5" r="5"/><path d="m12.3 12.3 4.2 4.2"/>', 16),
        back: svg('<path d="M12.5 4 6.5 10l6 6"/>', 16),
        fwd: svg('<path d="m7.5 4 6 6-6 6"/>', 16),
        waffle: svg('<g fill="currentColor" stroke="none"><circle cx="4.5" cy="4.5" r="1.3"/><circle cx="10" cy="4.5" r="1.3"/><circle cx="15.5" cy="4.5" r="1.3"/><circle cx="4.5" cy="10" r="1.3"/><circle cx="10" cy="10" r="1.3"/><circle cx="15.5" cy="10" r="1.3"/><circle cx="4.5" cy="15.5" r="1.3"/><circle cx="10" cy="15.5" r="1.3"/><circle cx="15.5" cy="15.5" r="1.3"/></g>'),
    };

    // Fluent "colorful" avatar palette (colorPalette*Background2 / Foreground2).
    const AVATAR_COLORS = [
        ['#d69ca5', '#420610'], ['#eeacb2', '#6e0811'], ['#f1bbbc', '#751d1f'], ['#efc4ad', '#712d09'],
        ['#ffddb3', '#8f4e00'], ['#f9e2ae', '#835b00'], ['#ecdfa5', '#6c5700'], ['#e0cea2', '#553e06'],
        ['#ddc3b0', '#50301a'], ['#bdd99b', '#294903'], ['#a8f0cd', '#00723b'], ['#9ad29a', '#063b06'],
        ['#a6e9ed', '#00666d'], ['#9bd9db', '#02494c'], ['#94c8d4', '#00333f'], ['#a9d3f2', '#004377'],
        ['#9abfdc', '#002c4e'], ['#c8d1fa', '#2c3c85'], ['#a3b2e8', '#001665'], ['#d2ccf8', '#3f3682'],
        ['#c6b1de', '#341a51'], ['#d9a7e0', '#4c0d55'], ['#e6bfed', '#63276d'], ['#f7c0e3', '#80215d'],
        ['#eca5d1', '#6b0043'], ['#d696c0', '#43002b'], ['#d7d4d4', '#444241'], ['#cecccb', '#343231'],
        ['#cdd6d8', '#3b4447'], ['#bcc3c7', '#202427'],
    ];

    // Icons used as CSS masks over Instagram's own buttons.
    const maskUrl = (body) =>
        `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="black" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`)}")`;
    const MASKS = {
        call: maskUrl('<path d="M6.3 3.2 4.6 3.6c-.8.2-1.3 1-1.1 1.8.9 4.9 4.7 8.8 9.6 9.9.8.2 1.6-.3 1.8-1.1l.5-1.7a1 1 0 0 0-.5-1.2l-2.2-1.1a1 1 0 0 0-1.2.3l-.7.9a8 8 0 0 1-3.8-3.8l.9-.7a1 1 0 0 0 .3-1.2L7.5 3.7a1 1 0 0 0-1.2-.5Z"/>'),
        video: maskUrl('<rect x="2.5" y="5" width="10.5" height="10" rx="2"/><path d="m13 8.5 4.5-2.5v8L13 11.5"/>'),
        info: maskUrl('<circle cx="10" cy="10" r="7.5"/><path d="M10 9v5"/><circle cx="10" cy="6.4" r=".5" fill="black"/>'),
        person: maskUrl('<circle cx="10" cy="7" r="3.5"/><path d="M3.5 17c.6-3 3.3-5 6.5-5s5.9 2 6.5 5"/>'),
    };

    // Chat bubble illustration for the empty state (brand colour, not a mask).
    const CHAT_ART = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="${T.brand}" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3c3.9 0 7 2.7 7 6s-3.1 6-7 6c-.8 0-1.6-.1-2.3-.3L4 16.5l.9-3.1C3.7 12.3 3 10.7 3 9c0-3.3 3.1-6 7-6Z"/><path d="M7 8.2h6M7 10.6h4"/></svg>`)}")`;

    // A generic purple "T" tile, used as the favicon and the title-bar logo.
    const LOGO_SVG =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
        '<circle cx="23" cy="9" r="4" fill="#7b83eb"/>' +
        '<rect x="17" y="14" width="12" height="12" rx="3" fill="#7b83eb"/>' +
        '<rect x="3" y="7" width="18" height="18" rx="3" fill="#4b53bc"/>' +
        '<path d="M7.5 11.5h9v2.4h-3.3V21h-2.4v-7.1H7.5z" fill="#fff"/></svg>';
    const LOGO_URL = 'data:image/svg+xml,' + encodeURIComponent(LOGO_SVG);

    // ---------------------------------------------------------------------
    // CSS
    // ---------------------------------------------------------------------
    const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(',');

    // Instagram's own palette: variables hold bare "r,g,b" triplets.
    const IG_VARS = `
        --ig-primary-background: ${rgb(T.bg3)};
        --ig-secondary-background: ${rgb(T.bg1)};
        --ig-highlight-background: ${rgb(T.bg1)};
        --ig-elevated-background: ${rgb(T.bg1)};
        --ig-elevated-highlight-background: ${rgb(T.bg1Selected)};
        --ig-banner-background: ${rgb(T.bg1)};
        --ig-dropdown-background: ${rgb(T.bg1)};
        --ig-primary-text: ${rgb(T.fg1)};
        --ig-secondary-text: ${rgb(T.fg3)};
        --ig-primary-icon: ${rgb(T.fg2)};
        --ig-secondary-icon: ${rgb(T.fg3)};
        --ig-separator: ${rgb(T.stroke2)};
        --ig-elevated-separator: ${rgb(T.stroke2)};
        --ig-stroke: ${rgb(T.stroke1)};
        --ig-focus-stroke: ${rgb(T.brand)};
        --ig-link: ${rgb(T.brand)};
        --ig-primary-button: ${rgb(T.brand)};
        --ig-primary-button-hover: 79,82,178;
        --ig-badge: ${rgb(T.red)};
        --ig-hover-overlay: 0,0,0,.04;
        --ig-colors-button-primary-background: ${rgb(T.brand)};
        --ig-colors-button-primary-background--hover: 79,82,178;
        --ig-colors-button-primary-background--pressed: 68,71,145;
        --ig-colors-button-borderless-text: ${rgb(T.brand)};
        --ig-colors-button-primary-link-text: ${rgb(T.brand)};
    `;
    // Shared Meta design-system variables (plain colours) also used on IG.
    const META_VARS = `
        --primary-text: ${T.fg1};
        --secondary-text: ${T.fg3};
        --placeholder-text: ${T.fg4};
        --primary-icon: ${T.fg2};
        --secondary-icon: ${T.fg3};
        --accent: ${T.brand};
        --blue-link: ${T.brand};
        --primary-button-background: ${T.brand};
        --card-background: ${T.bg1};
        --surface-background: ${T.bg1};
        --popover-background: ${T.bg1};
        --web-wash: ${T.bg3};
        --divider: ${T.stroke2};
        --hover-overlay: rgba(0,0,0,0.04);
        --press-overlay: rgba(0,0,0,0.08);
    `;
    const important = (vars) => vars.replace(/;/g, ' !important;');

    const CSS = `
/* while the page boots, show only our title bar + rail (no flash of the real UI) */
html.${NS}-loading body > *:not(#${NS}-titlebar):not(#${NS}-rail) { visibility: hidden !important; }
html.${NS}-loading, html.${NS}-loading body { background: ${T.bg5} !important; }
/* ---------- base ---------- */
${ON}, ${ON} body { background: ${T.bg5} !important; }
${ON}, ${ON} body, ${ON} input, ${ON} textarea, ${ON} button, ${ON} [role=textbox] { font-family: ${T.font} !important; }
${ON} :is(:root, .__fb-dark-mode, .__fb-light-mode), ${ON}.__fb-dark-mode, ${ON}.__fb-light-mode {
    ${important(IG_VARS)}
    ${important(META_VARS)}
}

/* ---------- hide Instagram's own chrome ---------- */
${ON} .${NS}-ignav { display: none !important; }
${ON} .${NS}-notes { display: none !important; }
${ON} .${NS}-hide { display: none !important; }
${ON} .${NS}-invisible { visibility: hidden !important; }
/* story rings around avatars */
${ON} [role=navigation][aria-label="Thread list"] canvas,
${ON} .${NS}-header canvas { display: none !important; }

/* ---------- app shell ---------- */
${ON} .${NS}-shell {
    position: fixed !important;
    top: ${TITLEBAR_H}px !important;
    left: ${RAIL_W}px !important;
    right: 0 !important;
    bottom: 0 !important;
    width: auto !important;
    height: auto !important;
    margin: 0 !important;
    background: ${T.bg3} !important;
    border-top-left-radius: 8px !important;
    overflow: hidden !important;
    box-shadow: ${T.shadow2};
}

/* ---------- chat list ---------- */
${ON} [role=navigation][aria-label="Thread list"] {
    background: ${T.bg3} !important;
    border-right: 1px solid ${T.stroke2} !important;
}
/* account-switcher title "username ˅" → "Chat" */
${ON} .${NS}-listtitle { font-size: 0 !important; }
${ON} .${NS}-listtitle * { display: none !important; }
${ON} .${NS}-listtitle::after { content: "Chat"; font: 700 18px/24px ${T.font}; color: ${T.fg1}; }
/* "Messages" heading → Teams' "Recent" section label */
${ON} .${NS}-recent { font-size: 0 !important; display: inline-flex !important; align-items: center !important; }
${ON} .${NS}-recent::after { content: "Recent"; font: 600 12px/16px ${T.font}; color: ${T.fg3}; }
${ON} [role=navigation][aria-label="Thread list"] a[href^="/direct/requests"],
${ON} [role=navigation][aria-label="Thread list"] a[href^="/direct/requests"] * { font: 600 12px/16px ${T.font} !important; color: ${T.brand} !important; }

/* ---------- empty state (no chat open) ---------- */
${ON} .${NS}-empty-icon { position: relative !important; }
${ON} .${NS}-empty-icon svg { visibility: hidden !important; }
${ON} .${NS}-empty-icon::after {
    content: ""; position: absolute; left: 50%; top: 0; width: 96px; height: 96px; transform: translateX(-50%);
    border-radius: 50%; background: ${T.brandBg2} ${CHAT_ART} center / 48px no-repeat;
}
${ON} .${NS}-empty-title, ${ON} .${NS}-empty-desc { display: block !important; height: auto !important; min-height: 0 !important; }
${ON} .${NS}-empty-title { margin: 12px 0 4px !important; }
${ON} .${NS}-empty-desc { margin: 0 0 16px !important; }
${ON} .${NS}-empty-title { font-size: 0 !important; }
${ON} .${NS}-empty-title::after { content: "Select a chat to get started"; font: 600 20px/28px ${T.font}; color: ${T.fg1}; }
${ON} .${NS}-empty-desc { font-size: 0 !important; }
${ON} .${NS}-empty-desc::after { content: "Pick a conversation from the list, or start a new chat."; font: 400 14px/20px ${T.font}; color: ${T.fg3}; }
${ON} .${NS}-empty-btn { font-size: 0 !important; border-radius: 4px !important; }
${ON} .${NS}-empty-btn::after { content: "New chat"; font: 600 14px/20px ${T.font}; color: #fff; }
${ON} [role=navigation][aria-label="Thread list"] label:has(input) {
    background: ${T.bg1} !important;
    border-radius: 4px !important;
    border-bottom: 1px solid ${T.fg4} !important;
}
${ON} [role=navigation][aria-label="Thread list"] label:has(input:focus) { border-bottom: 2px solid ${T.brand} !important; }
${ON} [role=navigation][aria-label="Thread list"] input { background: transparent !important; color: ${T.fg1} !important; font-size: 14px !important; }
${ON} [role=navigation][aria-label="Thread list"] svg[aria-label="Down Chevron Icon"] { display: none !important; }
/* rows */
${ON} .${NS}-row { border-radius: 4px !important; margin: 0 8px !important; }
${ON} .${NS}-row:hover { background: rgba(255,255,255,0.7) !important; } /* list bg is already bg1Hover */
${ON} .${NS}-row.${NS}-row-on { background: ${T.bg1} !important; box-shadow: ${T.shadow2} !important; }
${ON} .${NS}-row span { font-size: 12px !important; line-height: 16px !important; }
${ON} .${NS}-row .${NS}-rowname, ${ON} .${NS}-row .${NS}-rowname * { font-size: 14px !important; line-height: 20px !important; color: ${T.fg1} !important; }
${ON} .${NS}-row .${NS}-av { zoom: 0.64; }

/* ---------- conversation ---------- */
${ON} .${NS}-header {
    background: ${T.bg1} !important;
    border-bottom: 1px solid ${T.stroke2} !important;
}
${ON} .${NS}-header .${NS}-av { zoom: 0.73; }
${ON} .${NS}-header .${NS}-hname { font-size: 16px !important; font-weight: 700 !important; color: ${T.fg1} !important; }
/* Instagram's header icons → Teams outline icons */
${ON} .${NS}-hbtn { position: relative !important; border-radius: 4px !important; }
${ON} .${NS}-hbtn svg { visibility: hidden !important; }
${ON} .${NS}-hbtn::after {
    content: ""; position: absolute; inset: 0; margin: auto; width: 20px; height: 20px;
    background: ${T.fg2}; pointer-events: none;
    -webkit-mask: var(--${NS}-icon) center / 20px no-repeat; mask: var(--${NS}-icon) center / 20px no-repeat;
}
${ON} .${NS}-hbtn:hover::after { background: ${T.brand}; }

/* message bubbles → Teams message cards */
${ON} .${NS}-bubble {
    border-radius: 6px !important;
    background-image: none !important;
}
${ON} .${NS}-bubble, ${ON} .${NS}-bubble * { color: ${T.fg1} !important; }
${ON} .${NS}-bubble [dir=auto] { font-size: 14px !important; line-height: 20px !important; }
${ON} .${NS}-bubble.${NS}-in { background-color: ${T.bg1} !important; box-shadow: ${T.shadow2} !important; }
${ON} .${NS}-bubble.${NS}-out { background-color: ${T.brandBg2} !important; box-shadow: none !important; }
${ON} .${NS}-bubble a { color: ${T.brand} !important; }
${ON} .${NS}-bubble[data-${NS}-meta]::before {
    content: attr(data-${NS}-meta);
    display: block;
    margin: 2px 0;
    font: 400 12px/16px ${T.font};
    color: ${T.fg3} !important;
    white-space: pre;
}

/* composer → Teams "Type a message" box */
${ON} .${NS}-composer-box {
    background: ${T.bg1} !important;
    border: 0 !important;
    border-radius: 4px !important;
    border-bottom: 2px solid transparent !important;
    box-shadow: ${T.shadow2} !important;
}
${ON} .${NS}-composer-box:focus-within { border-bottom-color: ${T.brand} !important; }
${ON} .${NS}-composer-box [role=textbox] { color: ${T.fg1} !important; font-size: 14px !important; caret-color: ${T.brand} !important; }
${ON} .${NS}-composer-box svg { color: ${T.fg3} !important; }
/* voice clips are very Instagram, and easy to start by accident */
${ON} .${NS}-composer-box [role=button]:has(svg[aria-label="Voice clip"]) { display: none !important; }

/* chat header tabs */
${ON} #${NS}-tabs {
    display: inline-flex; gap: 16px; margin-left: 24px; margin-right: auto; align-self: stretch; align-items: stretch;
    font: 400 14px/20px ${T.font}; color: ${T.fg2};
}
${ON} #${NS}-tabs span { display: flex; align-items: center; border-bottom: 3px solid transparent; padding-top: 3px; cursor: default; font-size: 14px !important; font-weight: 400 !important; color: ${T.fg2} !important; }
${ON} #${NS}-tabs span.${NS}-on { color: ${T.fg1} !important; font-weight: 600 !important; border-bottom-color: ${T.brand}; }

/* ---------- avatars: Teams-style initials instead of profile photos ---------- */
${ON} .${NS}-av { position: relative !important; }
${ON} .${NS}-av img, ${ON} .${NS}-av image { visibility: hidden !important; }
${ON} .${NS}-av::before {
    content: attr(data-${NS}-initials);
    position: absolute; inset: 0; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: var(--${NS}-av-bg); color: var(--${NS}-av-fg);
    font: 600 var(--${NS}-av-fs, 12px)/1 ${T.font};
    pointer-events: none; z-index: 1;
}
${ON} .${NS}-av[data-${NS}-initials=""]::after {
    content: ""; position: absolute; inset: 22%; z-index: 1;
    background: var(--${NS}-av-fg);
    -webkit-mask: ${MASKS.person} center / contain no-repeat; mask: ${MASKS.person} center / contain no-repeat;
    pointer-events: none;
}

${ON} * { scrollbar-color: ${T.stroke1} transparent; }

/* ---------- our title bar + rail (only exist while on Direct) ---------- */
#${NS}-titlebar {
    position: fixed; top: 0; left: 0; right: 0; height: ${TITLEBAR_H}px;
    display: flex; align-items: center; gap: 8px;
    padding: 0 12px 0 0;
    background: ${T.bg5}; color: ${T.fg1};
    font: 400 14px/20px ${T.font};
    z-index: 2147483000;
    user-select: none;
}
#${NS}-titlebar .${NS}-brand { display: flex; align-items: center; width: ${RAIL_W}px; justify-content: center; flex: none; }
#${NS}-titlebar .${NS}-appname { font-weight: 600; margin-right: 8px; white-space: nowrap; }
#${NS}-titlebar .${NS}-iconbtn {
    width: 32px; height: 32px; border-radius: 4px; border: 0; background: transparent;
    color: ${T.fg2}; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; flex: none;
}
#${NS}-titlebar .${NS}-iconbtn:hover { background: ${T.bg1Selected}; color: ${T.brand}; }
#${NS}-search {
    flex: 1 1 auto; max-width: 680px; margin: 0 auto; height: 32px;
    display: flex; align-items: center; gap: 8px; padding: 0 10px;
    background: ${T.bg1}; border: 1px solid ${T.stroke1}; border-bottom-color: ${T.fg4};
    border-radius: 4px; color: ${T.fg4}; cursor: text;
}
#${NS}-search:hover { border-color: ${T.fg4}; }
#${NS}-search input { all: unset; flex: 1; font: 400 14px/20px ${T.font}; color: ${T.fg1}; }
#${NS}-search input::placeholder { color: ${T.fg4}; }
#${NS}-titlebar .${NS}-right { display: flex; align-items: center; gap: 4px; margin-left: auto; }
#${NS}-me {
    width: 32px; height: 32px; border-radius: 50%; position: relative;
    background: var(--${NS}-av-bg, ${T.brandBg2}); color: var(--${NS}-av-fg, ${T.brand});
    display: flex; align-items: center; justify-content: center;
    font: 600 12px/1 ${T.font}; cursor: pointer; border: 0; padding: 0;
}
#${NS}-me::before { content: attr(data-${NS}-initials); }
#${NS}-me::after {
    content: ""; position: absolute; right: -1px; bottom: -1px; width: 10px; height: 10px;
    border-radius: 50%; background: ${T.green}; border: 2px solid ${T.bg5}; box-sizing: border-box;
}
#${NS}-rail {
    position: fixed; top: ${TITLEBAR_H}px; left: 0; bottom: 0; width: ${RAIL_W}px;
    display: flex; flex-direction: column; align-items: center; gap: 2px; padding-top: 4px;
    background: ${T.bg5}; z-index: 2147483000;
    font: 400 10px/14px ${T.font}; user-select: none;
}
#${NS}-rail button {
    all: unset; box-sizing: border-box; position: relative;
    width: 60px; height: 56px; border-radius: 4px;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
    color: ${T.fg3}; cursor: pointer; text-align: center;
}
#${NS}-rail button svg { width: 24px; height: 24px; }
#${NS}-rail button:hover { color: ${T.brand}; background: ${T.bg1Selected}; }
#${NS}-rail button.${NS}-active { color: ${T.brand}; font-weight: 600; }
#${NS}-rail button.${NS}-active svg { fill: ${T.brandBg2}; }
#${NS}-rail button.${NS}-active::before {
    content: ""; position: absolute; left: -4px; top: 14px; bottom: 14px; width: 3px;
    border-radius: 2px; background: ${T.brand};
}
#${NS}-rail .${NS}-badge {
    position: absolute; top: 6px; left: 34px; min-width: 16px; height: 16px; padding: 0 4px;
    border-radius: 8px; background: ${T.red}; color: #fff; font: 600 10px/16px ${T.font}; text-align: center;
    box-sizing: border-box;
}
#${NS}-rail .${NS}-spacer { flex: 1; }
#${NS}-toast {
    position: fixed; left: ${RAIL_W + 12}px; bottom: 24px; z-index: 2147483001;
    background: ${T.fg1}; color: #fff; padding: 8px 12px; border-radius: 4px;
    font: 400 12px/16px ${T.font}; box-shadow: ${T.shadow16};
    opacity: 0; transition: opacity .15s; pointer-events: none;
}
#${NS}-toast.${NS}-show { opacity: 1; }
`;

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------
    const isDirect = () => location.pathname.startsWith('/direct');
    const threadList = () => document.querySelector('[role=navigation][aria-label="Thread list"]');

    function addStyle(css, id) {
        const el = document.createElement('style');
        el.id = id;
        el.textContent = css;
        (document.head || document.documentElement).appendChild(el);
        return el;
    }

    // Copy the light-mode variable block onto .__fb-dark-mode (Direct pages
    // only) so Instagram renders its light palette even in dark mode.
    let lightModeDone = false;
    function forceLightMode() {
        if (lightModeDone) return;
        const decls = [];
        for (const sheet of document.styleSheets) {
            let rules;
            try { rules = sheet.cssRules; } catch (e) { continue; }
            for (const rule of rules) {
                if (rule.selectorText && rule.selectorText.includes('.__fb-light-mode')) {
                    for (const prop of rule.style) {
                        if (prop.startsWith('--')) decls.push(`${prop}: ${rule.style.getPropertyValue(prop)} !important;`);
                    }
                }
            }
        }
        if (decls.length < 50) return; // stylesheets not loaded yet
        const el = document.createElement('style');
        el.id = `${NS}-light`;
        el.textContent = `${ON}.__fb-dark-mode, ${ON} .__fb-dark-mode { ${decls.join('\n')} }`;
        // must come before our theme overrides so Teams values still win
        const ours = document.getElementById(`${NS}-style`);
        ours.parentNode.insertBefore(el, ours);
        lightModeDone = true;
    }

    function h(html) {
        const t = document.createElement('template');
        t.innerHTML = html.trim();
        return t.content.firstElementChild;
    }

    let toastTimer;
    function toast(msg) {
        let el = document.getElementById(`${NS}-toast`);
        if (!el) { el = h(`<div id="${NS}-toast"></div>`); document.body.appendChild(el); }
        el.textContent = msg;
        el.classList.add(`${NS}-show`);
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove(`${NS}-show`), 1600);
    }

    // ---------------------------------------------------------------------
    // Injected chrome
    // ---------------------------------------------------------------------
    const RAIL_ITEMS = [
        ['activity', 'Activity'],
        ['chat', 'Chat'],
        ['teams', 'Teams'],
        ['calendar', 'Calendar'],
        ['calls', 'Calls'],
        ['onedrive', 'OneDrive'],
        ['more', ''],
    ];

    function buildChrome() {
        if (document.getElementById(`${NS}-titlebar`)) return;

        const bar = h(`
<div id="${NS}-titlebar">
  <div class="${NS}-brand"><button class="${NS}-iconbtn" title="App launcher">${ICONS.waffle}</button></div>
  <img src="${LOGO_URL}" width="20" height="20" alt="">
  <span class="${NS}-appname">Microsoft Teams</span>
  <button class="${NS}-iconbtn" title="Back" data-act="back">${ICONS.back}</button>
  <button class="${NS}-iconbtn" title="Forward" data-act="fwd">${ICONS.fwd}</button>
  <label id="${NS}-search">${ICONS.search}<input type="text" placeholder="Search" aria-label="Search"></label>
  <div class="${NS}-right">
    <button class="${NS}-iconbtn" title="Settings and more">${ICONS.more}</button>
    <button id="${NS}-me" title="Your profile"></button>
  </div>
</div>`);

        const rail = h(`<nav id="${NS}-rail" aria-label="App bar"></nav>`);
        for (const [key, label] of RAIL_ITEMS) {
            const btn = h(`<button data-app="${key}" title="${label || 'More added apps'}">${ICONS[key]}<span>${label}</span></button>`);
            if (key === 'chat') btn.classList.add(`${NS}-active`);
            rail.appendChild(btn);
        }
        rail.appendChild(h(`<div class="${NS}-spacer"></div>`));
        rail.appendChild(h(`<button data-app="apps" title="Apps">${ICONS.apps}<span>Apps</span></button>`));

        bar.addEventListener('click', (e) => {
            const act = e.target.closest('[data-act]')?.dataset.act;
            if (act === 'back') history.back();
            if (act === 'fwd') history.forward();
        });

        // Title-bar search drives Instagram's own search box in the chat list.
        bar.querySelector('input').addEventListener('focus', () => {
            const real = threadList()?.querySelector('input');
            if (real) { real.focus(); real.click(); }
        });

        rail.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-app]');
            if (!btn) return;
            if (btn.dataset.app === 'chat') {
                const inbox = document.querySelector('a[href="/direct/inbox/"]');
                if (inbox) inbox.click(); else location.assign('/direct/inbox/');
            } else {
                toast(`${btn.title} isn't available right now. Try again later.`);
            }
        });

        document.body.append(bar, rail);
    }

    function removeChrome() {
        document.getElementById(`${NS}-titlebar`)?.remove();
        document.getElementById(`${NS}-rail`)?.remove();
    }

    // ---------------------------------------------------------------------
    // Tagging React-owned nodes (re-run on every DOM change, cheap)
    // ---------------------------------------------------------------------
    function tagLayout() {
        const list = threadList();
        if (!list) return;

        // Instagram's global nav column (Home, Reels, ...) - the full-height
        // ancestor of the Home link
        const home = document.querySelector('a[href="/"] svg[aria-label="Home"]')?.closest('a');
        if (home) {
            let col = home;
            while (col.parentElement && !(col.getBoundingClientRect().height >= innerHeight - 2 && col.getBoundingClientRect().x === 0)) col = col.parentElement;
            if (col.parentElement && !col.contains(list)) col.classList.add(`${NS}-ignav`);
        }

        // the container holding the chat list + conversation
        let shell = list.parentElement;
        while (shell && shell.getBoundingClientRect().width < list.getBoundingClientRect().width + 200) shell = shell.parentElement;
        if (shell && shell !== document.body) shell.classList.add(`${NS}-shell`);

        // list title (account switcher), notes carousel, "Messages" heading
        list.querySelector('h2')?.closest('[role=button], div')?.classList.add(`${NS}-listtitle`);
        const search = list.querySelector('input');
        if (!list.querySelector(`.${NS}-notes`)) {
            const note = [...list.querySelectorAll('ul li')].find((li) => /Your note/.test(li.textContent));
            // climb to the outermost block that is still just the carousel (with its arrows)
            let block = note?.closest('ul');
            while (block?.parentElement && block.parentElement !== list && block.parentElement.getBoundingClientRect().height < 200 && !block.parentElement.contains(search)) block = block.parentElement;
            block?.classList.add(`${NS}-notes`);
        }
        const heading = [...list.querySelectorAll('h1')].find((el) => el.textContent.trim() === 'Messages');
        heading?.classList.add(`${NS}-recent`);
        if (search && search.placeholder !== 'Search chats') search.placeholder = 'Search chats';

        // chat rows
        const current = location.pathname.match(/\/direct\/t\/([^/]+)/)?.[1];
        for (const row of list.querySelectorAll('[role=button]')) {
            if (!row.querySelector('img') || row.getBoundingClientRect().height < 50) continue;
            row.classList.add(`${NS}-row`);
            const name = [...row.querySelectorAll('span')].find((sp) => sp.childElementCount === 0 && sp.textContent.trim() && !sp.querySelector('img'));
            name?.classList.add(`${NS}-rowname`);
            row.classList.toggle(`${NS}-row-on`, !!current && getComputedStyle(row).backgroundColor !== 'rgba(0, 0, 0, 0)' && row.matches(':not(:hover)'));
        }

        const main = conversationPane(list);
        if (!main) return;

        // no chat open: Instagram's "Your messages" placeholder → Teams wording
        if (!headerInfo(main)) {
            for (const el of main.querySelectorAll('h2, span, div[role=button]')) {
                if (el.childElementCount !== 0) continue;
                const text = el.textContent.trim();
                if (text === 'Your messages') el.classList.add(`${NS}-empty-title`);
                else if (/^Send private photos/.test(text)) el.classList.add(`${NS}-empty-desc`);
                else if (text === 'Send message') el.classList.add(`${NS}-empty-btn`);
            }
            const art = [...main.querySelectorAll('svg')].find((el) => el.getBoundingClientRect().width >= 80);
            art?.parentElement.classList.add(`${NS}-empty-icon`);
        }

        // conversation header: the bar holding the name link/button
        const info = headerInfo(main);
        if (info) {
            let header = info.anchor.parentElement;
            while (header && header.getBoundingClientRect().width < main.getBoundingClientRect().width * 0.8) header = header.parentElement;
            // then out to the full-bleed bar (Instagram pads the inner one)
            while (header && header.parentElement && main.contains(header.parentElement) && header.parentElement !== main && header.parentElement.getBoundingClientRect().height < 130) header = header.parentElement;
            if (header) {
                header.classList.add(`${NS}-header`);
                addHeaderTabs(info.anchor);
                info.nameEl?.classList.add(`${NS}-hname`);
                // Teams shows the name only - drop the @username line under it
                info.extra.forEach((el) => el.classList.add(`${NS}-hide`));
                const MAP = { 'Audio Call': MASKS.call, 'Video Call': MASKS.video, 'Conversation information': MASKS.info };
                for (const icon of header.querySelectorAll('svg[aria-label]')) {
                    const mask = MAP[icon.getAttribute('aria-label')];
                    const btn = icon.closest('[role=button], a');
                    if (!mask || !btn) continue;
                    btn.classList.add(`${NS}-hbtn`);
                    btn.style.setProperty(`--${NS}-icon`, mask);
                }
            }
        }

        tagMessages(main);

        // composer
        const box = main.querySelector('[role=textbox]');
        if (box) {
            let wrap = box.parentElement;
            // the rounded pill around the input and its buttons
            while (wrap && wrap !== main && getComputedStyle(wrap).borderTopLeftRadius === '0px') wrap = wrap.parentElement;
            if (wrap && wrap !== main) wrap.classList.add(`${NS}-composer-box`);
            if (box.getAttribute('aria-placeholder') === 'Message...') box.setAttribute('aria-placeholder', 'Type a message');
            for (const el of (wrap || main).querySelectorAll('div, span')) {
                if (el.childElementCount === 0 && el.textContent === 'Message...') el.textContent = 'Type a message';
            }
        }
    }

    // 1:1 chats: <a aria-label="Open the profile page of USER">; groups and
    // self-chats: [role=button][aria-label="Open the details pane of the chat"]
    function headerInfo(main) {
        const anchor = main?.querySelector('a[aria-label^="Open the profile page of "], [role=button][aria-label="Open the details pane of the chat"]');
        if (!anchor) return null;
        const leaves = [...anchor.querySelectorAll('span')].filter((sp) => sp.childElementCount === 0 && sp.textContent.trim());
        const label = anchor.getAttribute('aria-label');
        return {
            anchor,
            nameEl: leaves[0] || null,
            name: leaves[0]?.textContent.trim() || '',
            username: label.startsWith('Open the profile page of ') ? label.slice('Open the profile page of '.length) : (leaves[1]?.textContent.trim() || ''),
            extra: leaves.slice(1),
        };
    }

    // the right-hand pane: sibling of the chat list inside the shell
    function conversationPane(list) {
        const shell = list.closest(`.${NS}-shell`);
        if (!shell) return null;
        return [...shell.querySelectorAll('div')].find((el) => {
            const r = el.getBoundingClientRect();
            return !el.contains(list) && r.x > list.getBoundingClientRect().right - 2 && r.height > innerHeight * 0.6;
        }) || null;
    }

    function addHeaderTabs(anchor) {
        if (!anchor || anchor.nextElementSibling?.id === `${NS}-tabs`) return;
        document.getElementById(`${NS}-tabs`)?.remove();
        const tabs = h(`<div id="${NS}-tabs"><span class="${NS}-on">Chat</span><span>Shared</span><span>Recap</span></div>`);
        anchor.insertAdjacentElement('afterend', tabs);
    }

    function myUsername() {
        return threadList()?.querySelector('h2')?.textContent.trim() || '';
    }

    // Each message is a [role=group]; its hidden action labels read
    // "React to message from <username>", which tells us who sent it.
    function tagMessages(main) {
        const me = myUsername();
        const info = headerInfo(main);
        const headerName = info?.name || '';
        const headerUser = info?.username || '';
        let prev = null;
        for (const group of main.querySelectorAll('[role=group]')) {
            const title = [...group.querySelectorAll('svg title')].map((t) => t.textContent).find((t) => /^React to message from /.test(t));
            if (!title) continue;
            const sender = title.replace(/^React to message from /, '').trim();
            const outgoing = sender === me;
            const display = sender === headerUser && headerName ? headerName : sender;

            const text = group.querySelector('[role=article] [dir=auto]');
            const bubble = text?.closest('[role=presentation]');
            if (bubble && getComputedStyle(bubble).borderTopLeftRadius !== '0px') {
                bubble.classList.add(`${NS}-bubble`, outgoing ? `${NS}-out` : `${NS}-in`);
                const want = !outgoing && sender !== prev ? display : null;
                const cur = bubble.getAttribute(`data-${NS}-meta`);
                if (want && cur !== want) bubble.setAttribute(`data-${NS}-meta`, want);
                if (!want && cur !== null) bubble.removeAttribute(`data-${NS}-meta`);
            }
            // sender avatar next to incoming messages
            for (const img of group.querySelectorAll('img[alt="user-profile-picture"]')) {
                const size = img.getBoundingClientRect().width;
                if (size && size <= 48) paintAvatar(avatarBox(img), display);
            }
            prev = sender;
        }
    }

    // ---------------------------------------------------------------------
    // Avatars
    // ---------------------------------------------------------------------
    // Fluent's Avatar: initials from the first and last word, colour picked by
    // hashing the name, so the same person always gets the same colour.
    function initialsOf(name) {
        const words = String(name).replace(/[([{].*?[)\]}]/g, '').split(/[\s._]+/)
            .map((w) => (w.match(/[\p{L}\p{N}]/u) || [''])[0])
            .filter(Boolean);
        if (!words.length) return '';
        return (words.length > 1 ? words[0] + words[words.length - 1] : words[0]).toUpperCase();
    }
    function colorOf(name) {
        let hash = 0;
        for (let i = name.length - 1; i >= 0; i--) {
            const ch = name.charCodeAt(i);
            const shift = i % 8;
            hash ^= (ch << shift) + (ch >> (8 - shift));
        }
        return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
    }
    function paintAvatar(box, name) {
        box.classList.add(`${NS}-av`); // React may reset className, so always re-add
        if (box.dataset[`${NS}Name`] === name) return;
        box.dataset[`${NS}Name`] = name;
        const [bg, fg] = colorOf(name);
        box.setAttribute(`data-${NS}-initials`, initialsOf(name));
        box.style.setProperty(`--${NS}-av-bg`, bg);
        box.style.setProperty(`--${NS}-av-fg`, fg);
        // offsetWidth is in the box's own (pre-zoom) pixels, which is what font-size uses
        box.style.setProperty(`--${NS}-av-fs`, `${Math.max(8, Math.round(box.offsetWidth * 0.4))}px`);
    }
    // the outermost element that is exactly the size of the photo
    function avatarBox(img) {
        const r = img.getBoundingClientRect();
        let box = img.parentElement;
        while (box.parentElement) {
            const pr = box.parentElement.getBoundingClientRect();
            if (Math.abs(pr.width - r.width) > 1 || Math.abs(pr.height - r.height) > 1) break;
            if (box.parentElement.matches('a, [role=button], [role=presentation]')) break;
            box = box.parentElement;
        }
        return box;
    }

    function syncAvatars() {
        const list = threadList();
        if (!list) return;
        for (const row of list.querySelectorAll(`.${NS}-row`)) {
            const name = row.querySelector(`.${NS}-rowname`)?.textContent.trim();
            const img = row.querySelector('img[alt="user-profile-picture"], img');
            if (name && img && img.getBoundingClientRect().width) paintAvatar(avatarBox(img), name);
        }
        const info = headerInfo(conversationPane(list));
        const headerImg = info?.anchor.querySelector('img');
        if (headerImg && info.name && headerImg.getBoundingClientRect().width) paintAvatar(avatarBox(headerImg), info.name);

        const me = document.getElementById(`${NS}-me`);
        const myName = myUsername();
        if (me && myName && me.dataset[`${NS}Name`] !== myName) {
            me.dataset[`${NS}Name`] = myName;
            me.setAttribute(`data-${NS}-initials`, initialsOf(myName).slice(0, 1));
            const [bg, fg] = colorOf(myName);
            me.style.setProperty(`--${NS}-av-bg`, bg);
            me.style.setProperty(`--${NS}-av-fg`, fg);
            me.title = myName;
        }
    }

    function syncBadge() {
        const n = (titleDesc.get.call(document).match(/^\((\d+)\)/) || [])[1] || lastUnread;
        const btn = document.querySelector(`#${NS}-rail button[data-app="chat"]`);
        if (!btn) return;
        let badge = btn.querySelector(`.${NS}-badge`);
        if (n) {
            if (!badge) { badge = h(`<span class="${NS}-badge"></span>`); btn.appendChild(badge); }
            badge.textContent = n;
        } else if (badge) {
            badge.remove();
        }
    }

    // ---------------------------------------------------------------------
    // Tab title + favicon (only while on Direct)
    // ---------------------------------------------------------------------
    const titleDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'title');
    let lastUnread = null;
    let rawTitle = null; // Instagram's own latest title, so the name can refresh later
    function disguiseTitle(raw) {
        raw = String(raw);
        if (!raw.endsWith('| Microsoft Teams')) rawTitle = raw;
        if (!isDirect()) return rawTitle ?? raw;
        lastUnread = ((rawTitle ?? raw).match(/^\((\d+)\)/) || [])[1] || null;
        const list = threadList();
        const who = list && headerInfo(conversationPane(list))?.name;
        return `${lastUnread ? `(${lastUnread}) ` : ''}Chat${who ? ` | ${who}` : ''} | Microsoft Teams`;
    }
    function hookTitle() {
        Object.defineProperty(document, 'title', {
            configurable: true,
            get() { return titleDesc.get.call(this); },
            set(v) { titleDesc.set.call(this, disguiseTitle(v)); },
        });
        new MutationObserver(fixTitle).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    }
    function fixTitle() {
        const cur = titleDesc.get.call(document);
        const want = disguiseTitle(cur);
        if (cur !== want) titleDesc.set.call(document, want);
    }

    // Instagram's icon <link>s are parked (rel renamed) rather than removed,
    // so they can be restored when leaving Direct.
    function fixFavicon(active) {
        if (!document.head) return;
        let ours = document.getElementById(`${NS}-icon`);
        if (active) {
            for (const l of document.head.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]')) {
                if (l === ours) continue;
                l.dataset[`${NS}Rel`] = l.rel;
                l.rel = `${NS}-parked`;
            }
            if (!ours) {
                ours = document.createElement('link');
                ours.id = `${NS}-icon`;
                ours.rel = 'icon';
                ours.type = 'image/svg+xml';
                ours.href = LOGO_URL;
                document.head.appendChild(ours);
            }
        } else if (ours) {
            ours.remove();
            for (const l of document.head.querySelectorAll(`link[rel="${NS}-parked"]`)) l.rel = l.dataset[`${NS}Rel`];
        }
    }

    // ---------------------------------------------------------------------
    // Boot
    // ---------------------------------------------------------------------
    addStyle(CSS, `${NS}-style`);
    hookTitle();

    let scheduled = false;
    function tick() {
        scheduled = false;
        try {
            const active = isDirect();
            document.documentElement.classList.toggle(`${NS}-on`, active);
            fixFavicon(active);
            if (!active) { removeChrome(); return; }
            forceLightMode();
            if (document.body) buildChrome();
            tagLayout();
            syncAvatars();
            syncBadge();
            fixTitle();
            if (document.querySelector(`.${NS}-shell`) && document.querySelector(`.${NS}-av`)) document.documentElement.classList.remove(`${NS}-loading`);
        } catch (err) {
            console.warn('[teams-skin]', err);
        }
    }
    const schedule = () => {
        if (scheduled) return;
        scheduled = true;
        setTimeout(tick, 30); // not rAF: that pauses in background tabs
    };

    // Hide the page until the layout is tagged; give up after 6s so a changed
    // page never stays blank.
    if (location.pathname.startsWith('/direct')) document.documentElement.classList.add(`${NS}-loading`);
    setTimeout(() => document.documentElement.classList.remove(`${NS}-loading`), 6000);

    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
    // Some bubbles/photos finish painting after the last DOM change, so re-check
    // every second too (throttled to ~1/min by the browser in background tabs).
    setInterval(schedule, 1000);
    window.addEventListener('resize', schedule);
    window.addEventListener('popstate', schedule);
    schedule();
})();
