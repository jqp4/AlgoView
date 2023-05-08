# AlgoView (2.0)

## Node JS Server

### 1. Install dependencies

```bash
npm install
```

### 2. Create folder uploadFiles

```bash
mkdir uploadFiles
```

### 3. Run web server in dev mode

```bash
npm run dev
```

### 4. Go to <http://localhost:3001>

---

### Info

* Upload file with Koa: <https://betterprogramming.pub/a-complete-guide-of-file-uploading-in-javascript-2c29c61336f5>
* Run python script: <https://medium.com/swlh/run-python-script-from-node-js-and-send-data-to-browser-15677fcf199f>
* Alternatives To Heroku For hosting a NodeJS app: <https://youtu.be/q8GSWGu2roA>


---
## Docker
### Сборка образа
```bash
docker build -t algoview .
```

### Создание и запуск контейнера
При остановке контейнер удаляется, кроме данных в папке uploadFiles
```bash
docker run -d -p 3001:3001 -v uploadFiles:/app/uploadFiles --rm --name algoview algoview
```

### Создание и запуск контейнера в DEV MODE
```bash
docker run -d -p 3001:3001 -v ".:/app" -v uploadFiles:/app/uploadFiles -v /app/node_modules --rm --name algoview algoview
```


## 4. Go to 
<http://localhost:3001>

## Docker дополнительно
### Остановка контейнера
```bash
docker stop algoview
```

### Удаление образа
```
docker image rm algoview
```

### Запущенные контейнеры
```
docker ps
```