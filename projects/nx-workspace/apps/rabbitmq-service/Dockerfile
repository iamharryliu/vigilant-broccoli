FROM rabbitmq:3-management-alpine
COPY ./deployment-configs/fly-configs/rabbitmq-service.prod.conf /etc/rabbitmq/rabbitmq.conf
RUN rabbitmq-plugins enable rabbitmq_management
