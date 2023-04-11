let currentTheme = 'default';
let currentThemeElement: HTMLLinkElement;
(function mountLess() {
    let ele = document.createElement('link');
    ele.rel = 'stylesheet';
    ele.type = 'text/css';
    ele.href = `theme-${currentTheme}.css`;
    document.head.appendChild(ele);
    currentThemeElement = ele;
})();