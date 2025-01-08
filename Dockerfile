FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/crmapi

# Create required directories
RUN mkdir -p \
    /usr/src/crmapi/gluster-data/media/uploadedFiles/ \
    /usr/src/crmapi/gluster-data/media/ticket-excel/ \
    /usr/src/crmapi/gluster-data/media/paymentInputs/

# Install dependencies
RUN apk add --no-cache \
    bash \
    g++ \
    ca-certificates \
    lz4-dev \
    musl-dev \
    cyrus-sasl-dev \
    openssl-dev \
    make \
    python3

# Install build dependencies
RUN apk add --no-cache --virtual .build-deps \
    gcc \
    zlib-dev \
    libc-dev \
    bsd-compat-headers \
    py-setuptools \
    git \
    gcompat

# Set npm mirror
ENV NODEJS_ORG_MIRROR=https://nodejs.org/download/release

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install npm packages
RUN npm install --verbose && \
    npm install bcrypt@4.0.1 --verbose

# Copy application code
COPY . .

# Remove .git directory
RUN rm -rf .git

# Copy libcouchbase
RUN cp /usr/src/crmapi/node_modules/inventyv-datalayer-pkg/lib/libcouchbase.so.6 /usr/lib/

# Cleanup
RUN apk del python3 make g++ gcc .build-deps

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]
