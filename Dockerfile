FROM node

COPY cornucopia_online/package.json /fe_buildDep/package.json

WORKDIR /fe_buildDep
RUN npm install

COPY backend/package.json /app_dep/package.json

WORKDIR /app_dep
RUN npm install

COPY cornucopia_online /fe_buildfolder
COPY backend /app

RUN mv /fe_buildDep/node_modules /fe_buildfolder/node_modules
RUN mv /app_dep/node_modules /app/node_modules

WORKDIR /fe_buildfolder
RUN npm run build
RUN mv /fe_buildfolder/build /app/build

WORKDIR /app

RUN rm -rf /fe_buildfolder
RUN rm -rf /app_dep
RUN rm -rf /fe_buildDep

CMD [ "node", "main.js" ]