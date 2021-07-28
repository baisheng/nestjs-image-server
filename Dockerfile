# Dockerfile 文件
FROM node:14-alpine
# 设置镜像作者
MAINTAINER baisheng <baisheng@gmail.com>
# 设置时区
RUN sh -c "echo 'Asia/Shanghai' > /etc/timezone"
# 使用 aliyun 仓库加速
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
# 以下软件根据实际情况选择是否安装
#RUN apk add --no-cache make gcc g++ python git
# Nodejs 服务的淘宝源配置
RUN npm config set registry https://npm.jiyang-health.com && \
    npm config set disturl https://npm.taobao.org/dist && \
    npm config set sharp_binary_host https://npm.taobao.org/mirrors/sharp && \
    npm config set sharp_libvips_binary_host https://npm.taobao.org/mirrors/sharp-libvips && \
    npm config set electron_mirror https://npm.taobao.org/mirrors/electron/ && \
    npm config set sass_binary_site https://npm.taobao.org/mirrors/node-sass/ && \
    npm config set phantomjs_cdnurl https://npm.taobao.org/mirrors/phantomjs/
WORKDIR /app
COPY ./package.json .
#apk --no-cache add --virtual builds-deps build-base python
RUN apk update && apk upgrade \
        && apk add --no-cache bash \
        && apk add --no-cache git \
        && apk add --no-cache make gcc g++ \
        && apk --no-cache add --virtual builds-deps build-base python \
        && npm install -g nodemon cross-env eslint npm-run-all node-gyp node-pre-gyp && npm install \
        && npm rebuild bcrypt --build-from-source \
        && npm install -g @nestjs/cli \
        && npm install -g gulp
#        && rm -rf node_modules/sharp \
#        && npm install --arch=x64 --latform=linux sharp
COPY . /app
#COPY ./server/fix/ /app/node_modules

RUN yarn build
EXPOSE 5001

