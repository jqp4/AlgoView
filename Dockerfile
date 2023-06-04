FROM node

WORKDIR /app
COPY . .

RUN npm install
RUN mkdir -p logs
RUN mkdir -p uploadFiles
RUN mkdir -p public/AlgoViewCode/data

RUN (cd ./architect && make && mv main ../scripts)

ENV PORT 3001
EXPOSE $PORT

VOLUME [ "/app/uploadFiles" ]

# INFO: использовать dev вместо start для разработки
CMD ["npm", "run", "start"]
