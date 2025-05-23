# Orders MicroService

```
docker compose up -d
```

## Development Steps

1. Clone the project
2. Create a `.env` file based on the `.env.template` file
3. Start the database with `docker compose up -d`
4. Start the NATS server
```
docker run -d --name nats-server -p 4222:4222 -p 8222:8222 nats
```
5. Start the project with `npm run start:dev`