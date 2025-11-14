FROM node:alpine
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files first to leverage caching
COPY package.json pnpm-lock.yaml tsconfig.json nest-cli.json ./

# Install dependencies including @nestjs/cli (which should be in package.json devDependencies)
RUN pnpm install --include=dev

# Copy all source files
COPY . .

EXPOSE 3000

# Use local CLI from node_modules with pnpm run build script
RUN pnpm run build

CMD ["pnpm", "run", "start:prod"]
