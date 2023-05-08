CONTAINER_PORT=3001
LOCAL_PORT=3001

IMAGE_NAME = jqp4x/algoview:v1.0

build:
	docker build -t $(IMAGE_NAME) .

run:
	docker run -d -p $(LOCAL_PORT):$(CONTAINER_PORT) -v uploadFiles:/app/uploadFiles --rm --name algoview $(IMAGE_NAME)
	echo "Port: " $(LOCAL_PORT)

run-dev:
	docker run -d -p $(LOCAL_PORT):$(CONTAINER_PORT) -v ".:/app" -v uploadFiles:/app/uploadFiles -v /app/node_modules --rm --name algoview $(IMAGE_NAME)
	echo "Port: " $(LOCAL_PORT)

stop:
	docker stop algoview

remove:
	docker image rm $(IMAGE_NAME)

push-to-hub:
	docker push $(IMAGE_NAME)


	