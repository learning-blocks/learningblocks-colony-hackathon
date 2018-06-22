# You should always specify a full version here to ensure all of your developers
# are running the same version of Node.
FROM node:carbon

# The base node image sets a very verbose log level.
ENV NPM_CONFIG_LOGLEVEL warn


# Install and configure `serve`.
RUN yarn global add pushstate-server
CMD pushstate-server build_webpack
EXPOSE 9000

# Install dependencies
COPY package.json .
COPY yarn.lock .
RUN yarn

# Copy sources
COPY . .

# Build frontend for production.
RUN yarn run build
