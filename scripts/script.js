// Init TWA
Telegram.WebApp.ready();

// Event occurs whenever theme settings are changed in the user's Telegram app (including switching to night mode).
Telegram.WebApp.onEvent('themeChanged', function () {
    document.documentElement.className = Telegram.WebApp.colorScheme;
});

// Show main button
Telegram.WebApp.MainButton.setParams({
    text: 'Save city'
});
Telegram.WebApp.MainButton.onClick(function () {
    // Telegram.WebApp.showAlert('Main Button was clicked')
});

Telegram.WebApp.BackButton.onClick(function () {
    togglePage();
});

// Function to toggle main TWA button
function toggleMainButton() {
    if (Telegram.WebApp.MainButton.isVisible) {
        Telegram.WebApp.MainButton.hide();
    } else {
        Telegram.WebApp.MainButton.show();
    }
};

function toggleBackButton() {
    if (Telegram.WebApp.BackButton.isVisible) {
        Telegram.WebApp.BackButton.hide();
    } else {
        Telegram.WebApp.BackButton.show();
    }
}

function togglePage() {
    toggleShowAutocomplete()
    toggleShowWeather()
    toggleBackButton()
}

Telegram.WebApp.setHeaderColor('bg_color');