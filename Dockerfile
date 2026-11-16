FROM node@sha256:116b800c3754b440ee0aa3ed2f20f5bf3d99a554bfd9adeea09ea8017f6e85f5 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=secret,id=build_ca,target=/tmp/build_ca if [ -f /tmp/build_ca ]; then export NODE_EXTRA_CA_CERTS=/tmp/build_ca; fi; npm ci --omit=dev --ignore-scripts
COPY . .
RUN node scripts/build_site.mjs

FROM node@sha256:116b800c3754b440ee0aa3ed2f20f5bf3d99a554bfd9adeea09ea8017f6e85f5
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/public ./public
COPY server ./server
USER node
EXPOSE 3000 9464
CMD ["node", "server/main.mjs"]
