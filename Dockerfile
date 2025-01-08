FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/crmapi

# Install build dependencies first
RUN apk add --no-cache \
    bash \
    g++ \
    make \
    python3 \
    git \
    expat \
    expat-dev

# Install build tools
RUN apk add --no-cache --virtual .build-deps \
    gcc \
    libc-dev \
    linux-headers \
    ca-certificates \
    lz4-dev \
    musl-dev \
    cyrus-sasl-dev \
    openssl-dev \
    zlib-dev \
    bsd-compat-headers \
    py-setuptools \
    gcompat

# Create required directories
RUN mkdir -p \
    gluster-data/media/uploadedFiles/ \
    gluster-data/media/ticket-excel/ \
    gluster-data/media/paymentInputs/

# Copy package files
COPY package*.json ./

# Install dependencies with specific flags for node-expat
RUN npm install --build-from-source --verbose && \
    npm install bcrypt@4.0.1 --verbose

# Copy application code
COPY . .

# Copy libcouchbase
# RUN cp /usr/src/crmapi/node_modules/inventyv-datalayer-pkg/lib/libcouchbase.so.6 /usr/lib/

# Cleanup
RUN apk del .build-deps

EXPOSE 3000

CMD ["node", "server.js"]
