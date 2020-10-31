# Server

The Server is designed to match [Relay Server Specification](https://relay.dev/docs/en/graphql-server-specification) and uses mongo as the database.

## General commands

|     command     | function                                    |
| :-------------: | :------------------------------------------ |
|      build      | build server                                |
|      clean      | delete webpack out                          |
| copy-to-project | copy schema to be accessible to all project |
|  database:seed  | seed database                               |
|     graphql     | run development graphql server              |
|  serve:graphql  | run production graphql server               |
|      test       | test server                                 |
|   test:watch    | test server and watch for file changes      |
|  update-schema  | update GraphQL schema                       |
