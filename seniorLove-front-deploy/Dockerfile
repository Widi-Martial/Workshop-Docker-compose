# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.15.1
ARG PNPM_VERSION=9.12.0

# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine AS base

ENV NODE_ENV=development

# Set working directory for all build stages.
WORKDIR /usr/src/app

# Copy the rest of the source files into the image.
COPY . .   
# Install pnpm globally.
RUN npm install -g pnpm@${PNPM_VERSION}

# Copy package.json and pnpm-lock.yaml (if exists).
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies only.
FROM base AS deps
RUN pnpm install


# Create a new stage to run the application.
FROM base AS final

# Copy the production dependencies from the deps stage and also the built application from the build stage into the image.
COPY --from=deps /usr/src/app/node_modules ./node_modules
# Uncomment the next line if you build assets
# COPY --from=build /usr/src/app/dist ./dist

# Expose the port that the application listens on.
EXPOSE 3000

USER root
RUN chown -R node:node /usr/src/app

USER node
# Run the application.
CMD ["pnpm", "run", "dev"]
