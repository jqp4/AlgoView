FROM node

WORKDIR /app
COPY . .

SHELL [ "/bin/bash", "-l", "-c" ]

RUN npm install
RUN mkdir -p logs
RUN mkdir -p uploadFiles
RUN mkdir -p public/AlgoViewPage/data

RUN (rm -rf scripts/main && cd ./architect && make && mv main ../scripts)

# RUN rm -rf scripts/main
# RUN cd ./architect
# RUN make 
# RUN mv main ../scripts

ENV PORT 3001
EXPOSE $PORT

VOLUME [ "/app/uploadFiles" ]

# INFO: использовать dev вместо start для разработки
CMD ["npm", "run", "start"]
