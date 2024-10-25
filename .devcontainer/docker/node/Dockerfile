FROM node:20-bookworm

WORKDIR /workspace

RUN apt-get update -y \
  && apt-get upgrade -y \
  && apt-get install -y --no-install-recommends \
  sudo \
  # 日本語フォント
  fonts-ipafont-gothic \
  fonts-ipafont-mincho \
  # chromium
  libnss3 \
  libnspr4 \
  libdbus-1-3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  libatspi2.0-0 \
  # firefox
  libx11-xcb1 \
  libxcursor1 \
  libxi6 \
  libxtst6 \
  libpangocairo-1.0-0 \
  libpangoft2-1.0-0 \
  libgtk-3-0 \
  # webkit
  gstreamer1.0-libav \
  gstreamer1.0-plugins-base \
  gstreamer1.0-plugins-good \
  gstreamer1.0-plugins-bad \
  gstreamer1.0-plugins-ugly \
  gstreamer1.0-alsa \
  gstreamer1.0-gl \
  gstreamer1.0-gtk3 \
  gstreamer1.0-pulseaudio \
  gstreamer1.0-tools \
  gstreamer1.0-plugins-base-apps \
  libwoff1 \
  libharfbuzz-icu0 \
  libenchant-2-2 \
  libsecret-1-0 \
  libhyphen0 \
  libmanette-0.2-0 \
  && apt-get -y clean \
  && rm -rf /var/lib/apt/lists/* \
  && echo 'node:node' | chpasswd \
  && gpasswd -a node sudo

USER node
