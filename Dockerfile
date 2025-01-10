FROM harshalpatel2810/nodeminimal:20.17.0

# Create app directory
RUN mkdir -p /usr/src/crmapi
RUN mkdir -p /usr/src/crmapi/gluster-data/media/uploadedFiles/
RUN mkdir -p /usr/src/crmapi/gluster-data/media/ticket-excel/
RUN mkdir -p /usr/src/crmapi/gluster-data/media/paymentInputs/

WORKDIR /usr/src/crmapi


RUN apk add --no-cache bash

#For node-rdkafka when used with Alpine - START
RUN apk --no-cache add bash g++ ca-certificates  lz4-dev  musl-dev cyrus-sasl-dev  openssl-dev make python3 
RUN apk add --no-cache --virtual .build-deps gcc zlib-dev libc-dev bsd-compat-headers py-setuptools bash git gcompat


# Bundle app source
COPY . /usr/src/crmapi
RUN rm -rf .git

ENV NODEJS_ORG_MIRROR=https://nodejs.org/download/release
#Install npm packages
RUN npm install --verbose

#RUN cp /usr/src/crmapi/node_modules/inventyv-datalayer-pkg/lib/libcouchbase.so.6 /usr/lib/

# Install couchbase and bcrypt 
#RUN npm install bcrypt@4.0.1 --verbose

#  couchbase@2.6.11
# RUN npm install node-rdkafka@3.1.0 --verbose

# Remove App dependencies
RUN apk del python3 make g++ gcc

# Expose the port
EXPOSE 3000

# Start Node.js Application with Cluster.js
CMD [ "node", "server.js" ] 
