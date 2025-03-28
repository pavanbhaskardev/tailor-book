# Tailor Book

Tailor book is a web-app which simplify's the tailors order-management process and provides customers details of there orders

### 💪 Built on

- Nextjs
- Tankstack Query (state managment)
- ShadCN (UI components)
- TailwindCSS (styling)
- Framer-motion (animations)
- MongoDB (database)
- Mongoose (data-modeling & queuring)
- Clerk (authentication)
- AWS S3 (image storage)
- Resend (emails)

### Getting Started

- Create `.env` file use the env-example for reference
- Run this commands to start development server

```bash
# Installing all dependecies
pnpm i

# To start server
pnpm dev
```

### 📁 Folder structure

```
src
|-app
|  |--api (all route handlers are written here)
|-components
|-lib
|-modals (database collections are written here)
|-middleware.ts

```

### Useful resources

- [Clerk](https://clerk.com)
- [Tanstack Query](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Resend](https://resend.com/docs/send-with-nextjs)
- [Framer motion](https://motion.dev/docs/framer)
