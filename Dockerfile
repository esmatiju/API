# base image
FROM node:lts

# clone repository
RUN apt-get -qy update && apt-get install -yq --no-install-recommends \
        openssl \
        git \
        curl

RUN git clone --branch dev https://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@github.com/esmatiju/API.git

# create & set working directory
COPY . /API

WORKDIR /API

# install dependencies
RUN curl -fsSL https://deb.nodesource.com/setup_current.x | bash - && \
    apt-get install -y nodejs \
    build-essential && \
    node --version && \
    npm --version


RUN npm install
RUN npm install @prisma/client
RUN npx prisma migrate dev -n migration
RUN node prisma/seed.js || true

COPY . .

# launch app
ENTRYPOINT ["node", "src/server.js"]