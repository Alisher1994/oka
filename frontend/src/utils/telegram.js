// Telegram WebApp utilities
export const isTelegram = () => {
  return window.Telegram && window.Telegram.WebApp;
};

export const getTelegramWebApp = () => {
  if (isTelegram()) {
    return window.Telegram.WebApp;
  }
  return null;
};

export const getTelegramUser = () => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.initDataUnsafe && webApp.initDataUnsafe.user) {
    return webApp.initDataUnsafe.user;
  }
  return null;
};

export const getTelegramUserId = () => {
  const user = getTelegramUser();
  return user ? user.id : null;
};

export const expandTelegramApp = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.expand();
  }
};

export const closeTelegramApp = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.close();
  }
};

export const showTelegramMainButton = (text, onClick) => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.MainButton.setText(text);
    webApp.MainButton.show();
    webApp.MainButton.onClick(onClick);
  }
};

export const hideTelegramMainButton = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.MainButton.hide();
  }
};

export const showTelegramBackButton = (onClick) => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.BackButton.show();
    webApp.BackButton.onClick(onClick);
  }
};

export const hideTelegramBackButton = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.BackButton.hide();
  }
};

export const setTelegramHeaderColor = (color) => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.setHeaderColor(color);
  }
};

export const setTelegramBackgroundColor = (color) => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.setBackgroundColor(color);
  }
};

export const initTelegramWebApp = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.ready();
    webApp.expand();
    return true;
  }
  return false;
};
