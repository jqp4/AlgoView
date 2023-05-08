FROM node

WORKDIR /app
COPY . .

RUN npm install
RUN mkdir -p uploadFiles

RUN (cd ./architect && make && mv main ../scripts)

ENV PORT 3001
EXPOSE $PORT

VOLUME [ "/app/uploadFiles" ]

# INFO использовать dev для разработки
CMD ["npm", "run", "start"]
