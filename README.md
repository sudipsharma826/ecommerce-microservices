# Ecommerce Microservices

An ecommerce backend built with NestJS microservices. The system is split into a gateway and three domain services so orders, payments, and notifications can scale independently.

## Overview

The project uses a gateway service as the public entry point and RabbitMQ to coordinate work between services. MongoDB is used for persistence in the order and payment services, while the notification service sends payment confirmation emails.

## Services

- Gateway: exposes HTTP endpoints for product lookup, order placement, and payment verification.
- Order service: handles product retrieval, order creation, order status updates, and payment-related events.
- Payment service: processes payment requests, verifies payment callbacks, and publishes follow-up events.
- Notification service: listens for payment confirmation events and sends notification emails.

## Main Flow

1. The gateway receives a request to place an order.
2. The order service creates the order and forwards payment processing to the payment service.
3. The payment service returns a payment URL and emits payment status events through RabbitMQ.
4. After payment verification, the payment service confirms the order and triggers the notification service.

## Tech Stack

- NestJS
- TypeScript
- RabbitMQ
- MongoDB and Mongoose
- Resend for email delivery
- Axios and RxJS for service integration

## Environment Variables

Each service loads its own `.env` file from its app folder.

- `PORT` for the gateway HTTP port
- `DATABASE_URL` for MongoDB connections
- `RABBITMQ_URL` for RabbitMQ access
- `ORDER_SERVICE_QUEUE` for order service messaging
- `PAYMENT_SERVICE_QUEUE` for payment service messaging
- `NOTIFICATION_SERVICE_QUEUE` for notification service messaging
- `RABBITMQ_ORDER_QUEUE` for the notification service order queue fallback

## Run Locally

```bash
npm install
```

Start the gateway:

```bash
npm run start:dev:gateway
```

Start the order service:

```bash
npm run start:dev:order
```

Start the payment service:

```bash
npm run start:dev:payment
```

Start the notification service:

```bash
npm run start:dev:notification
```

## API Endpoints

- `GET /` returns a basic health response from the gateway.
- `GET /getProducts` returns available products.
- `POST /place-order` creates an order.
- `POST /verifyPayment` verifies a payment using `orderId` and `pidx`.
- `GET /payment/verify` handles the payment provider callback.

## Scripts

- `npm run build` builds the project.
- `npm run test` runs unit tests.
- `npm run test:e2e` runs end-to-end tests.
- `npm run lint` checks and fixes lint issues.

## License

MIT