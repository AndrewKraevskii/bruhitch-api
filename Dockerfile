FROM node:16 as build

# install dependencies
WORKDIR /app
COPY package.json yarn.lock ./
COPY prisma ./prisma/
RUN yarn run ci

# Copy all local files into the image.
COPY . .

RUN yarn run build

###
# Only copy over the Node pieces we need
# ~> Saves 35MB
###
FROM node:16 as App

WORKDIR /app
COPY --from=build /app/build/. ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/yarn.lock ./
COPY --from=build /app/prisma ./prisma/


EXPOSE 3005
CMD ["node", "./build/index.js"]