FROM node:20-bullseye

WORKDIR /workspace

ARG UID=1000
ARG GID=1000

RUN apt-get update -y \
  && apt-get upgrade -y \
  && apt-get install -y --no-install-recommends \
    sudo \
  && apt-get -y clean \
  && rm -rf /var/lib/apt/lists/* \
  && echo 'node:node' | chpasswd \
  && gpasswd -a node sudo

USER node
