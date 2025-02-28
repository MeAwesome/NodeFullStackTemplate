ARG NODE_VERSION

FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /project

FROM base AS deps

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --production --frozen-lockfile

COPY package.json .

FROM deps AS build

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile

COPY . .

RUN yarn build --noprompts

FROM base AS production

ARG PORT

COPY package.json .

COPY --from=deps /project/node_modules ./node_modules
COPY --from=build /project/dist ./dist
COPY --from=build /project/build ./build
COPY --from=build /project/config.json ./config.json
COPY --from=build /project/tsconfig.json ./tsconfig.json

EXPOSE ${PORT}

CMD ["yarn", "start"]