# Frontend Dockerfile (Vite)
FROM node:24-alpine AS build
WORKDIR /usr/src/app
COPY package.json yarn.lock* package-lock.json* ./
RUN npm install
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ARG VITE_API_BASE
ENV VITE_API_BASE=${VITE_API_BASE}
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./dist
# serve with a lightweight static server
RUN npm i -g serve
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]